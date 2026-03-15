import { Router } from 'express';
import { execFile } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const claudeAuthRouter = Router();

const CLIENT_ID = '9d1c250a-e61b-44d9-88ed-5944d1962f5e';
const SCOPES =
  'org:create_api_key user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload';
const REDIRECT_URI = 'https://console.anthropic.com/oauth/code/callback';
const AUTHORIZE_URL = 'https://claude.ai/oauth/authorize';
const TOKEN_URL = 'https://console.anthropic.com/v1/oauth/token';

/** In-memory state for the current OAuth flow. */
let pendingAuth: {
  codeVerifier: string;
  state: string;
} | null = null;

/** Base64url encode (no padding). */
function base64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Generate a PKCE code verifier and its S256 challenge. */
function generatePkce() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

/** Resolve the credentials file path (~/.claude/.credentials.json). */
function credentialsPath(): string {
  const home = process.env.HOME ?? '/root';
  return path.join(home, '.claude', '.credentials.json');
}

/**
 * POST /api/claude/auth/login
 *
 * Starts a first-party OAuth flow. Generates PKCE parameters and returns
 * the authorization URL for the user to open in their browser.
 */
claudeAuthRouter.post('/login', async (_req, res) => {
  try {
    const { verifier, challenge } = generatePkce();
    const state = base64url(randomBytes(32));

    pendingAuth = { codeVerifier: verifier, state };

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    });

    const url = `${AUTHORIZE_URL}?${params.toString()}`;
    res.json({ url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to start OAuth flow';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/claude/auth/callback
 *
 * Exchanges the authorization code for OAuth tokens and stores them
 * in ~/.claude/.credentials.json so the Claude CLI can use them.
 *
 * Body: { "code": "<the code from the browser>" }
 */
claudeAuthRouter.post('/callback', async (req, res) => {
  const { code } = req.body ?? {};

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing required field: code' });
    return;
  }

  if (!pendingAuth) {
    res.status(409).json({
      error:
        'No login flow in progress. Call POST /api/claude/auth/login first.',
    });
    return;
  }

  const { codeVerifier, state: pendingState } = pendingAuth;
  pendingAuth = null;

  // The callback page may show the code as "code#state" — strip the
  // fragment (state) suffix so we send only the actual authorization code.
  const authCode = code.split('#')[0]!;

  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: authCode,
        state: pendingState,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    const rawText = await tokenRes.text();

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText);
    } catch {
      res.status(502).json({
        success: false,
        output: `Token endpoint returned non-JSON (HTTP ${tokenRes.status}): ${rawText.slice(0, 200)}`,
      });
      return;
    }

    if (!tokenRes.ok) {
      const errorBody = body as Record<string, unknown>;
      const errorObj = errorBody.error as
        | Record<string, unknown>
        | string
        | undefined;
      const errorMessage =
        (typeof errorObj === 'object' && errorObj !== null
          ? (errorObj.message as string)
          : undefined) ??
        (errorBody.error_description as string) ??
        (typeof errorObj === 'string' ? errorObj : undefined) ??
        'Token exchange failed';
      res.status(400).json({ success: false, output: errorMessage });
      return;
    }

    const accessToken = body.access_token as string;
    const refreshToken = body.refresh_token as string;
    const expiresIn = body.expires_in as number;

    // Store credentials where the Claude CLI expects them.
    const credPath = credentialsPath();
    const credDir = path.dirname(credPath);

    let existing: Record<string, unknown> = {};
    try {
      existing = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
    } catch {
      // File doesn't exist yet — start fresh.
    }

    existing.claudeAiOauth = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      scopes: ((body.scope as string) ?? SCOPES).split(' '),
    };

    fs.mkdirSync(credDir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(credPath, JSON.stringify(existing, null, 2), {
      mode: 0o600,
    });

    res.json({ success: true, output: 'Authenticated successfully' });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to exchange code for tokens';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/claude/auth/status
 *
 * Returns the current authentication status of the Claude Code CLI.
 */
claudeAuthRouter.get('/status', async (_req, res) => {
  try {
    const result = await new Promise<{
      authenticated: boolean;
      output: string;
    }>((resolve, reject) => {
      execFile('claude', ['auth', 'status'], (err, stdout, stderr) => {
        if (err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
          reject(new Error('claude CLI not found'));
          return;
        }
        const exitCode = err ? ((err as NodeJS.ErrnoException).code ?? 1) : 0;
        resolve({
          authenticated: exitCode === 0,
          output: (stdout || stderr).trim(),
        });
      });
    });

    res.json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to check auth status';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/claude/auth/logout
 *
 * Logs out by removing stored credentials.
 */
claudeAuthRouter.post('/logout', async (_req, res) => {
  try {
    // Try CLI logout first (it may clear additional state).
    await new Promise<void>((resolve) => {
      execFile('claude', ['auth', 'logout'], (err) => {
        if (err) {
          console.log(
            '[claude-auth] CLI logout error (non-fatal):',
            err.message
          );
        }
        resolve();
      });
    });

    // Also remove our credentials file to be thorough.
    try {
      fs.unlinkSync(credentialsPath());
    } catch {
      // Already gone — fine.
    }

    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to logout';
    res.status(500).json({ error: message });
  }
});

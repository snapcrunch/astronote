import { execSync } from 'node:child_process';

const apiUrl = (process.env.api_url || '').replace(/\/api\/?$/, '');
const apiToken = process.env.api_token;
const arg = process.argv[2];

if (!apiUrl || !apiToken || !arg) {
  process.exit(1);
}

function openUrl(url) {
  execSync(`open ${JSON.stringify(url)}`);
}

if (arg.startsWith('create:')) {
  const title = arg.slice('create:'.length);

  const response = await fetch(`${apiUrl}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    process.exit(1);
  }

  const note = await response.json();
  openUrl(`${apiUrl}/notes/${note.id}`);
} else {
  openUrl(`${apiUrl}/notes/${arg}`);
}

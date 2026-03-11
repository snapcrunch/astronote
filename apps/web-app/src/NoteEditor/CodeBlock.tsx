import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({ children, ...props }: React.PropsWithChildren<React.ComponentPropsWithoutRef<"pre">>) {
  const [copied, setCopied] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeEl = children as any;
  const className: string = codeEl?.props?.className ?? "";
  const language = className.replace("language-", "") || undefined;
  const code = String(codeEl?.props?.children ?? "").replace(/\n$/, "");

  const SHELL_LANGUAGES = new Set(["bash", "sh", "shell", "zsh"]);
  const isShell = language !== undefined && SHELL_LANGUAGES.has(language);
  const displayCode = isShell
    ? code.split("\n").map((line) => (line && !/^\s/.test(line) ? `$ ${line}` : line)).join("\n")
    : code;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: "relative", "&:hover .copy-btn": { opacity: 1 } }}>
      <SyntaxHighlighter
        {...props}
        language={isShell ? "shell-session" : language}
        style={isShell ? dracula : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(0,0,0,0.12)",
          fontSize: "0.875rem",
        }}
      >
        {displayCode}
      </SyntaxHighlighter>
      <Button
        className="copy-btn"
        size="small"
        onClick={handleCopy}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          opacity: 0,
          "&:hover": { opacity: 1, bgcolor: "background.paper" },
          minWidth: "unset",
          px: 1,
          py: 0.25,
          fontSize: "0.75rem",
          lineHeight: 1.5,
          textTransform: "none",
        }}
      >
        {copied ? "copied" : "copy"}
      </Button>
    </Box>
  );
}

export default CodeBlock;

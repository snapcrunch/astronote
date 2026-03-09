import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useNoteStore, useSelectedNote } from "./store";
import { slugify } from "./utils";

const INFO_PANEL_WIDTH = 260;

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function countStats(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, sentences: 0, paragraphs: 0, characters: 0 };

  const words = trimmed.split(/\s+/).length;
  const sentences = trimmed.split(/[.!?]+\s*/g).filter(Boolean).length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const characters = trimmed.length;

  return { words, sentences, paragraphs, characters };
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

function TagManager({ noteId, tags }: { noteId: string; tags: string[] }) {
  const [input, setInput] = useState("");
  const addTag = useNoteStore((s) => s.addTag);
  const removeTag = useNoteStore((s) => s.removeTag);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      const tag = input.trim().toLowerCase().replace(/^#/, "");
      if (tag && !tags.includes(tag)) {
        addTag(noteId, tag);
      }
      setInput("");
    }
  };

  return (
    <>
      <TextField
        size="small"
        fullWidth
        placeholder="Add a tag…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{
          mb: 1,
          "& .MuiOutlinedInput-root": { fontSize: "0.8rem", bgcolor: "background.paper" },
          "& .MuiOutlinedInput-input": { py: 0.75 },
        }}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            onDelete={() => removeTag(noteId, tag)}
            color="primary"
            sx={{ fontSize: "0.8rem", height: 24 }}
          />
        ))}
      </Box>
    </>
  );
}

interface Heading {
  level: number;
  text: string;
}

function extractHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2].replace(/[*_`]/g, "") });
    }
  }
  return headings;
}

function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No headings found.
      </Typography>
    );
  }

  const minLevel = Math.min(...headings.map((h) => h.level));

  const handleClick = (text: string) => {
    const id = slugify(text);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      {headings.map((h, i) => (
        <Link
          key={i}
          component="button"
          variant="caption"
          underline="hover"
          onClick={() => handleClick(h.text)}
          sx={{
            pl: (h.level - minLevel) * 1.5,
            lineHeight: 1.6,
            color: "text.secondary",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          {h.text}
        </Link>
      ))}
    </Box>
  );
}

function InfoPanel() {
  const showInfoPanel = useNoteStore((s) => s.showInfoPanel);
  const note = useSelectedNote();

  const stats = useMemo(() => {
    if (!note) return null;
    return countStats(note.content);
  }, [note]);

  if (!note || !stats || !showInfoPanel) return null;

  return (
    <Box
      sx={{
        width: INFO_PANEL_WIDTH,
        minWidth: INFO_PANEL_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: 1,
        borderColor: "divider",
        bgcolor: "grey.50",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          px: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "grey.100",
          borderBottom: 1,
          borderColor: "divider",
          height: 40,
          minHeight: 40,
          boxSizing: "content-box",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Info
        </Typography>
      </Box>
      <Box sx={{ px: 2, py: 1.5, overflow: "auto" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1, pb: 0.5, mx: -2, px: 2, borderBottom: 1, borderColor: "divider" }}>
          Table of Contents
        </Typography>
        <TableOfContents content={note.content} />

        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pb: 0.5, mx: -2, px: 2, borderBottom: 1, borderColor: "divider" }}>
          Tags
        </Typography>
        <TagManager noteId={note.id} tags={note.tags} />

        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pb: 0.5, mx: -2, px: 2, borderBottom: 1, borderColor: "divider" }}>
          Statistics
        </Typography>
        <StatRow label="Words" value={stats.words} />
        <StatRow label="Characters" value={stats.characters} />
        <StatRow label="Sentences" value={stats.sentences} />
        <StatRow label="Paragraphs" value={stats.paragraphs} />

        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pb: 0.5, mx: -2, px: 2, borderBottom: 1, borderColor: "divider" }}>
          Dates
        </Typography>
        <StatRow label="Created" value={formatDateTime(note.createdAt)} />
        <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
      </Box>
    </Box>
  );
}

export default InfoPanel;

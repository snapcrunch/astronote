import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNoteStore, useSelectedNote } from "./store";

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
        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
          Statistics
        </Typography>
        <StatRow label="Words" value={stats.words} />
        <StatRow label="Characters" value={stats.characters} />
        <StatRow label="Sentences" value={stats.sentences} />
        <StatRow label="Paragraphs" value={stats.paragraphs} />

        <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 0.5 }}>
          Dates
        </Typography>
        <StatRow label="Created" value={formatDateTime(note.createdAt)} />
        <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
      </Box>
    </Box>
  );
}

export default InfoPanel;

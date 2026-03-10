import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import { useSelectedNote } from "../store";
import StatRow from "./StatRow";
import { countStats } from "./util";

function Statistics() {
  const note = useSelectedNote();
  const stats = useMemo(() => (note ? countStats(note.content) : null), [note]);

  if (!stats) return null;

  return (
    <>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pt: 0.5, pb: 0.5, mx: -2, px: 2, borderTop: 1, borderBottom: 1, borderColor: "divider" }}>
        Statistics
      </Typography>
      <StatRow label="Words" value={stats.words} />
      <StatRow label="Characters" value={stats.characters} />
      <StatRow label="Sentences" value={stats.sentences} />
      <StatRow label="Paragraphs" value={stats.paragraphs} />
    </>
  );
}

export default Statistics;

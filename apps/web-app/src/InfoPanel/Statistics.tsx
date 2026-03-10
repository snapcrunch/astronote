import { useMemo } from "react";
import SectionHeading from "./SectionHeading";
import { useSelectedNote } from "../store";
import StatRow from "./StatRow";
import { countStats } from "./util";

function Statistics() {
  const note = useSelectedNote();
  const stats = useMemo(() => (note ? countStats(note.content) : null), [note]);

  if (!stats) return null;

  return (
    <>
      <SectionHeading>Statistics</SectionHeading>
      <StatRow label="Words" value={stats.words} />
      <StatRow label="Characters" value={stats.characters} />
      <StatRow label="Sentences" value={stats.sentences} />
      <StatRow label="Paragraphs" value={stats.paragraphs} />
    </>
  );
}

export default Statistics;

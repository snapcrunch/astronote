import Typography from "@mui/material/Typography";
import { useSelectedNote } from "../store";
import StatRow from "./StatRow";
import { formatDateTime } from "./util";

function Dates() {
  const note = useSelectedNote();

  if (!note) return null;

  return (
    <>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mt: 2, mb: 1, pt: 0.5, pb: 0.5, mx: -2, px: 2, borderTop: 1, borderBottom: 1, borderColor: "divider" }}>
        Dates
      </Typography>
      <StatRow label="Created" value={formatDateTime(note.createdAt)} />
      <StatRow label="Modified" value={formatDateTime(note.updatedAt)} />
    </>
  );
}

export default Dates;

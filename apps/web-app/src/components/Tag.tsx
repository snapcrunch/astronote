import Chip from "@mui/material/Chip";

interface TagProps {
  label: string;
  onRemoved?: () => void;
  count?: number;
  onClick?: () => void;
  selected?: boolean;
}

function Tag({ label, onRemoved, count, onClick, selected }: TagProps) {
  const displayLabel = count != null ? `${label} (${count})` : label;

  return (
    <Chip
      label={displayLabel}
      size="small"
      color="primary"
      variant={selected ? "filled" : "outlined"}
      onDelete={onRemoved}
      onClick={onClick}
      sx={{
        fontSize: "0.8rem",
        height: 24,
        borderRadius: 1,
        ...(onClick && { cursor: "pointer" }),
        ...(!selected && { bgcolor: "white" }),
      }}
    />
  );
}

export default Tag;

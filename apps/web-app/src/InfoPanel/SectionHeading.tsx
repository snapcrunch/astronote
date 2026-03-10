import Typography from "@mui/material/Typography";

interface SectionHeadingProps {
  children: React.ReactNode;
  first?: boolean;
}

function SectionHeading({ children, first = false }: SectionHeadingProps) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 600,
        display: "block",
        mb: 1,
        mx: -2,
        px: 2,
        borderBottom: 1,
        borderColor: "divider",
        ...(first
          ? { pb: 0.5 }
          : { mt: 2, pt: 0.5, pb: 0.5, borderTop: 1, borderTopColor: "divider" }),
      }}
    >
      {children}
    </Typography>
  );
}

export default SectionHeading;

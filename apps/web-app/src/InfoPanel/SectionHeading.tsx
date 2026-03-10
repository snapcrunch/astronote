import Typography from "@mui/material/Typography";
import { sectionHeading } from "./styles";

interface SectionHeadingProps {
  children: React.ReactNode;
  first?: boolean;
}

function SectionHeading({ children, first = false }: SectionHeadingProps) {
  return (
    <Typography variant="caption" sx={sectionHeading(first)}>
      {children}
    </Typography>
  );
}

export default SectionHeading;

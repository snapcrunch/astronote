import { useMemo } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import SectionHeading from "./SectionHeading";
import { useSelectedNote } from "../store";
import { slugify } from "../utils";
import { extractHeadings } from "./util";
import { tocList, tocLink } from "./styles";

function TableOfContents() {
  const note = useSelectedNote();
  const headings = useMemo(() => (note ? extractHeadings(note.content) : []), [note]);

  const minLevel = headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1;

  const handleClick = (text: string) => {
    const id = slugify(text);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SectionHeading
      first
      content={
        headings.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No headings found.
          </Typography>
        ) : (
          <Box sx={tocList}>
            {headings.map((h, i) => (
              <Link
                key={i}
                component="button"
                variant="caption"
                underline="hover"
                onClick={() => handleClick(h.text)}
                sx={tocLink(h.level - minLevel)}
              >
                {h.text}
              </Link>
            ))}
          </Box>
        )
      }
    >
      Table of Contents
    </SectionHeading>
  );
}

export default TableOfContents;

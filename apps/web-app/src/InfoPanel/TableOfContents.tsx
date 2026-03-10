import { useMemo } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useSelectedNote } from "../store";
import { slugify } from "../utils";
import { extractHeadings } from "./util";

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
    <>
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1, pb: 0.5, mx: -2, px: 2, borderBottom: 1, borderColor: "divider" }}>
        Table of Contents
      </Typography>
      {headings.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No headings found.
        </Typography>
      ) : (
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
      )}
    </>
  );
}

export default TableOfContents;

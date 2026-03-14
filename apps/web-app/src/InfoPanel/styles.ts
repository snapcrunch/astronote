import type { SxProps, Theme } from "@mui/material/styles";

// InfoPanel
export const infoPanelRoot: SxProps<Theme> = {
  width: 350,
  minWidth: 350,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderLeft: 1,
  borderColor: "divider",
  bgcolor: "grey.50",
  overflow: "hidden",
  userSelect: "none",
};

export const infoPanelHeader: SxProps<Theme> = {
  px: 2,
  display: "flex",
  alignItems: "center",
  bgcolor: "grey.100",
  borderBottom: 1,
  borderColor: "divider",
  height: 40,
  minHeight: 40,
  boxSizing: "content-box",
};

export const infoPanelHeaderTitle: SxProps<Theme> = { fontWeight: 600 };

export const infoPanelContent: SxProps<Theme> = { px: 2, py: 1.5, overflow: "auto" };

export const infoPanelContentInner: SxProps<Theme> = { px: 2, flexShrink: 0 };

// TagManager
export const tagInputWrapper: SxProps<Theme> = {
  mx: -2,
  mt: -1,
  mb: 1,
};

export const tagInput: SxProps<Theme> = {
  "& .MuiOutlinedInput-root": {
    fontSize: "0.8rem",
    bgcolor: "background.paper",
    borderRadius: 0,
    borderBottom: 1,
    borderColor: "divider",
  },
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiOutlinedInput-input": { py: 0.75, px: 2 },
};

export const tagList: SxProps<Theme> = { display: "flex", flexWrap: "wrap", gap: 0.375 };

// StatRow
export const statRow: SxProps<Theme> = { display: "flex", justifyContent: "space-between", py: 0.5 };

export const statValue: SxProps<Theme> = { fontWeight: 500 };

// TableOfContents
export const tocList: SxProps<Theme> = { display: "flex", flexDirection: "column", gap: 0.25 };

export const tocLink = (indent: number): SxProps<Theme> => ({
  pl: indent * 1.5,
  lineHeight: 1.6,
  color: "text.secondary",
  textAlign: "left",
  cursor: "pointer",
});

// InfoPanel (inline / mobile)
export const infoPanelInlineContent: SxProps<Theme> = { flex: 1, px: 2, py: 1.5, overflow: "auto" };

// SectionHeading
export const sectionHeading = (first: boolean, open = true, last = false): SxProps<Theme> => ({
  fontWeight: 600,
  textTransform: "uppercase",
  lineHeight: "40px",
  height: 40,
  display: "block",
  mb: open ? 1 : 0,
  mx: -2,
  px: 2,
  borderBottom: (open || last) ? 1 : 0,
  borderColor: "divider",
  bgcolor: "grey.200",
  ...(first
    ? {}
    : { borderTop: 1, borderTopColor: "divider" }),
});

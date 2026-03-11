import type { SxProps, Theme } from "@mui/material/styles";

export const emptyStateContainer: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};

export const root: SxProps<Theme> = {
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export const toolbar = (isMobile: boolean): SxProps<Theme> => ({
  px: isMobile ? 1.5 : 3,
  display: "flex",
  alignItems: "center",
  gap: 1,
  bgcolor: "grey.100",
  borderBottom: 1,
  borderColor: "divider",
  height: 40,
  minHeight: 40,
  boxSizing: "content-box",
});

export const titleWrapper: SxProps<Theme> = {
  flex: 1,
  minWidth: 0,
};

export const contentArea = (isMobile: boolean): SxProps<Theme> => ({
  flex: 1,
  px: isMobile ? 1.5 : 3,
  pt: 3,
  pb: 3,
  overflow: "auto",
});

export const markdownContent: SxProps<Theme> = {
  "& h1:first-child, & h2:first-child, & h3:first-child, & h4:first-child, & h5:first-child, & h6:first-child": {
    mt: 0,
    pt: 0,
  },
  "& table": {
    borderCollapse: "collapse",
    width: "100%",
    my: 2,
  },
  "& th, & td": {
    border: 1,
    borderColor: "divider",
    px: 1.5,
    py: 0.75,
    textAlign: "left",
  },
  "& th": {
    bgcolor: "grey.100",
    fontWeight: 600,
  },
  "& code": {
    fontSize: "0.875rem",
    bgcolor: "grey.100",
    px: 0.5,
    borderRadius: 0.5,
  },
  "& pre code": {
    bgcolor: "transparent",
    px: 0,
  },
  "& blockquote": {
    borderLeft: 4,
    borderColor: "grey.300",
    pl: 2,
    ml: 0,
    color: "text.secondary",
    fontStyle: "italic",
  },
  "& img": {
    maxWidth: "100%",
  },
  "& a": {
    color: "primary.main",
  },
  "& hr": {
    border: "none",
    borderTop: 1,
    borderColor: "divider",
    my: 2,
  },
};

export const mobileInfoToggle: SxProps<Theme> = {
  px: 1.5,
  py: 1,
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  borderTop: 1,
  borderColor: "divider",
  bgcolor: "grey.100",
  cursor: "pointer",
  userSelect: "none",
};

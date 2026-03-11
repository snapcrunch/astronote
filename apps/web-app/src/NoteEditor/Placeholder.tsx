import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Logo from "../components/icons/Logo";
import * as styles from "./styles";

function Placeholder() {
  return (
    <Box sx={styles.emptyStateContainer}>
      <Logo width={256} height={256} />
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        Select a note or create a new one.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Press ⌘⇧P to open the command palette.
      </Typography>
    </Box>
  );
}

export default Placeholder;

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default StatRow;

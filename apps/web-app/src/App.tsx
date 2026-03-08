import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import NoteEditor from "./NoteEditor";

function App() {
  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <NoteEditor />
    </Box>
  );
}

export default App;

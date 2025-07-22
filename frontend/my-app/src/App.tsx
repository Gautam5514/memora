import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AllNotes from "./pages/AllNotes"

function App() {
  return (
    <>
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/all_notes" element={<AllNotes />} />
    </Routes>
    </>
  );
}

export default App;
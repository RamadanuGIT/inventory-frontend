import { BrowserRouter, Route, Routes } from "react-router-dom";
import SidebarLayout from "./layouts/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Report from "./pages/Report";
import KeluarStok from "./pages/KeluarStock";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<SidebarLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/keluar-stock" element={<KeluarStok />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

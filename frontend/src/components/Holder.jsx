import { Routes, Route } from "react-router-dom";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";

function Holder() {
  return (
    <div className="holder">
      <Topbar />
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route path="/static" element={<Welcomepage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default Holder;

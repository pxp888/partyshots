import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import Userview from "./Userview";

function Holder() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <div className="holder">
      <Topbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route path="/register" element={<RegisterPage setCurrentUser={setCurrentUser} />} />
        <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
        <Route path="/user/:username" element={<Userview currentUser={currentUser} />} />
      </Routes>
    </div>
  );
}

export default Holder;

import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import Userview from "./Userview";

function Holder() {
  const [currentUser, setCurrentUser] = useState("mike");

  return (
    <div className="holder">
      <Topbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user/:id" element={<Userview />} />
      </Routes>
    </div>
  );
}

export default Holder;

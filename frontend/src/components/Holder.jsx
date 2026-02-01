import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Cookies from "js-cookie";
import Topbar from "./Topbar";
import Welcomepage from "./Welcomepage";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import Userview from "./Userview";
import Albumview from "./Albumview";

function Holder() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = Cookies.get("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (currentUser) {
      Cookies.set("currentUser", JSON.stringify(currentUser), { expires: 7 }); // Expires in 7 days
    } else {
      Cookies.remove("currentUser");
    }
  }, [currentUser]);

  return (
    <div className="holder">
      <Topbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path="/" element={<Welcomepage />} />
        <Route
          path="/register"
          element={<RegisterPage setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/login"
          element={<LoginPage setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/user/:username"
          element={<Userview currentUser={currentUser} />}
        />
        <Route
          path="/album/:albumCode"
          element={<Albumview currentUser={currentUser} />}
        />
      </Routes>
    </div>
  );
}

export default Holder;

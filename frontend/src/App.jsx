import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Holder from "./components/Holder";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Holder />
    </>
  );
}

export default App;

// <file_path>
// web1/frontend/src/App.jsx
// </file_path>

// <edit_description>
// Cleaned App.jsx – removed router imports and duplicated routes
// </edit_description>

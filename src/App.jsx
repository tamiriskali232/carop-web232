import { useEffect } from "react";

// React renders the three containers; the CarOp logic then draws into them.
export default function App() {
  useEffect(() => { import("./carop.js"); }, []);
  return (
    <>
      <div id="app"></div>
      <div id="corner"></div>
      <div id="modal"></div>
    </>
  );
}

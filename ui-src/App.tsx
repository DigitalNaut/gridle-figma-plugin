import React, { useRef } from "react";
import Logo from "./Logo";
import "./App.css";

function App() {
  const inputWidthRef = useRef<HTMLInputElement>(null);
  const inputHeightRef = useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const count = Number(inputWidthRef.current?.value || 0);
    parent.postMessage(
      { pluginMessage: { type: "create-rectangles", count } },
      "*"
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  return (
    <main>
      <header>
        <Logo />
        <h2>Rectangle Creator</h2>
      </header>
      <section>
        <input id="input" type="number" min="0" ref={inputWidthRef} />
        <label htmlFor="input">Width</label>
        <input id="input" type="number" min="0" ref={inputHeightRef} />
        <label htmlFor="input">Height</label>
      </section>
      <footer>
        <button className="brand" onClick={onCreate}>
          Create
        </button>
        <button onClick={onCancel}>Cancel</button>
      </footer>
    </main>
  );
}

export default App;

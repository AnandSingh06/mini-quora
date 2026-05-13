import { useState } from "react";
import API from "../api";

export default function Editor() {
  const [topic, setTopic] = useState("");
  const [original, setOriginal] = useState("");
  const [improved, setImproved] = useState("");

  const generate = async () => {
    const res = await API.post("/generate", { topic });
    setOriginal(res.data.content);
  };

  const improve = async () => {
    const res = await API.post("/improve", { content: original });
    setImproved(res.data.content);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      
      <textarea
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
      />

      <textarea value={improved} readOnly />

      <div>
        <input
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <button onClick={generate}>Generate</button>
        <button onClick={improve}>Improve</button>
      </div>
    </div>
  );
}
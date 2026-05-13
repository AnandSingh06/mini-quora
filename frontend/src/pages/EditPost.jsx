import { useState } from "react";
import API from "../api";

export default function Editor() {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [ai, setAi] = useState("");

  // 🔥 NEW STATES
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);

  // 🤖 Generate
  const generate = async () => {
    const res = await API.post("/generate", { topic });
    setText(res.data.content);
  };

  // 🚀 Improve
  const improve = async () => {
    const res = await API.post("/improve", { content: text });
    setAi(res.data.content);
  };

  // 📸 HANDLE FILE SELECT
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);

    // 🔥 create preview URLs
    const previews = selected.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  // ❌ REMOVE IMAGE
  const removeImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreview(newPreview);
  };

  // 📤 SUBMIT POST
  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("content", text);
   formData.append("topic", topic);
    files.forEach((file) => {
      formData.append("media", file);
    });

    await API.post("/api/posts", formData);
    alert("Post created!");
  };

  return (
    <div className="editor">
      <input
        placeholder="Enter topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
 <input
  placeholder="Enter topic"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
/>
      <textarea
        placeholder="Write your post..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="buttons">
        <button onClick={generate}>✨ Generate</button>
        <button onClick={improve}>🚀 Improve</button>
      </div>

      {/* 📸 IMAGE UPLOAD */}
      <input type="file" multiple onChange={handleFiles} />

      {/* 🔥 PREVIEW */}
      <div className="preview">
        {preview.map((img, index) => (
          <div key={index}>
            <img src={img} width="100" />
            <button onClick={() => removeImage(index)}>❌</button>
          </div>
        ))}
      </div>

      {/* 📤 SUBMIT */}
      <button onClick={handleSubmit}>Post</button>

      {/* 🤖 AI RESULT */}
      {ai && (
        <div className="ai-box">
          <h4>AI Improved</h4>
          <p>{ai}</p>
          <button onClick={() => setText(ai)}>Use this</button>
        </div>
      )}
    </div>
  );
}
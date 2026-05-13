import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const username = localStorage.getItem("username");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFile(files);
    setPreview(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setFile(file.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content) { alert("Write something first"); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("topic", topic);
    file.forEach((f) => formData.append("media", f));
    try {
      const res = await API.post("/api/posts", formData);
      if (res.data.error) { alert(res.data.error); setLoading(false); return; }
      navigate("/");
    } catch (err) { console.log(err); setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!topic) { alert("Enter a topic first"); return; }
    setLoading(true);
    try {
      const res = await API.post("/generate", { topic });
      setContent(res.data.content);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h2>New post</h2>

        <label>Posting as</label>
        <input type="text" value={`@${username}`} disabled />

        <label>Topic</label>
        <input
          type="text"
          placeholder="e.g. productivity, tech, travel..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="ai-row" style={{ marginTop: 10 }}>
          <button className="ai-btn" onClick={handleGenerate} disabled={loading}>
            ✨ Generate from topic
          </button>
        </div>

        <label>Content</label>
        <textarea
          rows={7}
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label>Images <span style={{ fontWeight: 400, textTransform: "none", fontSize: 12 }}>(optional, up to 5)</span></label>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} />

        {preview.length > 0 && (
          <div className="preview-grid">
            {preview.map((img, i) => (
              <div key={i} className="preview-item">
                <img src={img} alt="" />
                <button onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <button className="post-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "🚀 Publish post"}
        </button>
      </div>
    </div>
  );
}

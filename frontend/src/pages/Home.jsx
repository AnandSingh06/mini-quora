import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { timeAgo } from "../utils/time";

function getInitials(username) {
  return (username || "?").slice(0, 2).toUpperCase();
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [text, setText] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [aiText, setAiText] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [previewImages, setPreviewImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = () => {
    setLoading(true);
    API.get("/api/posts").then((res) => {
      setPosts(res.data);
      setLoading(false);
    });
  };

  // Filter posts by topic (client-side)
  const filteredPosts = searchQuery
    ? posts.filter((p) =>
        (p.topic || "").toLowerCase().includes(searchQuery) ||
        (p.content || "").toLowerCase().includes(searchQuery)
      )
    : posts;

  const handleEdit = (post) => {
    setEditId(post.id);
    setText(post.content);
    setEditTopic(post.topic || "");
    setAiText("");
    let imgs = [];
    if (post.media) {
      try { imgs = JSON.parse(post.media); }
      catch { imgs = post.media.includes(",") ? post.media.split(",") : [post.media]; }
    }
    setEditImages(imgs);
  };

  const handleRemoveImage = (index) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImprove = async () => {
    const res = await API.post("/improve", { content: text });
    setAiText(res.data.content);
  };

  const handleSave = async (id) => {
    const formData = new FormData();
    formData.append("content", text);
    formData.append("topic", editTopic);
    formData.append("existingMedia", JSON.stringify(editImages));
    for (let i = 0; i < newFiles.length; i++) formData.append("media", newFiles[i]);
    const res = await API.put(`/api/posts/${id}`, formData);
    if (res.data.error) { alert(res.data.error); return; }
    setEditId(null);
    setAiText("");
    setNewFiles([]);
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await API.delete(`/api/posts/${id}`);
      if (res.data.error) { alert(res.data.error); return; }
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="feed">
      {/* SEARCH RESULT HEADER */}
      {searchQuery && (
        <div className="search-result-header">
          <span>
            Results for <strong>#{searchQuery}</strong>
          </span>
          <span className="search-result-count">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div className="empty-state">
          {searchQuery ? (
            <>
              <h3>No posts found</h3>
              <p>Nothing matches <strong>#{searchQuery}</strong> — try a different topic.</p>
            </>
          ) : (
            <>
              <h3>No posts yet</h3>
              <p>Be the first to share something.</p>
            </>
          )}
        </div>
      )}

      {filteredPosts.map((p) => {
        let images = [];
        if (p.media) {
          try { images = JSON.parse(p.media); }
          catch { images = p.media.includes(",") ? p.media.split(",") : [p.media]; }
        }

        return (
          <div className="card" key={p.id}>
            <div className="card-header">
              <div className="avatar">{getInitials(p.username)}</div>
              <div className="card-meta">
                <span className="card-username">@{p.username}</span>
                <span className="card-time">{timeAgo(p.created_at)}</span>
              </div>
            </div>

            {p.topic && (
              <span
                className="topic"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/?q=${encodeURIComponent(p.topic)}`)}
                title={`Search #${p.topic}`}
              >
                #{p.topic}
              </span>
            )}

            {editId === p.id ? (
              <>
                <input
                  className="edit-input"
                  placeholder="Topic"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                />
                <textarea
                  className="edit-textarea"
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8, margin: "10px 0" }}>
                  <button className="btn btn-ai" onClick={handleImprove}>✨ AI Improve</button>
                </div>
                {aiText && (
                  <div className="ai-box">
                    <p>{aiText}</p>
                    <button onClick={() => setText(aiText)}>Use this</button>
                  </div>
                )}
                <div className="edit-images">
                  {editImages.map((img, index) => (
                    <div key={index} className="edit-img-wrap">
                      <img src={`http://localhost:8081/uploads/${img}`} alt="" />
                      <button onClick={() => handleRemoveImage(index)}>×</button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple onChange={(e) => setNewFiles(e.target.files)} style={{ marginTop: 8 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="btn btn-primary" onClick={() => handleSave(p.id)}>💾 Save</button>
                  <button className="btn" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="card-content">{p.content}</p>
                {images.length > 0 && (
                  <div className="gallery">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={`http://localhost:8081/uploads/${img}`}
                        alt=""
                        onClick={() => { setPreviewImages(images); setCurrentIndex(i); setIsOpen(true); }}
                      />
                    ))}
                  </div>
                )}
                <div className="card-footer">
                  <button className="btn" onClick={() => navigate(`/post/${p.id}`)}>👁 View</button>
                  {localStorage.getItem("token") && p.isOwner && (
                    <>
                      <button className="btn" onClick={() => handleEdit(p)}>✏️ Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {isOpen && (
        <div className="modal" onClick={() => setIsOpen(false)}>
          <button className="modal-btn close" onClick={() => setIsOpen(false)}>✕</button>
          <button className="modal-btn prev" onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => p === 0 ? previewImages.length - 1 : p - 1); }}>‹</button>
          <img className="modal-img" src={`http://localhost:8081/uploads/${previewImages[currentIndex]}`} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="modal-btn next" onClick={(e) => { e.stopPropagation(); setCurrentIndex((p) => p === previewImages.length - 1 ? 0 : p + 1); }}>›</button>
        </div>
      )}
    </div>
  );
}

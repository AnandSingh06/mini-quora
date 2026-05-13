import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";
import { timeAgo } from "../utils/time";

function getInitials(username) {
  return (username || "?").slice(0, 2).toUpperCase();
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    API.get(`/api/posts/${id}`).then((res) => setPost(res.data));
  }, [id]);

  if (!post) return <div className="spinner" />;

  let images = [];
  if (post.media) {
    try { images = JSON.parse(post.media); }
    catch { images = post.media.includes(",") ? post.media.split(",") : [post.media]; }
  }

  return (
    <div className="detail">
      <button
        className="btn"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        ← Back
      </button>

      <div className="detail-card">
        {/* HEADER */}
        <div className="card-header">
          <div className="avatar">{getInitials(post.username)}</div>
          <div className="card-meta">
            <span className="card-username">@{post.username}</span>
            <span className="card-time">{timeAgo(post.created_at)}</span>
          </div>
        </div>

        {post.topic && <span className="topic">#{post.topic}</span>}

        <p className="detail-content">{post.content}</p>

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
      </div>

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

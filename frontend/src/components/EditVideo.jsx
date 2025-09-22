import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EditVideo.module.css";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function EditVideo({ user, setVideos }) {


  const { videoId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null); // 👈 thumbnail preview
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/video/${videoId}`);
        setVideo(res.data);
        setTitle(res.data.title || "");
        setDescription(res.data.description || "");
        setCategory(res.data.category);
        setPreview(`${BASE_URL}${res.data.thumbnailUrl}`); // old thumbnail
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };
    fetchVideo();
  }, [videoId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category)
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await axios.put(`${BASE_URL}/video/editVideo/${videoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      alert("Video updated!");
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.delete(`${BASE_URL}/video/deleteVideo/${videoId}`,{
        withCredentials: true}) ;
        setVideos(prev => prev.filter(vid => vid._id !== video._id));
      alert("Video deleted!");
      navigate('/');
    } catch (err) {
      alert("Delete failed!", err);
    }
  };



  if (!video) return <p>Loading video...</p>;

  if (!user || user._id !== video.uploadedBy._id) {
  return (
    <div style={{ padding: "20px", color: "red" }}>
      <h3>You have no permission to edit or delete this video.</h3>
    </div>
  );
}

  return (
    <div className={styles.editContainer}>
      <h2>Edit Video</h2>

      <form onSubmit={handleUpdate}>
        <div className={styles.formGroup}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            className={styles.input}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            value={description}
            className={styles.textarea}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Category</label>
          <select 
            name="category"
            value={category}
             onChange={(e) => setCategory(e.target.value)}
             className={styles.input}
           
          >
            <option value="General">General</option>
            <option value="Music">Music</option>
            <option value="Gaming">Gaming</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setThumbnail(file);
              if (file) {
                setPreview(URL.createObjectURL(file)); // new preview
              }
            }}
          />
          {preview && (
            <img src={preview} alt="Thumbnail Preview" className={styles.thumbnailPreview} />
          )}
        </div>

        <div className={styles.btnGroup}>
          <button type="submit" disabled={loading} className={`${styles.btn} ${styles.saveBtn}`}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={handleDelete} className={`${styles.btn} ${styles.deleteBtn}`}>
            Delete Video
          </button>
          <button type="button" onClick={() => navigate(-1)} className={`${styles.btn} ${styles.cancelBtn}`}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditVideo;

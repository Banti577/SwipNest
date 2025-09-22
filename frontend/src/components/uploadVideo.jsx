import { useState } from "react";
import axios from "axios";
import "./uploadVideo.css";
import Spinner from '../Spinner';

function UploadVideo({ user, setUser }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "long",

  });

  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video || !formData.title) {
      alert("Video and title are required!");
      return;
    }

    const data = new FormData();
    data.append("video", video);
    if (thumbnail) data.append("thumbnail", thumbnail);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);
    data.append("category", formData.category);
     setLoading(true);

    try {

      const res = await axios.post(`${BASE_URL}/video/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
         withCredentials: true,
         onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
      alert("Video uploaded successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed");
    } finally{
      setLoading(false);
    }
  };

  return (
    user ? (
    <div className="container my-5" style={{ maxWidth: "800px" }}>
      <h2 className="mb-4 fw-bold">Upload Video</h2>
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded shadow-sm bg-light"
      >
        {/* Video Upload */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Select Video</label>
          <input
            type="file"
            accept="video/*"
            className="form-control"
            onChange={handleVideoChange}
          />
          {preview && (
            <video
              src={preview}
              controls
              className="mt-3 rounded shadow"
              width="100%"
              height="300"
            />
          )}
        </div>

        {/* Thumbnail Upload */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleThumbnailChange}
          />
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            className="form-control"
            placeholder="Enter video title"
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            className="form-control"
            placeholder="Enter video description"
            rows="3"
            onChange={handleChange}
          />
        </div>

        {/* Type */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Type</label>
          <select
            name="type"
            value={formData.type}
            className="form-select"
            onChange={handleChange}
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label className="form-label fw-semibold">Category</label>
          <select 
            name="category"
            value={formData.category}
            className="form-select"
            onChange={handleChange}
          >
            <option value="General">General</option>
            <option value="Music">Music</option>
            <option value="Gaming">Gaming</option>
            <option value="Education">Education</option>
            <option value="Entertainemnt">Entertainemnt</option>
            <option value="Comedy">Comedy</option>
            <option value="Movies">Movies</option>
             <option value="News">News</option>
              <option value="History">History</option>
             

          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100 fw-semibold">

          {loading ? (
        <div>
          <p>Uploading... {progress}%</p>
          <div style={{ width: "100%", background: "#eee", height: "10px" }}>
            <div
              style={{
                width: `${progress}%`,
                background: "blue",
                height: "10px",
                transition: "width 0.3s",
              }}
            ></div>
          </div>
        </div>
      ):"Upload"}
         
        </button>
      </form>
      
      
    </div>
  ) : (
    <div className="container my-5">
      <h2 className="text-center text-danger">
        Please log in to upload videos.
      </h2>
    </div>      
  )
  );
}

export default UploadVideo;

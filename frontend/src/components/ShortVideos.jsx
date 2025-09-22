import { useState, useRef, useEffect } from "react";
import styles from "./ShortVideos.module.css";
import { Link, useNavigate } from "react-router-dom";


function ShortVideos({ videos}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);
  const navigate = useNavigate();
 
  

  // sirf short videos filter karo
  const shortVideos = videos.filter((video) => video.type === "short");

  const handleScroll = (e) => {
    const nextIndex = Math.round(e.target.scrollTop / window.innerHeight);
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  };
    useEffect(() => {
    if (shortVideos[currentIndex]) {
      navigate(`/short/${shortVideos[currentIndex]._id}`, { replace: true });
    }
  }, [currentIndex, navigate, shortVideos]);

  useEffect(() => {
  videoRefs.current.forEach((video, index) => {
    if (!video) return;

    if (index === currentIndex) {
      // 👇 agar video already play ho raha hai to dobara play() mat call karo
      const isPlaying =
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > 2;

      if (!isPlaying) {
        video.play().catch((err) => {
          console.log("Autoplay blocked:", err);
        });
      }
    } else {
      video.pause();
      video.currentTime = 0; // rewind
    }
  });
}, [currentIndex]);

  return (
    <div className={styles.container} onScroll={handleScroll}>
      {shortVideos.map((video, i) => (
        <div key={video._id} className={styles.videoWrapper}>
          <video
            ref={(el) => (videoRefs.current[i] = el)}
            src={`${video.videoUrl}`}
            className={styles.video}
            muted={isMuted}
            controls
            loop
          />

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* Right side actions */}
          <div className={styles.actions}>
            <button>👍</button>
            <button>💬</button>
            <button>🔗</button>
          </div>

          {/* Bottom info */}
          <div className={styles.info}>
            <h4>{video.title}</h4>
          <Link to={`/user/${video.uploadedBy._id}`}>
            <span><img width={'40px'} src={`${process.env.REACT_APP_BACKEND_URL}/${video.uploadedBy.profilePicture}`} alt="" /></span>
            <span className="fw-bold text-white decoration-none">{video.uploadedBy?.FullName}</span>
           </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShortVideos;


import VideoCard from "./VideoCard";
import { Link } from "react-router-dom";
import styles from "./VideoList.module.css";

function VideoList({videos, className}) {
  
  return (
    <div className={`${styles.grid} ${className}`}>
      {videos.length > 0 ? (
        videos.map((video) => (
          <Link key={video._id} to={`/video/${video._id}`} className={styles.link}>
            <VideoCard video={video} className ={className} />
          </Link>
        ))
      ) : (
        <p>No videos available</p>
      )}
    </div>
  );
}

export default VideoList;

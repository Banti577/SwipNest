import styles from "./VideoCard.module.css";
import { formatDistanceToNow } from "date-fns";
import { formatDuration } from "./utils/format";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function VideoCard({ video, className }) {
  return (
    <div className={`${styles.videoCard}`}>
      {/* Thumbnail */}
      <div className={`${styles.thumbnailWrapper} ${className}`}>
        <img
          src={video.thumbnailUrl ? `${video.thumbnailUrl}` : "/default-thumbnail.png"}
          alt={video.title}
          className={styles.thumbnail}
        />
        <span className={styles.duration}>
          {video.duration ? formatDuration(video.duration) : "0:00"}
        </span>
      </div>

      {/* Video Info */}
      <div className={styles.videoInfo}>
        <img
          src={
            video.uploadedBy?.profilePicture
              ? `${BASE_URL}/${video.uploadedBy.profilePicture}`
              : "/default-avatar.png"
          }
          alt={video.uploadedBy?.FullName || "Channel"}
          className={styles.channelAvatar}
        />
        <div className={styles.details}>
          <h4 className={styles.title}>{video.title}</h4>
          <p className={styles.channelName}>
            {video.uploadedBy ? video.uploadedBy.FullName : "Unknown Channel"}
          </p>
         <p className={styles.views}>
  {video.viewsCount || 0} views •{" "}
  {video.createdAt ? 
    formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) 
    : "Unknown date"}
</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;

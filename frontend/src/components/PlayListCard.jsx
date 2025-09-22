import React from "react";
import styles from "./PlayListCard.module.css";
import { Link } from "react-router-dom";
import VideoCard from "./VideoCard"; // Reuse VideoCard

function PlayListCard({ playlist }) {
  const currentPlaylist = playlist || { name: "", videos: [] };

  return (
    <div className={styles.playlistCard}>
      <h3 className={styles.playlistTitle}>{currentPlaylist.name}</h3>

      {currentPlaylist.videos?.length === 0 ? (
        <p>No videos in this playlist</p>
      ) : (
        <div className={styles.videoList}>
          {currentPlaylist.videos?.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`}>
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayListCard;

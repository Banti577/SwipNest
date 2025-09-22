import { useState } from "react";
import styles from "./PlaylistPopup.module.css";
import axios from "axios";

function PlaylistPopup({ onClose, existingPlaylists, videoId }) {
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [newPlaylist, setNewPlaylist] = useState("");

  const handleSave = async () => {
    try {
      // Agar naya playlist banaya gaya hai
      let playlistName = newPlaylist.trim()
        ? newPlaylist.trim()
        : selectedPlaylist;

      if (!playlistName) {
        alert("Please select or create a playlist!");
        return;
      }

      await axios.post(
        `${BASE_URL}/playlist/add`,
        { playlistName, videoId },
        { withCredentials: true }
      );

      alert("Video saved to playlist!");
      onClose(); // close popup after saving
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h3>Save to Playlist</h3>

        {/* Existing Playlists */}
        <div>
          <label>Select Existing Playlist:</label>
          <select
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)}
          >
            <option value="">-- Select --</option>
            {existingPlaylists.map((pl) => (
              <option key={pl._id} value={pl.name}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>

        {/* New Playlist */}
        <div>
          <label>Create New Playlist:</label>
          <input
            type="text"
            placeholder="Enter playlist name"
            value={newPlaylist}
            onChange={(e) => setNewPlaylist(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaylistPopup;

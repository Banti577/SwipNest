import React, { useEffect, useState } from "react";
import styles from "./yourProfile.module.css";
import VideoCard from "./VideoCard"; 
import { Link, useParams } from "react-router-dom";
import PlayListCard from "./PlayListCard";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = ({ user, videos = [], blogs = [], onEdit, playlist }) => {
  const [activeTab, setActiveTab] = useState("videos");
  const { creatorId } = useParams();
  const [creatorDetails, setcreatorDetails] = useState(null);
  const [creatorVideos, setCreatorVideos] = useState([]);
  const [creatorBlogs, setCreatorBlogs] = useState([]);
  const [creatorPlaylists, setCreatorPlaylists] = useState([]);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const loggedInUser = user;

  // Fetch creator/user profile
  useEffect(() => {
    async function fetchProfile() {
      if (creatorId) {
        try {
          const res = await axios.get(`${BASE_URL}/user/${creatorId}`, { withCredentials: true });
          setcreatorDetails(res.data.user);
          setCreatorVideos(res.data.videos);
          setCreatorBlogs(res.data.blogs);
          setCreatorPlaylists(res.data.playlist);
        } catch (err) {
          console.error("Error fetching creator profile", err);
        }
      }
    }
    fetchProfile();
  }, [creatorId, loggedInUser]);

  // Fetch watched videos for logged-in user
  useEffect(() => {
    if (loggedInUser?._id) {
      axios
        .get(`${BASE_URL}/video/watched/${loggedInUser._id}`, { withCredentials: true })
        .then((res) => { setWatchedVideos(res.data); })
        .catch((err) => console.error(err));
    }
  }, [loggedInUser]);

  // Fetch followers and following
  useEffect(() => {
    const fetchFollowersFollowing = async () => {
      try {
        const userId = creatorId || loggedInUser?._id;
        if (!userId) return;

        // Followers
        const followersRes = await axios.get(`${BASE_URL}/user/followers`, { withCredentials: true });
        setFollowers(followersRes.data);
        

        // Following
        const followingRes = await axios.get(`${BASE_URL}/user/following`, { withCredentials: true });
        setFollowing(followingRes.data);

      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowersFollowing();
  }, [creatorId, loggedInUser]);

  const displayUser = creatorId ? creatorDetails : user;
  const displayVideos = creatorId ? creatorVideos : videos;
  const displayBlogs = creatorId ? creatorBlogs : blogs;
  const displayPlaylists = creatorId ? creatorPlaylists : playlist;

  const renderContent = () => {
    if (activeTab === "videos") {
      if (!displayVideos.length) return <p>No videos yet</p>;
      return (
        <div className={styles.cardGrid}>
          {displayVideos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`}>
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      );
    } else if (activeTab === "blogs") {
      if (!displayBlogs.length) return <p>No blogs yet</p>;
      return (
        <div className={styles.cardGrid}>
          {displayBlogs.map((blog) => (
            <div key={blog._id} className={styles.card}>
              <img
                src={blog.coverImageUrl ? `${BASE_URL}/${blog.coverImageUrl}` : "/default-blog.png"}
                alt={blog.title}
                className={styles.cardThumbnail}
              />
              <div className={styles.cardInfo}>
                <h3 className={styles.cardTitle}>{blog.title}</h3>
                {blog.uploadTime && <p className={styles.cardTime}>{new Date(blog.uploadTime).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    } else if (activeTab === "playlist") {
      return displayPlaylists?.length === 0 ? <p>No playlists yet</p> : (
        <div className="PlayListContainer">
          {displayPlaylists.map((pl) => <PlayListCard key={pl._id} playlist={pl} />)}
        </div>
      );
    } else if (activeTab === "watched") {
      if (!watchedVideos.length) return <p>No watched videos yet</p>;
      return (
        <div className={styles.cardGrid}>
          {watchedVideos.map((video) => (
            <Link key={video._id} to={`/video/${video._id}`}>
              <VideoCard video={video} />
            </Link>
          ))}
        </div>
      );
    } else if (activeTab === "followers") {
      if (!followers.length) return <p>No followers yet</p>;
      return (
        <div className={styles.cardGrid}>
          {followers.map(f => (
            <Link key={f._id} to={`/user/${f._id}`}>
              <div className={styles.card}>
                <img src={`${BASE_URL}/${f.profilePicture}` || "/default-avatar.png"} alt={f.name} className={styles.cardThumbnail} />
                <p>{f.name}</p>
              </div>
            </Link>
          ))}
        </div>
      );
    } else if (activeTab === "following") {
      if (!following.length) return <p>Not following anyone yet</p>;
      return (
        <div className={styles.cardGrid}>
          {following.map(f => (
            <Link key={f._id} to={`/user/${f._id}`}>
              <div className={styles.card}>
                 <img src={`${BASE_URL}/${f.profilePicture}` || "/default-avatar.png"} alt={f.name} className={styles.cardThumbnail} />
                 <p>{f.name}</p>
              </div>
            </Link>
          ))}
        </div>
      );
    }
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <img
          src={displayUser?.profilePicture ? `${BASE_URL}/${displayUser.profilePicture}` : "/default-avatar.png"}
          alt={displayUser?.FullName}
          className={styles.profileImage}
        />
        <h2 className={styles.profileName}>{displayUser?.FullName}</h2>
        <p className={styles.profileEmail}>{displayUser?.email}</p>
        {displayUser?.bio && <p className={styles.profileBio}>{displayUser?.bio}</p>}
        {user && <button className={styles.editButton} onClick={onEdit}>Edit Profile</button>}
      </div>

      <div className={styles.tabs}>
        <button className={activeTab === "videos" ? styles.activeTab : ""} onClick={() => setActiveTab("videos")}>Your Videos</button>
        <button className={activeTab === "blogs" ? styles.activeTab : ""} onClick={() => setActiveTab("blogs")}>Your Blogs</button>
        <button className={activeTab === "playlist" ? styles.activeTab : ""} onClick={() => setActiveTab("playlist")}>PlayList</button>
        {user && !creatorId && <button className={activeTab === "watched" ? styles.activeTab : ""} onClick={() => setActiveTab("watched")}>Watched History</button>}
        <button className={activeTab === "followers" ? styles.activeTab : ""} onClick={() => setActiveTab("followers")}>Followers</button>
        <button className={activeTab === "following" ? styles.activeTab : ""} onClick={() => setActiveTab("following")}>Following</button>
      </div>

      <div className={styles.tabContent}>{renderContent()}</div>
    </div>
  );
};

export default Profile;

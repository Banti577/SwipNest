import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaThumbsUp, FaThumbsDown, FaShare, FaDownload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow } from "date-fns";
import CommentBox from "./commentBox";
import Styles from "./VideoPage.module.css";
import { Link } from "react-router-dom";
import PlaylistPopup from "./PlaylistPopup";
import { FaSave } from "react-icons/fa";
import RelatedVideos from "./RelatedVideos";
import VideoList from "./VideoList";
import CategoryFilter from "./CategoryFilter";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function VideoPage({ user, videos }) {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [views, setViews] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);

  const [category, setCategory] = useState("");
  const [showRelated, setShowRelated] = useState(false);

  const handleCategorySelect = (cat, related) => {
    setCategory(cat);
    setShowRelated(related);
  };

  // Playlist state
  const [showPopup, setShowPopup] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${BASE_URL}/playlist/myplaylist`, {
          withCredentials: true,
        });
        setPlaylists(res.data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }
    };

    fetchPlaylists();
  }, [user]);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/video/views/count/${id}`, {
          withCredentials: true,
        });
        setViews(res.data.views);
      } catch (err) {
        console.error("Error fetching views:", err);
      }
    };

    const fetchVideo = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/video/${id}`, {
          withCredentials: true,
        });
        setVideo(res.data);
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };

    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/countFollowers/${id}`, {
          withCredentials: true,
        });
        setFollowers(res.data.count);
        setIsFollowed(res.data.isFollowed);
      } catch (err) {
        console.error("Error fetching followers:", err);
      }
    };

    fetchVideo();
    fetchViews();
    fetchFollowers();
  }, [id]);

  if (!video) return <p>Loading...</p>;

  const filteredVideos = category
    ? videos.filter((videos) => videos.category === category)
    : videos;

  const saveToPlaylist = async (videoId, playlistName) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/playlist/add`,
        { videoId, playlistName },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Saved to playlist!");
    } catch (err) {
      toast.error("Error saving to playlist");
      console.error(err);
    }
  };

  const handleView = async () => {
    try {
      await axios.post(
        `${BASE_URL}/video/views/${id}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error recording view:", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/video/like/${id}`,
        {},
        { withCredentials: true }
      );
      setVideo((prev) => ({
        ...prev,
        likes: Array(res.data.likes).fill(0),
        dislikes: Array(res.data.dislikes).fill(0),
      }));
    } catch (err) {
      toast.error("Please login to like this video 🔒");
    }
  };

  const handleDislike = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/video/dislike/${id}`,
        {},
        { withCredentials: true }
      );
      setVideo((prev) => ({
        ...prev,
        dislikes: Array(res.data.dislikes).fill(0),
        likes: Array(res.data.likes).fill(0),
      }));
    } catch (err) {
      toast.error("Please login to dislike this video 🔒");
    }
  };

  const handleShare = async (video) => {
    const shareData = {
      title: video.title,
      text: "Check out this video!",
      url: `${window.location.origin}/video/${video._id}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  };

  const handleSubscribe = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/user/subscribe/${id}`,
        {},
        { withCredentials: true }
      );
      setFollowers(res.data.totalSubs);
      setIsFollowed((prev) => !prev);
      toast.success(res.data.message);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <>
      <div className={Styles.videoPageContainer}>
        <div className={Styles.videoPage}>
          <ToastContainer position="top-center" />

          {/* Video Player */}
          <div className={Styles.videoContainerFixed}>
          <video
            key={video._id}
            className={Styles.videoPlayer}
            controls
            onPlay={handleView}
            autoPlay
          >
            <source src={`${video.videoUrl}`} type="video/mp4" />
          </video>
          </div>

          {/* Title */}

          <div className={`${Styles.videoInfoONlY}`}>
            <h2 className={Styles.videoTitle}>{video.title}</h2>

            {/* Views and Actions */}
            <div className={Styles.videoMeta}>
             {/*
              <span>
                views and upload
              </span> */}
              <div className={Styles.actions}>
                <button onClick={handleLike} className={Styles.actionBtn}>
                  <FaThumbsUp /> {video.likes?.length || 0}
                </button>
                <button onClick={handleDislike} className={Styles.actionBtn}>
                  <FaThumbsDown /> {video.dislikes?.length || 0}
                </button>
                <button
                  onClick={() => handleShare(video)}
                  className={Styles.actionBtn}
                >
                  <FaShare /> Share
                </button>
                <button className={Styles.actionBtn}>
                  <FaDownload /> Download
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className={Styles.channelSection}>
            
                <Link to={`/user/${video.uploadedBy._id}`}>
              <img
                src={`${BASE_URL}${
                  video.uploadedBy
                    ? video.uploadedBy.profilePicture
                    : "/default-profile.png"
                }`}
                alt="Channel"
                className={Styles.channelImg}
              />
              </Link>
              <div className={Styles.channelInfo}>
                
                <h4>{video.uploadedBy?.FullName || "Unknown Channel"}</h4>
                
                <span>{followers || 0} Follower</span>
              </div>

              {user && user._id === video.uploadedBy._id ? (
                <div>
                  <Link to={`/${video._id}/edit`}>
                    <button>Edit Video</button>
                  </Link>
                  <button onClick={() => {}}>Analyse </button>
                </div>
              ) : (
                <>
                  <button
                    className={`${Styles.followBtn} ${
                      isFollowed ? Styles.unfollow : ""
                    }`}
                    onClick={handleSubscribe}
                  >
                    {isFollowed ? "Unfollow" : "Follow"}
                  </button>

                  {/* Save to Playlist */}
                  <button
                  className={`${Styles.followBtn}`}
                  onClick={() => setShowPopup(true)}>
                    <FaSave /> Save
                  </button>

                  {showPopup && (
                    <PlaylistPopup
                      existingPlaylists={playlists}
                      videoId={video._id}
                      onSave={(playlistName) =>
                        saveToPlaylist(video._id, playlistName)
                      }
                      onClose={() => setShowPopup(false)}
                    />
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <div className={Styles.descriptionBox}>
               <h4>
                {views || 0} views •{" "}
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </h4>
              <p>{video.description}</p>
            </div>

            {/* Comments */}
            <CommentBox videoId={video._id} user={user} />
          </div>
        </div>

        {/* Right: Related Videos */}
        <div className={Styles.reletedPage}>
          {/* Category Filter */}
          <CategoryFilter className ={`${Styles.videoPageRightComment}`} onCategorySelect={handleCategorySelect} />
          {showRelated ? (
            <div>
            <RelatedVideos videoId={video._id} /> 
            </div>
           
          ) : (
            <VideoList videos={filteredVideos} className ={`${Styles.videoPageRight}`} />
          )}
        </div>
      </div>
    </>
  );
}

export default VideoPage;

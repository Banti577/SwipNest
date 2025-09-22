import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/signup";
import VerifyOtp from "./components/VerifyOtp";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import Logout from "./components/Logout";
import AddBlog from "./components/addBlog";
import BlogDetail from "./components/BlogDetail";
import Layout from "./components/Layout";
import UploadVideo from "./components/uploadVideo";
import VideoPage from "./components/VideoPage";
import Profile from "./components/yourProfile";
import axios from "axios";
import EditVideo from "./components/EditVideo";
import Spinner from "./Spinner";
import ShortLayout from "./components/ShortLayout";
import ShortVideos from "./components/ShortVideos";

function App() {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gLoading, setGloading] = useState(true);



  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/user/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);

        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) {
      setUserData(null);  // ensure userData clear ho
      setLoading(false);
      return;
    }
    const fetchProfileData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile`, { withCredentials: true });
        setUserData(res.data);

      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/video/all`)
      .then((res) => {
        setVideos(res.data)
        setGloading(false);

      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <Spinner />;
  if (gLoading) return <Spinner />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Layout ke andar wrap kar do */}

        <Route element={<Layout user={user} setUser={setUser} />}>
          <Route path="/" element={<Home videos={videos} />} />
          <Route path="/blog/addBlog" element={<AddBlog />} />
          <Route path="/blog/:BlogId" element={<BlogDetail />} />
          <Route path="/video/upload" element={<UploadVideo user={user} setUser={setUser} />} />
          <Route path="/video/:id" element={<VideoPage videos={videos} user={user} setUser={setUser} />} />
          <Route path="/:videoId/edit" element={<EditVideo user={user} setVideos={setVideos} />} />

          <Route path="/user/:creatorId" element={<Profile />} />

          {user ? (
            <Route
              path="/user/profile"
              element={
                userData ? (
                  <Profile
                    user={userData.user}
                    videos={userData.videos}
                    blogs={userData.blogs}
                    playlist={userData.playlist}
                  />
                ) : (
                  <p>Loading profile...</p> // ya "Please login"
                )
              }
            />) : (
            <Route
              path="/user/profile"
              element={<div className="container my-5">
                <h2 className="text-center text-danger">
                  Please log in View Your Profile
                </h2>
              </div>}
            />
          )}
        </Route>

        {/* ShortVideos ke liye alag Layout */}
        <Route element={<ShortLayout user={user}/>}>
          <Route path="/short" element={<ShortLayout />}>
          <Route index element={<ShortVideos videos={videos} />} />
          {/* 👇 is route ko add karo */}
          <Route path=":id" element={<ShortVideos videos={videos} />} />
        </Route>
          
        </Route>

        {/* Layout ke bahar wale pages */}
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/user/login" element={<Login setUser={setUser} />} />
        <Route path="/user/logout" element={<Logout setUser={setUser} />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;

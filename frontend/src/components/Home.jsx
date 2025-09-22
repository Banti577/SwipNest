// src/components/Home.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";
import VideoList from "./VideoList"; 
import CategoryFilter from "./CategoryFilter";


function Home({videos}) {
  const [category, setCategory] = useState("");
  const [blogs, setBlogs] = useState([]);
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api`)
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredVideos = category
    ? videos.filter((video) => video.category === category)
    : videos;

  return (
    <>
     {/* Category Filter */}
      <CategoryFilter onCategorySelect={setCategory} />
      <section className="video-grid">
        <VideoList videos={filteredVideos}/> 
      </section>

      {/* Header */}
      <header className="home-header text-center py-4 mb-4">
        <h1 className="display-5 fw-bold text-gradient">Explore Inspiring Blogs</h1>
        <p className="lead">Fresh ideas, unique voices & stories worth reading</p>
      </header>
     

      {/* Carousel */}
      <div id="blogSlider" className="carousel slide custom-carousel" data-bs-ride="carousel">
        <div className="carousel-inner">
          {blogs && blogs.length > 0 ? (
            blogs.map((blog, idx) => (
              <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={blog._id}>
                <img
                  src={`${blog.coverImageUrl}`}
                  className="d-block w-100 carousel-img"
                  alt="Blog Slide"
                />
                <div className="carousel-caption d-none d-md-block carousel-caption-custom">
                  <h3 className="carousel-blog-title">{blog.title}</h3>
                  <Link to={`/blog/${blog._id}`} className="btn btn-light btn-sm mt-2 shadow-sm">
                    Read More
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <div className="d-flex align-items-center justify-content-center empty-carousel">
                <h3 className="text-muted">No Blogs Available</h3>
              </div>
            </div>
          )}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#blogSlider" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" />
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#blogSlider" data-bs-slide="next">
          <span className="carousel-control-next-icon" />
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Blog Cards */}
      <section className="container blog-grid mt-5">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <div className="card blog-card enhanced-card shadow-sm" key={blog._id}>
              <div className="card-img-container">
                <img
                  src={`${blog.coverImageUrl}`}
                  className="card-img-top blog-card-img"
                  alt="Blog"
                />
              </div>
              <div className="card-body">
                <h5 className="card-title blog-title">{blog.title}</h5>
                <p className="card-text text-muted small">
                  {blog.description?.substring(0, 80)}...
                </p>
                <Link to={`/blog/${blog._id}`} className="btn btn-outline-primary w-100 mt-2">
                  Read More
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted my-5">
            <h2>No Blogs Available</h2>
            <p>Stay tuned for the latest updates and inspiring posts!</p>
          </div>
        )}
      </section>
    </>
  );
}

export default Home;

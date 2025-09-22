// src/components/BlogDetail.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./BlogDetail.css"; // Optional custom styles

function BlogDetail() {
  const { BlogId } = useParams(); // URL से ID निकालना
  const [blog, setBlog] = useState(null);
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${BASE_URL}/blog/${BlogId}`);
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error("Error loading blog:", err);
      }
    };

    if (BlogId) fetchBlog();
  }, [BlogId]);

  


  useEffect(() => {
    const convertTwitterLinksToEmbeds = () => {
      const contents = document.querySelectorAll(".blog-content");

      contents.forEach((content) => {
        const rawHTML = content.innerHTML;
        const updatedHTML = rawHTML.replace(
          /(https:\/\/twitter\.com\/[^\s<]+)/g,
          '<a href="$1">$1</a>'
        );
        content.innerHTML = updatedHTML;

        const links = content.querySelectorAll("a[href*='twitter.com']");
        links.forEach((link) => {
          const href = link.href;
          if (href.includes("/status/")) {
            const blockquote = document.createElement("blockquote");
            blockquote.className = "twitter-tweet";
            const a = document.createElement("a");
            a.href = href;
            blockquote.appendChild(a);
            link.replaceWith(blockquote);
          }
        });
      });

      if (
        window.twttr &&
        window.twttr.widgets &&
        typeof window.twttr.widgets.load === "function"
      ) {
        window.twttr.widgets.load();
      }
    };

    convertTwitterLinksToEmbeds();
  }, [blog]);

  useEffect(() => {
  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    const src = video.getAttribute("src");

    // Inject <source> if missing
    if (src && video.querySelector("source") === null) {
      const source = document.createElement("source");
      source.setAttribute("src", src);
      source.setAttribute("type", "video/mp4");
      video.removeAttribute("src");
      video.appendChild(source);
    }

    // Ensure controls are present
    if (!video.hasAttribute("controls")) {
      video.setAttribute("controls", "controls");
    }
  });
}, [blog]); // Depend on blog so it runs after blog loads


  return (
    <div className="container py-5">
      {blog ? (
        <div className="card shadow-lg border-0 rounded-4 p-4 bg-light">
          <h1 className="mb-4 text-center fw-bold text-primary">
            {blog.blog.title}
          </h1>

          <div
            className="blog-content fs-5 lh-lg text-dark"
            dangerouslySetInnerHTML={{ __html: blog.blog.content }}
          ></div>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading blog details...</p>
        </div>
      )}
    </div>
  );
}

export default BlogDetail;

import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./addBlog.module.css";
import { useNavigate } from "react-router-dom";

function AddBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(null);

  const BASE_URL = process.env.REACT_APP_BACKEND_URL;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("coverImage", coverImage);

    try {
      const res = await fetch(`${BASE_URL}/blog`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        alert("Blog added successfully");
        const data = await res.json();
        navigate(`/blog/${data.BlogID}`);
      } else {
        alert("Error adding blog");
      }
    } catch (err) {
      console.error("Upload error", err);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Add Blog</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Content:</label>
          <Editor
            apiKey="rv4uncuxi66woxz04e1w9ysjiymkcyrtuy9tavs85dp1ulry"
            initialValue="<p>Write your blog here...</p>"
            init={{
              height: 300,
              plugins: "lists link image table code fullscreen paste media",
              toolbar:
                "undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist | blockquote link table media | code fullscreen",
              paste_data_images: true,
              paste_as_text: false,
              extended_valid_elements:
                "iframe[src|frameborder|style|scrolling|class|width|height|name|align|allowfullscreen|allow],video[controls|preload|width|height|poster|src],source[src|type]",
              valid_children: "+body[iframe|video]",
              content_style: "iframe, video { max-width: 100%; height: auto; }",
            }}
            onEditorChange={(content, editor) => setContent(content)}
          />
        </div>

        <div>
          <label>Upload Cover Image</label>
          <input
            type="file"
            onChange={(e) => setCoverImage(e.target.files[0])}
            required
          />
        </div>

        <button type="submit">Add Blog</button>
      </form>
    </div>
  );
}

export default AddBlog;

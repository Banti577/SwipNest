import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CommentBox.module.css";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const CommentBox = ({ videoId, user }) => {
  const [allComments, setAllComments] = useState([]);
  const [comment, setComment] = useState("");
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
      setToastType("");
    }, 3000);
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/video/Allcomments/${videoId}`,
          { withCredentials: true }
        );
        setAllComments(response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [videoId]);

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      showToast("Comment cannot be empty", "info");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/video/comment/${videoId}`,
        { comment },
        { withCredentials: true }
      );

      setComment("");
      setAllComments((prevComments) => [response.data, ...prevComments]);
      showToast("Comment added successfully!", "success");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        showToast("Please login to comment", "error");
      } else {
        showToast("Something went wrong while posting the comment", "error");
        console.error("Error posting comment:", error);
      }
    }
  };

  const handleGeminiSuggestion = async () => {
    if (!comment.trim()) {
      showToast("Please write a draft comment first.", "info");
      return;
    }

    setIsGeminiLoading(true);

    const systemPrompt =
      "You are a helpful assistant for writing concise and polite social media comments. Take the user's draft comment and rewrite it to be more professional, positive, and clear. Do not use any filler text or greetings, just provide the rewritten comment. Keep it to one or two sentences.";
    const userQuery = comment;
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ google_search: {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      const newComment = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (newComment) {
        setComment(newComment);
        showToast("Comment improved successfully!", "success");
      } else {
        showToast("Could not get a suggestion. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      showToast("An error occurred while getting a suggestion.", "error");
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const handleCommentDelete = async(commentId) =>{
    try{
    await axios.delete(`${BASE_URL}/video/deleteComment/${commentId}`,{ withCredentials: true });
    setAllComments((prev) => prev.filter(c => c._id !== commentId))
      showToast("Comment deleted successfully!", "success");
  }catch(error){
     showToast("Failed to delete comment", "error");

  }
}

  return (
    <>
      {toastMessage && (
        <div className={styles.toastContainer}>
          <div className={`${styles.toast} ${styles[toastType]}`}>
            {toastMessage}
          </div>
        </div>
      )}

      <div className={styles.commentSection}>
        <h3>Comments</h3>

        {/* Comment Input Box */}
        <div className={styles.commentInputBox}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <div className={styles.commentButtons}>
            <button onClick={handleGeminiSuggestion} disabled={isGeminiLoading}>
              {isGeminiLoading ? "Improving..." : "Improve Comment ✨"}
            </button>
            <button onClick={handleCommentSubmit} disabled={isGeminiLoading}>
              Comment
            </button>
          </div>
        </div>

        {/* Comment List */}
        {allComments.length === 0 ? (
          <p className="text-center text-gray-500">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {allComments.map((c) => (
              <div key={c._id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <strong>{c.commentBy?.FullName || "Unknown"}</strong>{" "}
                  {c.edited && <span className={styles.edited}>(edited)</span>}
                </div>
                <div className={styles.commentText}>{c.text || c.comment}</div>

                <div className={styles.commentActions}>
                  <span>👍 {c.likes?.length || 0}</span>
                  <span>👎 {c.dislikes?.length || 0}</span>
                  <span>💬 Reply</span>
                  <span>✏️ Edit</span>
                  {user && user._id === c.commentBy?._id && (
                    <button onClick={()=>{
                     handleCommentDelete(c._id);
                    }}>🗑️ delete</button>
                  )}
                </div>

                {c.replies?.length > 0 && (
                  <div className={styles.commentReplies}>
                    {c.replies.map((r) => (
                      <div className={styles.reply} key={r._id}>
                        <strong>{r.commentBy?.FullName || "Unknown"}</strong>
                        <div className={styles.replyText}>{r.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CommentBox;

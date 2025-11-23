import Post from "../Post";
import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from "react";
import "./IndexPage.css";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const posts = await response.json();
        setPosts(posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h2>No posts yet</h2>
        <p>Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>Latest Posts</h1>
        <p>Discover amazing stories and insights from our community</p>
      </div>
      <div className="posts-grid">
        {posts.map((post, index) => (
          <div
            key={post._id}
            className="post-wrapper"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Post {...post} />
          </div>
        ))}
      </div>
    </div>
  );
}

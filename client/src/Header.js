import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/profile`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userInfo = await response.json();
          setUserInfo(userInfo);
        } else {
          setUserInfo(null);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setUserInfo(null);
      }
    }

    fetchProfile();
  }, [setUserInfo]);

  function logout() {
    fetch(`${process.env.REACT_APP_API_URL}/logout`, {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      setUserInfo(null);
    }).catch((err) => {
      console.error("Logout error:", err);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">BlogIt</Link>
      <nav>
        {username ? (
          <>
            <Link to="/create">Create new post</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
              Logout ({username})
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

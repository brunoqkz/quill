import "./style.scss";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  API_ENDPOINTS,
  QUILL_ROLES,
  MANUSCRIPT_STAGES,
} from "../../../utils/constants";

/**
 * Dashboard component
 * @returns {JSX.Element}
 */
function Manuscripts() {
  const { user, token, isTokenValid } = useAuth();
  const [manuscripts, setManuscripts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    } else {
      fetchManuscripts();
    }
  }, []);

  // Fetch manuscripts from the API
  const fetchManuscripts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MANUSCRIPTS.BASE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        // Redirect to Dashboard if user is not authorized
        if (response.status === 403) {
          navigate("/dashboard");
        }
        throw new Error("Failed to fetch manuscripts");
      }
      const data = await response.json();
      setManuscripts(data);
      console.log("Fetched manuscripts:", data);
    } catch (error) {
      console.error("Error fetching manuscripts:", error);
    }
  };

  function getArticleTitle() {
    let userRole = user.role_id;
    if (userRole == QUILL_ROLES.ADMIN) {
      return "Manuscript Management";
    }
    if (userRole == QUILL_ROLES.EMPLOYEE) {
      return "Manuscript Queue";
    }
    if (userRole == QUILL_ROLES.AUTHOR) {
      return "My Manuscripts";
    } else {
      console.error("Invalid user role");
      return "";
    }
  }

  return (
    <article className="manuscripts flex flex-col">
      <div>
        <h2>{getArticleTitle()}</h2>
      </div>

      {/* Title row */}
      <div
        className={`titles ${
          user?.role_id != QUILL_ROLES.AUTHOR ? "grid-4" : "grid-3"
        }`}
      >
        <div className="title-header">
          <p>Title</p>
        </div>
        {user && user.role_id != QUILL_ROLES.AUTHOR && (
          <div className="author-header">
            <p>Author</p>
          </div>
        )}
        <div className="stage-header">
          <p>Stage</p>
        </div>
        <div className="action-header">
          <p>Action</p>
        </div>
      </div>

      {/* Manuscript rows */}
      {manuscripts.map((manuscript) => (
        <div
          key={manuscript.id}
          className={`manuscript-item ${
            user?.role_id != QUILL_ROLES.AUTHOR ? "grid-4" : "grid-3"
          }`}
        >
          <div className="title">
            <p>{manuscript.title}</p>
          </div>
          {user && user.role_id != QUILL_ROLES.AUTHOR && (
            <div className="author">
              <p>{manuscript.author}</p>
            </div>
          )}
          <div className="stage">
            <p>{MANUSCRIPT_STAGES[manuscript.current_step]}</p>
          </div>
          <div className="action">
            <button
              className="btn-action"
              onClick={() => {
                navigate(`/manuscript/${manuscript.id}`, {
                  state: { manuscript },
                });
              }}
            >
              {user && user.role_id == QUILL_ROLES.AUTHOR
                ? "View Timeline"
                : "View"}
            </button>
          </div>
        </div>
      ))}
    </article>
  );
}

export default Manuscripts;

/* <Manuscript
      key={manuscript.id}
      details={manuscript}
    /> */

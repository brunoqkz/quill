import "./style.scss";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QUILL_ROLES, MANUSCRIPT_STAGES } from "../../../utils/constants";

/**
 * Manuscripts component
 *
 * @component
 * @description This component displays a list of manuscripts based on the user's role.
 * @param {object} manuscripts - Array of manuscripts
 * @returns {JSX.Element}
 */
function Manuscripts({ manuscripts }) {
  const { user, isTokenValid } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, []);

  /**
   * Get the title of the article based on user role   *
   * @returns {string} The title of the article based on user role
   */
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

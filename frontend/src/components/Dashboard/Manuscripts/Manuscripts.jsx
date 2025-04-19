import { useNavigate } from "react-router-dom";
import {
  API_ENDPOINTS,
  MANUSCRIPT_STAGES,
  QUILL_ROLES,
} from "../../../utils/constants";
import { useAuth } from "../../AuthProvider";
import "./Manuscripts.scss";

/**
 * Manuscripts component
 *
 * @component
 * @description This component displays a list of manuscripts based on the user's role.
 * @param {object} manuscripts - Array of manuscripts
 * @returns {JSX.Element}
 */
function Manuscripts({ manuscripts, setManuscripts }) {
  const { user, token } = useAuth();

  const navigate = useNavigate();

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

  async function handleAdvanceManuscript(manuscriptId) {
    try {
      const response = await fetch(
        API_ENDPOINTS.MANUSCRIPTS.ADVANCE(manuscriptId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        // update the manuscripts state to reflect the changes
        const updatedManuscripts = manuscripts.map((manuscript) => {
          if (manuscript.id === manuscriptId) {
            return {
              ...manuscript,
              current_step: manuscript.current_step + 1,
            };
          }
          return manuscript;
        });
        setManuscripts(updatedManuscripts);
        alert("Manuscript advanced successfully.");
      } else {
        throw new Error("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Server error.");
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
            {user && user.role_id == QUILL_ROLES.AUTHOR && (
              <button
                className="btn-action"
                onClick={() => {
                  navigate(`/manuscript/${manuscript.id}`, {
                    state: { manuscript },
                  });
                }}
              >
                View Timeline
              </button>
            )}
            {user && user.role_id != QUILL_ROLES.AUTHOR && (
              <>
                <button
                  className="btn-action"
                  onClick={() => {
                    navigate(`/book/${manuscript.id}`, {
                      state: { manuscript },
                    });
                  }}
                >
                  View
                </button>
                {manuscript.current_step < 7 && (
                  <button
                    className="btn-advance"
                    onClick={() => {
                      handleAdvanceManuscript(manuscript.id);
                    }}
                  >
                    Advance
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </article>
  );
}

export default Manuscripts;

import "./style.scss";
import {
  API_ENDPOINTS,
  QUILL_ROLES,
  MANUSCRIPT_STAGES,
} from "../../utils/constants";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { useEffect } from "react";

function Manuscript() {
  const { manuscriptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const manuscript = location.state?.manuscript;
  const { user, token, isTokenValid } = useAuth();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    const isAuthenticated = token && isTokenValid();
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [token, isTokenValid, navigate]);

  if (!user || !token) {
    return null;
  }

  if (!manuscript) {
    console.error("No manuscript data available");
    navigate("/dashboard");
    return null;
  }

  const { title, description, author, current_step } = manuscript;

  // Convert MANUSCRIPT_STAGES object to an array of stage names
  const stages = Object.values(MANUSCRIPT_STAGES);

  return (
    <div className="manuscript-container">
      <div className="manuscript-steps">
        {stages.slice(0, 7).map((stage, index) => (
          <div key={index} className="step-wrapper">
            <p className={index + 1 == current_step ? "active-stage" : ""}>
              {stage}
            </p>
            <div
              className={`circle ${index + 1 == current_step ? "active" : ""}`}
            >
              {index + 1}
            </div>
            {index < 6 && <div className="line" />}
          </div>
        ))}
      </div>

      <div className="manuscript-details">
        <div className="detail-wrapper">
          <div className="label-wrapper">
            <label>Author</label>
          </div>
          <div className="info-wrapper">
            <p>{author}</p>
          </div>
        </div>

        <div className="detail-wrapper">
          <div className="label-wrapper">
            <label>Book Title</label>
          </div>
          <div className="info-wrapper">
            <p>{title}</p>
          </div>
        </div>

        <div className="detail-wrapper">
          <div className="label-wrapper">
            <label>Book Description</label>
          </div>
          <div className="info-wrapper">
            <p>{description}</p>
          </div>
        </div>

        {current_step == 8 && (
          <div className="detail-wrapper">
            <div className="label-wrapper cancelled">
              <label>Status</label>
            </div>
            <div className="info-wrapper cancelled">
              <p>The publication process been cancelled.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Manuscript;

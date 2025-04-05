import "./style.scss";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QUILL_ROLES, MANUSCRIPT_STAGES } from "../../../utils/constants";
import { GoBook } from "react-icons/go";
import { TfiComments } from "react-icons/tfi";
import { MdOutlineCancel } from "react-icons/md";

/**
 * Summary component
 *
 * @component
 * @description This component displays a summary of manuscripts based on the user's role.
 * @param {object} manuscripts - Array of manuscripts
 * @returns {JSX.Element}
 */
function Summary({ manuscripts }) {
  const { user, isTokenValid } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, []);

  /**
   * Get total number of comments across all manuscripts   *
   * @returns {number} Total number of comments across all manuscripts
   */
  function getTotalManuscriptsCommentsCount() {
    return manuscripts.reduce((total, manuscript) => {
      return total + manuscript.comments.length;
    }, 0);
  }

  /**
   * Get the count of manuscripts in each stage
   * @returns {object} Count of manuscripts in each stage
   */
  function getManuscriptCountByStage() {
    const countByStage = {};

    // Initialize all stages with 0 count
    Object.values(MANUSCRIPT_STAGES).forEach((stage) => {
      countByStage[stage] = 0;
    });

    manuscripts.forEach((manuscript) => {
      const step = manuscript.current_step;
      const stageName = MANUSCRIPT_STAGES[step];
      countByStage[stageName]++;
    });

    return (
      <ul>
        {Object.entries(countByStage).map(([stage, count]) => (
          <li key={stage}>
            {stage}
            {count > 0 && ` (${count})`}
          </li>
        ))}
      </ul>
    );
  }

  /**
   * Get the count of active manuscripts (not cancelled)
   * @return {number} Count of active manuscripts
   */
  function getActiveManuscriptsCount() {
    return manuscripts.filter((manuscript) => manuscript.current_step !== 8)
      .length;
  }

  /**
   * Get the count of cancelled manuscripts
   * @return {number} Count of cancelled manuscripts
   */
  function getCancelledManuscriptsCount() {
    return manuscripts.filter((manuscript) => manuscript.current_step === 8)
      .length;
  }

  return (
    <div className="summary flex flex-col">
      {user && user.role_id == QUILL_ROLES.EMPLOYEE ? (
        <>
          <h2>Tasks Summary</h2>
          <div className="tasks-summary flex flex-col gap-8">
            <div className="summary-item flex gap-4">
              <GoBook className="icon" />
              <p>
                {getActiveManuscriptsCount()} active manuscript(s) assigned to
                your Department
              </p>
            </div>
            <div className="summary-item flex gap-4">
              <TfiComments className="icon" />
              <p>
                {getTotalManuscriptsCommentsCount()} comment(s) on available
                manuscripts
              </p>
            </div>
            <div className="summary-item flex gap-4">
              <MdOutlineCancel className="icon" />
              <p>{getCancelledManuscriptsCount()} cancelled manuscript(s)</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2>Manuscripts Status</h2>
          {getManuscriptCountByStage()}
        </>
      )}
    </div>
  );
}

export default Summary;

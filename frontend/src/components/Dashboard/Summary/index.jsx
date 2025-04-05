import "./style.scss";
import { useAuth } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  API_ENDPOINTS,
  QUILL_ROLES,
  MANUSCRIPT_STAGES,
} from "../../../utils/constants";
import { GoBook } from "react-icons/go";
import { TfiComments } from "react-icons/tfi";
import { MdOutlineCancel } from "react-icons/md";

/**
 * Dashboard component
 * @returns {JSX.Element}
 */
function Summary({ manuscripts }) {
  const { user, token, isTokenValid } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, []);

  function getTotalManuscriptsCommentsCount() {
    return manuscripts.reduce((total, manuscript) => {
      return total + manuscript.comments.length;
    }, 0);
  }

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

  function getActiveManuscriptsCount() {
    return manuscripts.filter((manuscript) => manuscript.current_step !== 8)
      .length;
  }

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

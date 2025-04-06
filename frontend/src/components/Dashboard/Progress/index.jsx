import "./style.scss";
import { MANUSCRIPT_STAGES } from "../../../utils/constants";

/**
 * Progress component
 *
 * @component
 * @description This component displays the percentage of manuscripts in each department as progress bars.
 * @param {object} manuscripts - Array of manuscripts
 * @returns {JSX.Element}
 */
function Progress({ manuscripts }) {
  /**
   * Calculates the percentage of manuscripts in each stage.
   * @param {object} manuscripts - Array of manuscript objects.
   * @returns {Object} - An object containing the percentage of manuscripts in each stage.
   */
  const calculateStagesPercentage = (manuscripts) => {
    const total = manuscripts.length;
    const counts = {};

    manuscripts.forEach((m) => {
      const stageId = m.current_step;
      if (stageId) {
        counts[stageId] = (counts[stageId] || 0) + 1;
      }
    });

    const percentages = {};
    Object.entries(MANUSCRIPT_STAGES).forEach(([stageId, stageName]) => {
      const count = counts[stageId] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      if (percentage > 0) {
        percentages[stageName] = percentage;
      }
    });

    return percentages;
  };

  const percentages = calculateStagesPercentage(manuscripts);

  if (Object.keys(percentages).length === 0) {
    return <p>No manuscript progress to show.</p>;
  }

  return (
    <div className="progress-container">
      <h3>Manuscripts by Workflow Stage</h3>
      {Object.entries(percentages).map(([stage, percent], index) => (
        <div className="progress-box" key={stage}>
          <span className="progress-title">{stage}</span>
          <div className="progress-bar">
            <span
              className="progress-fill"
              style={{
                animationDelay: `${0.1 + index * 0.1}s`,
                width: `${percent}%`,
              }}
            >
              <span className="tooltip">{percent}%</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Progress;

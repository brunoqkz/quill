import "./style.scss";
import { useAuth } from "../AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { API_ENDPOINTS, MANUSCRIPT_STAGES } from "../../utils/constants";
import DOMPurify from "dompurify";

/**
 * BookDashboard component
 *
 * @component
 * @returns {JSX.Element}
 */
function BookDashboard() {
  const { user, token, isTokenValid } = useAuth();
  const { manuscriptId } = useParams();
  const location = useLocation();
  const manuscript = location.state?.manuscript;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const navigate = useNavigate();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    const isAuthenticated = token && isTokenValid();
    if (!isAuthenticated) {
      navigate("/");
    } else {
      setComments(manuscript.comments);
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

  function renderProgressIndicator(currentStep) {
    if (currentStep == 8) {
      return (
        <div className="flex items-center justify-center text-gray-500">
          <p className="text-sm">This manuscript has been cancelled.</p>
        </div>
      );
    }

    const stageEntries = Object.entries(MANUSCRIPT_STAGES).filter(
      ([id]) => Number(id) <= currentStep + 1 && Number(id) !== 8
    );

    const stageCount = stageEntries.length;

    return (
      <div>
        <h2 className="sr-only">Steps</h2>

        <div className="after:mt-4 after:block after:h-1 after:w-full after:rounded-lg after:bg-gray-200">
          <ol
            className={`grid grid-cols-${stageCount} text-sm font-medium text-gray-500`}
          >
            {stageEntries.map(([id, label], index) => {
              const positionClass =
                index === 0
                  ? "justify-start"
                  : index === stageEntries.length - 1
                  ? "justify-end"
                  : "justify-center";

              const isActive = Number(id) < currentStep;
              const dotColor = isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-white";
              const textColor = isActive ? "txt-blue" : "";

              return (
                <li
                  key={id}
                  className={`relative flex ${positionClass} ${textColor}`}
                >
                  <span
                    className={`absolute ${
                      index === 0
                        ? "start-0"
                        : index === stageEntries.length - 1
                        ? "end-0"
                        : "left-1/2 -translate-x-1/2"
                    } -bottom-[1.75rem] rounded-full ${dotColor}`}
                  >
                    <svg
                      className="size-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>

                  <span className="hidden sm:block">{label}</span>

                  <svg
                    className={`size-6 sm:hidden ${
                      positionClass === "justify-center" ? "mx-auto" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  async function handleSubmitComment() {
    if (newComment.trim() === "") {
      alert("Please enter a comment.");
      return;
    }
    const sanitizedComment = DOMPurify.sanitize(newComment);

    try {
      const response = await fetch(
        API_ENDPOINTS.MANUSCRIPTS.COMMENTS(manuscript.id),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: sanitizedComment }),
        }
      );

      if (response.status === 201) {
        setComments((prev) => [
          {
            id: manuscript.comments.length + 1,
            author: user.name,
            content: sanitizedComment,
            step_id: manuscript.current_step,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewComment("");
      } else if (response.status === 400) {
        alert("Invalid input.");
      } else {
        throw new Error("Something went wrong.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Server error.");
    }
  }

  return (
    <div className="book-dashboard flex gap-8">
      <div className="left flex flex-col">
        <div className="summary flex flex-col">
          <h2>{manuscript.title}</h2>
          <div className="info flex gap-10">
            <div className="info-wrapper flex gap-4">
              <label>Current Stage:</label>{" "}
              <p>{MANUSCRIPT_STAGES[manuscript.current_step]}</p>
            </div>
            <div className="info-wrapper flex gap-4">
              <label>Author:</label> <p>{manuscript.author}</p>
            </div>
          </div>
          <div className="info flex gap-10">
            <div className="info-wrapper flex gap-4">
              <label>Next Stage:</label>{" "}
              <p>{MANUSCRIPT_STAGES[manuscript.current_step + 1]}</p>
            </div>
            <div className="info-wrapper flex gap-4">
              <label>Description:</label> <p>{manuscript.description}</p>
            </div>
          </div>
        </div>
        <div className="status flex-col">
          <h2 className="text-nowrap">Progress Indicator</h2>
          {/* {renderProgressIndicator(manuscript.current_step)} */}
        </div>
        <div className="comments-card">
          <h2>Comments</h2>
          {comments.map((comment, index) => (
            <div key={comment.id} className="comment-item">
              <p className="content">“{comment.content}”</p>
              <p className="meta">
                – {comment.manuscriptTitle} by {comment.author}
              </p>
              {index < comments.length - 1 && <hr />}
            </div>
          ))}
          {/** Text Area Input */}
          <div className="comment-input flex gap-8">
            <textarea
              className="comment-textarea"
              placeholder="Add a comment..."
              rows="4"
              cols="50"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button className="btn btn-primary" onClick={handleSubmitComment}>
              Send
            </button>
          </div>
        </div>
      </div>
      <div className="right flex flex-col"></div>
    </div>
  );
}

export default BookDashboard;

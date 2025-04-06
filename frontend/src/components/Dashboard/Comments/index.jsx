import "./style.scss";

/**
 * Comments component
 *
 * @component
 * @description This component displays the most recent comments from the manuscripts.
 * @param {object} manuscripts - Array of manuscripts
 * @returns {JSX.Element}
 */
function Comments({ manuscripts }) {
  /**
   * Get the most three recent comments from all the manuscripts
   * * @returns {Array} Array of comments
   */
  const getMostRecentComments = () => {
    const allComments = manuscripts.flatMap((manuscript) =>
      manuscript.comments.map((comment) => ({
        ...comment,
        manuscriptTitle: manuscript.title,
      }))
    );
    // Limit the number of comments to show
    let commentsToShow = 3;
    // Sort comments by created_at date and get the most recent four
    return allComments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, commentsToShow);
  };

  const recentComments = getMostRecentComments();

  return (
    <div className="comments-card">
      <h2>Latest Feedback</h2>
      {recentComments.map((comment, index) => (
        <div key={comment.id} className="comment-item">
          <p className="content">“{comment.content}”</p>
          <p className="meta">
            – {comment.manuscriptTitle} by {comment.author}
          </p>
          {index < recentComments.length - 1 && <hr />}
        </div>
      ))}
    </div>
  );
}

export default Comments;

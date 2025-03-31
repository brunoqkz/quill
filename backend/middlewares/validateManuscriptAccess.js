const dbPool = require("../database");

/**
 * Middleware to validate manuscript access based on user role and manuscript ID.
 * Admin can access all manuscripts, authors can access their own manuscripts,
 * and department members can access manuscripts assigned to their department.
 *
 * @param {object} req - The request object containing user information and manuscript ID.
 * @param {object} res - The response object to send the result.
 * @param {function} next - The next middleware function to call.
 * @returns {void}
 *
 */
const validateManuscriptAccess = async (req, res, next) => {
  try {
    // Get the user from the database
    const firebase_uid = req.user.uid;
    const [currentUser] = await dbPool.query(
      "SELECT id, role_id FROM users WHERE firebase_uid = ?",
      [firebase_uid]
    );

    if (currentUser.length === 0) {
      return res.status(403).json({ error: "Access Denied." });
    }

    const currentUserId = currentUser[0].id;
    const currentUserRoleId = currentUser[0].role_id;
    req.currentUserId = currentUserId;
    req.currentUserRoleId = currentUserRoleId;

    // Validate manuscript access
    const manuscriptId = req.params.id;
    const manuscript = await authorizeManuscriptAccess(
      manuscriptId,
      currentUserId,
      currentUserRoleId
    );

    if (!manuscript) {
      return res
        .status(404)
        .json({ error: "Manuscript not found or access denied." });
    }

    // Attach the manuscript to the request object for use in later middleware or routes
    req.manuscript = manuscript;
    next();
  } catch (err) {
    console.error("Error validating manuscript access:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single manuscript by ID with permission validation.
 * Admin can access all manuscripts, authors can access their own manuscripts,
 * and department members can access manuscripts assigned to their department.
 *
 * @param {number} manuscriptId - The ID of the manuscript.
 * @param {number} userId - The ID of the current user.
 * @param {number} userRoleId - The role ID of the current user.
 * @returns {object|null} - Returns manuscript details if permitted, otherwise null.
 */
const authorizeManuscriptAccess = async (manuscriptId, userId, userRoleId) => {
  try {
    const [manuscripts] = await dbPool.query(
      `SELECT 
            b.id AS id, 
            u.id AS author_id, 
            bw.step_id AS current_step, 
            bw.assigned_department AS assigned_department
        FROM books b
        INNER JOIN authors a ON a.id = b.author_id
        INNER JOIN users u ON u.id = a.user_id
        INNER JOIN book_workflow bw ON bw.book_id = b.id
        LEFT JOIN employees e ON e.department_id = bw.assigned_department
        LEFT JOIN users ue ON ue.id = e.user_id
        WHERE 
            b.id = ? 
        AND 
            (
                ? = 1 -- Admin can access everything
            OR 
                (u.id = ? AND ? = 3) -- Author can access own manuscripts
            OR 
                (ue.id = ? AND ? = 2) -- Department members can access assigned manuscripts
            )`,
      [manuscriptId, userRoleId, userId, userRoleId, userId, userRoleId]
    );

    return manuscripts.length > 0 ? manuscripts[0] : null;
  } catch (error) {
    console.error("Error validating user permission:", error);
    throw new Error("Database error");
  }
};

module.exports = { validateManuscriptAccess };

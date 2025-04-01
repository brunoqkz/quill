const express = require("express");
const router = express.Router();
const dbPool = require("../database");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  validateManuscriptAccess,
} = require("../middlewares/validateManuscriptAccess");

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * Get all manuscripts for the logged-in user.
 *
 * @name GET /manuscripts
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the manuscripts.
 * @returns {number} res.status - The HTTP status code.
 * @returns {Array} res.body - The array of manuscripts.
 *
 */
router.get("/", async (req, res) => {
  try {
    // Get the user from the database
    const firebase_uid = req.user.uid;
    const [currentUser] = await dbPool.query(
      "SELECT role_id FROM users WHERE firebase_uid = ?",
      [firebase_uid]
    );
    // Check if the user exists
    if (currentUser.length === 0) {
      return res.status(403).json({ error: "Access Denied." });
    }
    const currentUserId = currentUser[0].id;
    const currentUserRoleId = currentUser[0].role_id;

    // If the user is an admin, fetch all manuscripts
    if (currentUserRoleId === 1) {
      const [manuscripts] = await dbPool.query(
        `SELECT
            b.id AS id, 
            b.title AS title,
            b.description AS description,
            u.name AS author, 
            b.step_id AS current_step, 
            COALESCE(GROUP_CONCAT(DISTINCT d.id ORDER BY d.id SEPARATOR ', '), '') AS assigned_departments
          FROM books b
          INNER JOIN authors a ON a.id = b.author_id
          INNER JOIN users u ON u.id = a.user_id
          LEFT JOIN department_workflow_steps dws ON dws.workflow_step_id = b.step_id
          LEFT JOIN departments d ON d.id = dws.department_id
          GROUP BY b.id, b.title, b.description, u.name, b.step_id`
      );
      // If no manuscripts are found
      if (manuscripts.length === 0) {
        return res.status(204).end();
      }
      // Prepare the manuscripts for the response
      manuscripts.forEach((manuscript) => {
        manuscript.assigned_departments = manuscript.assigned_departments
          ? manuscript.assigned_departments.split(",").map(Number)
          : [];
      });
      // TODO: Remove Debugging
      console.log(manuscripts);
      return res.status(200).json(manuscripts);
    }

    // Fetch manuscripts based on user role (author or employee)
    // Authors can only see their own manuscripts
    // Employees can see manuscripts assigned to their department
    const [manuscripts] = await dbPool.query(
      `SELECT 
          b.id AS id, 
          b.title AS title,
          b.description AS description,
          u.name AS author, 
          b.step_id AS current_step, 
          COALESCE(GROUP_CONCAT(DISTINCT d.id ORDER BY d.id SEPARATOR ', '), '') AS assigned_departments
        FROM books b
        INNER JOIN authors a ON a.id = b.author_id
        INNER JOIN users u ON u.id = a.user_id
        LEFT JOIN department_workflow_steps dws ON dws.workflow_step_id = b.step_id
        LEFT JOIN departments d ON d.id = dws.department_id
        LEFT JOIN employees e ON e.department_id = d.id
        LEFT JOIN users ue ON ue.id = e.user_id
        WHERE 
          (u.id = ? AND ? = 3)
        OR 
          (ue.id = ? AND ? = 2)
        GROUP BY b.id, b.title, b.description, u.name, b.step_id`,
      [currentUserId, currentUserRoleId, currentUserId, currentUserRoleId]
    );

    if (manuscripts.length === 0) {
      return res.status(204).end();
    }
    // Prepare the manuscripts for the response
    manuscripts.forEach((manuscript) => {
      manuscript.assigned_departments = manuscript.assigned_departments
        ? manuscript.assigned_departments.split(",").map(Number)
        : [];
    });
    // TODO: Remove Debugging
    console.log(manuscripts);
    return res.status(200).json(manuscripts);
  } catch (err) {
    console.error("Error fetching manuscripts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get a single manuscript by ID.
 *
 * @name GET /manuscripts/:id
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The manuscript ID.
 * @returns {Object} - The response object containing the manuscript details.
 * @returns {number} res.status - The HTTP status code.
 */
router.get("/:id", validateManuscriptAccess, async (req, res) => {
  try {
    // Get the manuscript from the request parameters
    const manuscript = req.manuscript;

    // If manuscript is not found
    if (!manuscript) {
      return res.status(403).json({ error: "Access Denied." });
    }

    return res.status(200).json(manuscript);
  } catch (err) {
    console.error("Error fetching manuscript:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get all comments for a manuscript.
 *
 * @name GET /manuscripts/:id/comments
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * * @returns {Object} - The response object containing the list of comments.
 * @returns {number} res.status - The HTTP status code.
 */
router.get("/:id/comments", validateManuscriptAccess, async (req, res) => {
  try {
    // Get the manuscript from the request parameters
    const manuscript = req.manuscript;

    // If manuscript is not found
    if (!manuscript) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Query the database to get all comments for the manuscript
    const [comments] = await dbPool.query(
      `SELECT c.id, c.step_id, c.content, c.created_at, u.name AS author
         FROM comments c
         INNER JOIN users u ON u.id = c.user_id
         WHERE c.book_id = ?
         ORDER BY c.created_at DESC`,
      [manuscript.id]
    );

    // If no comments are found
    if (comments.length === 0) {
      return res
        .status(204)
        .json({ error: "No comments found for this manuscript." });
    }

    // TODO: Remove Debugging
    console.log(comments);
    return res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * Add a comment to a manuscript.
 *
 * @name POST /manuscripts/:id/comments
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} req.params.id - The manuscript ID.
 * @param {string} req.body.content - The comment content.
 * @param {number} req.body.step_id - The step ID.
 * @returns {Object} - The response object containing the status of the operation.
 * @returns {number} res.status - The HTTP status code.
 */
router.post("/:id/comments", validateManuscriptAccess, async (req, res) => {
  try {
    // Get Request Parameters
    const userId = req.currentUserId;
    const manuscript = req.manuscript;
    const { content } = req.body;

    // If manuscript is not found
    if (!manuscript) {
      return res.status(403).json({ error: "Access Denied." });
    }

    if (!content) {
      return res.status(400).json({ error: "Invalid input." });
    }

    // Insert the comment into the database
    const [result] = await dbPool.query(
      `INSERT INTO comments (book_id, user_id, step_id, content) 
         VALUES (?, ?, ?, ?)`,
      [manuscript.id, userId, manuscript.current_step, content]
    );
    // Check if the insert was successful
    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Internal server error." });
    }
    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Advances the manuscript to the next step in the workflow.
 *
 * @name POST /manuscripts/:id/advance
 * @function
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object containing the status of the operation.
 * @returns {number} res.status - The HTTP status code.
 */
router.post("/:id/advance", validateManuscriptAccess, async (req, res) => {
  try {
    // Get Request Parameters
    const manuscript = req.manuscript;
    const currentStep = manuscript.current_step;

    // Get the next step from the workflow
    const [nextStep] = await dbPool.query(
      "SELECT next_step_id FROM workflow_order WHERE step_id = ?",
      [currentStep]
    );
    // Check if there is a next step available
    if (nextStep.length === 0 || nextStep[0].next_step_id === null) {
      return res.status(204).end();
    }
    const newStepId = nextStep[0].next_step_id;

    // Update the manuscript's current step in the database
    await dbPool.query("UPDATE books SET current_step = ? WHERE id = ?", [
      newStepId,
      manuscript.id,
    ]);
    res.status(200).json({ message: "Manuscript advanced to the next step." });
  } catch (err) {
    console.error("Error advancing manuscript:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

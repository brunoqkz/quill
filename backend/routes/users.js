/**
 * User management API routes
 * @module routes/users
 */

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken } = require("../middlewares/authMiddleware");
const firebaseAdmin = require("../firebase-admin");

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * Checks if a user has admin role
 * @async
 * @param {string} uid - Firebase UID of the user
 * @returns {Promise<boolean>} True if user has admin role, false otherwise
 */
const isAdmin = async (uid) => {
  try {
    const [rows] = await pool.query(
      "SELECT role_id FROM users WHERE firebase_uid = ?",
      [uid]
    );
    return rows.length > 0 && rows[0].role_id === 1; // Assuming role_id=1 is admin
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

/**
 * Get a list of users (admin only)
 *
 * @name GET /api/users
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number for pagination
 * @param {number} [req.query.limit=10] - Number of items per page
 * @param {Object} req.user - User object from authentication middleware
 * @param {string} req.user.uid - Firebase UID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with users array or error
 */
router.get("/", async (req, res) => {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin(req.user.uid);
    if (!isUserAdmin) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Optional pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get users with pagination
    const [users] = await pool.query(
      `SELECT id, name, email, role_id, created_at 
       FROM users 
       ORDER BY id 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * Create a new user (admin only)
 *
 * @name POST /api/users
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {number} req.body.role_id - User's role ID
 * @param {Object} req.user - User object from authentication middleware
 * @param {string} req.user.uid - Firebase UID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
router.post("/", async (req, res) => {
  try {
    // Check if user is admin
    const isUserAdmin = await isAdmin(req.user.uid);
    if (!isUserAdmin) {
      return res.status(403).json({ error: "Access Denied." });
    }

    const { name, email, password, role_id } = req.body;

    // Validate input
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ error: "Invalid input." });
    }

    // Email and password validation patterns
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!emailRegex.test(email) || !passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Invalid input.",
      });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let userRecord;
    try {
      // Create user in Firebase
      userRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      // Set custom claim for role
      await firebaseAdmin
        .auth()
        .setCustomUserClaims(userRecord.uid, { role_id });

      // Insert the user into MySQL
      const [result] = await connection.query(
        "INSERT INTO users (firebase_uid, name, email, role_id) VALUES (?, ?, ?, ?)",
        [userRecord.uid, name, email, role_id]
      );

      // Commit the transaction
      await connection.commit();

      res.status(201).json({
        message: "User created successfully.",
        userId: result.insertId,
      });
    } catch (error) {
      // Rollback the transaction
      await connection.rollback();

      // Delete Firebase user if exists
      if (userRecord && userRecord.uid) {
        await firebaseAdmin.auth().deleteUser(userRecord.uid);
      }

      if (error.code === "auth/email-already-exists") {
        return res.status(400).json({ error: "Invalid input." });
      }

      throw error; // Pass to outer catch block
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * Get user details by ID (admin or same user)
 *
 * @name GET /api/users/:userId
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.userId - User ID to retrieve
 * @param {Object} req.user - User object from authentication middleware
 * @param {string} req.user.uid - Firebase UID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details or error
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has permission (admin or the same user)
    const [currentUser] = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = ?",
      [req.user.uid]
    );

    const isUserAdmin = await isAdmin(req.user.uid);
    const isSameUser =
      currentUser.length > 0 && currentUser[0].id === parseInt(userId);

    if (!isUserAdmin && !isSameUser) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Get basic user info
    const [users] = await pool.query(
      `SELECT id, name, email, role_id, created_at 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[0];

    // Get role-specific information
    if (user.role_id === 3) {
      // Author
      const [authorInfo] = await pool.query(
        "SELECT bio, website FROM authors WHERE user_id = ?",
        [userId]
      );

      if (authorInfo.length > 0) {
        Object.assign(user, authorInfo[0]);
      }
    } else if (user.role_id === 2) {
      // Employee
      const [employeeInfo] = await pool.query(
        `SELECT d.name as department 
         FROM employees e
         JOIN departments d ON e.department_id = d.id
         WHERE e.user_id = ?`,
        [userId]
      );

      if (employeeInfo.length > 0) {
        Object.assign(user, employeeInfo[0]);
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user details:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * Update user details (admin or same user)
 *
 * @name PATCH /api/users/:userId
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.userId - User ID to update
 * @param {Object} req.body - Request body with fields to update
 * @param {string} [req.body.name] - User's updated name
 * @param {string} [req.body.email] - User's updated email
 * @param {number} [req.body.role_id] - User's updated role ID (admin only)
 * @param {Object} req.user - User object from authentication middleware
 * @param {string} req.user.uid - Firebase UID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
router.patch("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role_id } = req.body;

    // Validation
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Invalid input." });
    }

    if (
      email &&
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      return res.status(400).json({ error: "Invalid input." });
    }

    // Check permissions (admin or same user)
    const [currentUser] = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = ?",
      [req.user.uid]
    );

    const isUserAdmin = await isAdmin(req.user.uid);
    const isSameUser =
      currentUser.length > 0 && currentUser[0].id === parseInt(userId);

    if (!isUserAdmin && !isSameUser) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Only admin can change role_id
    if (role_id !== undefined && !isUserAdmin) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Get the current user firebase_uid
    const [userRows] = await pool.query(
      "SELECT firebase_uid FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const firebaseUid = userRows[0].firebase_uid;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update Firebase user if email or name changed
      if (email || name) {
        const firebaseUpdates = {};
        if (email) firebaseUpdates.email = email;
        if (name) firebaseUpdates.displayName = name;

        await firebaseAdmin.auth().updateUser(firebaseUid, firebaseUpdates);
      }

      // Update role claim if role changed
      if (role_id !== undefined) {
        await firebaseAdmin
          .auth()
          .setCustomUserClaims(firebaseUid, { role_id });
      }

      // Build SQL update
      const updates = [];
      const params = [];

      if (name) {
        updates.push("name = ?");
        params.push(name);
      }

      if (email) {
        updates.push("email = ?");
        params.push(email);
      }

      if (role_id !== undefined) {
        updates.push("role_id = ?");
        params.push(role_id);
      }

      if (updates.length > 0) {
        params.push(userId);
        await connection.query(
          `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
          params
        );
      }

      await connection.commit();
      res.status(200).json({ message: "User updated successfully." });
    } catch (error) {
      await connection.rollback();

      if (error.code === "auth/email-already-exists") {
        return res.status(400).json({ error: "Invalid input." });
      }

      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * Delete a user by ID (admin only)
 *
 * @name DELETE /api/users/:userId
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.userId - User ID to delete
 * @param {Object} req.user - User object from authentication middleware
 * @param {string} req.user.uid - Firebase UID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} Empty response with 204 status code or error
 */
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is admin
    const isUserAdmin = await isAdmin(req.user.uid);
    if (!isUserAdmin) {
      return res.status(403).json({ error: "Access Denied." });
    }

    // Get the Firebase UID
    const [userRows] = await pool.query(
      "SELECT firebase_uid, role_id FROM users WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const firebaseUid = userRows[0].firebase_uid;
    const roleId = userRows[0].role_id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete role-specific data first
      if (roleId === 3) {
        // Author
        await connection.query("DELETE FROM authors WHERE user_id = ?", [
          userId,
        ]);
      } else if (roleId === 2) {
        // Employee
        await connection.query("DELETE FROM employees WHERE user_id = ?", [
          userId,
        ]);
      }

      // Delete user from database
      await connection.query("DELETE FROM users WHERE id = ?", [userId]);

      // Delete user from Firebase
      await firebaseAdmin.auth().deleteUser(firebaseUid);

      await connection.commit();
      res.status(204).send();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebase-admin");
const mysql = require("mysql2/promise");
const { verifyToken } = require("../middlewares/authMiddleware");

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Author self-registration
router.post("/register/author", async (req, res) => {
  console.log("Registering author...");

  const { name, email, password, role_id, bio, website } = req.body;

  // Validate input
  if (
    !name ||
    !email ||
    !password ||
    Number(role_id) !== 3 ||
    !emailRegex.test(email) ||
    !passwordRegex.test(password)
  ) {
    return res.status(400).json({ error: "Invalid input." });
  }

  let connection;
  let userRecord;

  try {
    // Start a transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Create user in Firebase
    userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claim for Quill user role
    await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role_id });

    // Insert the user into MySQL
    const [userResult] = await connection.query(
      "INSERT INTO users (firebase_uid, name, email, role_id) VALUES (?, ?, ?, ?)",
      [userRecord.uid, name, email, role_id]
    );

    const userId = userResult.insertId;

    // Insert the author into the authors table
    await connection.query(
      "INSERT INTO authors (user_id, bio, website) VALUES (?, ?, ?)",
      [userId, bio || null, website || null]
    );

    // Commit the transaction
    await connection.commit();

    res.status(201).json({
      message: "Author registered successfully.",
      uid: userRecord.uid,
      userId,
    });
  } catch (error) {
    console.error("Error during author registration:", error);

    // If any error occurs, rollback the transaction
    if (connection) await connection.rollback();

    // Undo the Firebase user creation if MySQL fails
    if (userRecord && userRecord.uid) {
      await firebaseAdmin.auth().deleteUser(userRecord.uid);
    }

    // Return appropriate error response
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already exists." });
    }

    res.status(500).json({ error: error.message || "Internal server error." });
  } finally {
    if (connection) connection.release(); // Release the connection back to the pool
  }
});

// Employee registration
router.post("/register/employee", verifyToken, async (req, res) => {
  const { name, email, password, role_id, department_id, registered_by } =
    req.body;

  // Validate input
  if (
    !name ||
    !email ||
    !password ||
    !role_id ||
    !department_id ||
    !registered_by ||
    !emailRegex.test(email) ||
    !passwordRegex.test(password)
  ) {
    return res.status(400).json({ error: "Invalid input." });
  }

  let connection;
  let userRecord;

  try {
    // Get the Firebase UID from the Middleware
    const registeredByUid = req.user.uid;

    // Get a connection from the pool
    connection = await pool.getConnection();

    // Query to check if the user is from HR department or has admin role
    const [result] = await connection.query(
      `SELECT r.name AS role, d.name AS department FROM users u
         JOIN roles r ON u.role_id = r.id
         LEFT JOIN employees e ON u.id = e.user_id
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE u.firebase_uid = ?`,
      [registeredByUid]
    );

    if (!result || result.length === 0) {
      return res.status(403).json({ error: "Access Denied." });
    }

    const { role, department } = result[0];

    // Check if user is from HR department or an admin
    if (role !== "admin" && department !== "Human Resources") {
      return res.status(403).json({ error: "Access denied." });
    }

    // Start a transaction
    await connection.beginTransaction();

    userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role_id });

    const [userResult] = await connection.query(
      "INSERT INTO users (firebase_uid, name, email, role_id) VALUES (?, ?, ?, ?)",
      [userRecord.uid, name, email, role_id]
    );

    const userId = userResult.insertId;

    await connection.query(
      "INSERT INTO employees (user_id, department_id) VALUES (?, ?, ?)",
      [userId, department_id]
    );

    await connection.commit();

    res.status(201).json({
      message: "Employee registered successfully.",
      uid: userRecord.uid,
      userId,
    });
  } catch (error) {
    console.error("Error during employee registration:", error);

    if (connection) await connection.rollback();
    if (userRecord && userRecord.uid) {
      await firebaseAdmin.auth().deleteUser(userRecord.uid);
    }

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({ error: "Email already exists." });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }

    res.status(500).json({ error: error.message || "Internal server error." });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

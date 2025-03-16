const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebase-admin");
const mysql = require("mysql2/promise");

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Author self-registration
router.post("/register/author", async (req, res) => {
  console.log("Registering author...");

  const { name, email, password, role_id, bio, website } = req.body;

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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
      message: "User and author registered successfully.",
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

module.exports = router;

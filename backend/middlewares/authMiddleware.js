const firebaseAdmin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  // Extract the bearer token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is provided, return a 401 error response
  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    // Verify the Firebase token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    // Attach the decoded token to the request object for use in later middleware or routes
    req.user = decodedToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error during token verification:", error);

    // Check if the error is related to an invalid or expired token
    if (
      error.code === "auth/invalid-id-token" ||
      error.code === "auth/argument-error"
    ) {
      // Invalid or expired token
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    // If it is not an invalid token error, it's a server-related issue
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { verifyToken };

import { createContext, useContext, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../firebase";

/**
 * AuthContext
 * @type {Object}
 */
const AuthContext = createContext();

/**
 * AuthProvider component
 * @param {JSX.Element} children - React component
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  /**
   * Sign in with email and password and set user and token
   * @param {string} email
   * @param {string} password
   * @returns {Promise<void>}
   */
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      setUser(userCredential.user);
      setToken(idToken);
    } catch (error) {
      throw mapAuthError(error);
    }
  };

  /**
   * Sign out the user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
  };

  /**
   * Send a password reset email
   * @param {string} email
   * @returns {Promise<void>}
   */
  const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw mapAuthError(error);
    }
  };

  /**
   * Map auth error to custom error
   * @param {Object} error
   * @returns {Error}
   */
  const mapAuthError = (error) => {
    console.log("Error:", error);

    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
        return new Error("Invalid email or password.");
      case "auth/too-many-requests":
        return new Error("Too many attempts. Try again later.");
      case "auth/network-request-failed":
        return new Error("Check your internet connection.");
      default:
        return new Error("An unexpected error occurred.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, sendPasswordReset }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 * @returns {Object}
 */
export const useAuth = () => useContext(AuthContext);

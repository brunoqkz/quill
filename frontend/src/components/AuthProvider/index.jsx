import { createContext, useContext, useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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
   * Sign in with email and password
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
      console.log("JWT Token:", idToken);
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  /**
   * Sign out
   * @returns {Promise<void>}
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 * @returns {Object}
 */
export const useAuth = () => useContext(AuthContext);

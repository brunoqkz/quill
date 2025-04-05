import "./style.scss";
import { useAuth } from "../AuthProvider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Manuscripts from "./Manuscripts";
import { API_ENDPOINTS } from "../../utils/constants";
import Summary from "./Summary";

/**
 * Dashboard component
 *
 * @component
 * @returns {JSX.Element}
 */
function Dashboard() {
  const { user, token, isTokenValid } = useAuth();
  const [manuscripts, setManuscripts] = useState([]);

  const navigate = useNavigate();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    const isAuthenticated = token && isTokenValid();
    if (!isAuthenticated) {
      navigate("/");
    } else {
      fetchManuscripts();
    }
  }, [token, isTokenValid, navigate]);

  if (!user || !token) {
    return null;
  }

  /**
   * Fetch manuscripts from the API
   * @returns {Promise<void>}
   */
  const fetchManuscripts = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MANUSCRIPTS.BASE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        // Redirect to Dashboard if user is not authorized
        if (response.status === 403) {
          navigate("/dashboard");
        }
        throw new Error("Failed to fetch manuscripts");
      }
      const data = await response.json();
      // Fetch comments for each manuscript in parallel
      const manuscriptsWithComments = await Promise.all(
        data.map(async (manuscript) => {
          const comments = await fetchComments(manuscript.id);
          return { ...manuscript, comments };
        })
      );
      setManuscripts(manuscriptsWithComments);
      console.log("Fetched manuscripts:", manuscriptsWithComments);
    } catch (error) {
      console.error("Error fetching manuscripts:", error);
    }
  };

  /**
   * Fetch comments for a specific manuscript
   * @param {string} manuscriptId - The ID of the manuscript
   * @returns {Promise<Array>} - The comments for the manuscript
   */
  const fetchComments = async (manuscriptId) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.MANUSCRIPTS.COMMENTS(manuscriptId),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(
          `Failed to fetch comments for manuscript ${manuscriptId}`
        );
      }

      const comments = response.status === 204 ? [] : await response.json();
      return comments;
    } catch (error) {
      console.error(
        `Error fetching comments for manuscript ${manuscriptId}:`,
        error
      );
      return [];
    }
  };

  return (
    <section>
      <h1>Welcome back, {user && user.name.split(" ")[0]}!</h1>
      <div className="content flex">
        <div className="center flex">
          <Manuscripts manuscripts={manuscripts} />
        </div>
        <div className="right flex">
          <Summary manuscripts={manuscripts} />
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

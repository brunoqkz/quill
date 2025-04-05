import "./style.scss";
import { useAuth } from "../AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Manuscripts from "./Manuscripts";

// TODO: Implement dashboard component functionalities

/**
 * Dashboard component
 * @returns {JSX.Element}
 */
function Dashboard() {
  const { user, token, isTokenValid } = useAuth();

  const navigate = useNavigate();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    const isAuthenticated = token && isTokenValid();
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [token, isTokenValid, navigate]);

  if (!user || !token) {
    return null;
  }

  return (
    <section>
      <h1>Welcome back, {user && user.name.split(" ")[0]}!</h1>
      <Manuscripts />
    </section>
  );
}

export default Dashboard;

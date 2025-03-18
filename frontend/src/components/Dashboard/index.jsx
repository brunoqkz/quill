import "./style.scss";
import { useAuth } from "../AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// TODO: Implement dashboard component functionalities

/**
 * Dashboard component
 * @returns {JSX.Element}
 */
function Dashboard() {
  const { user, token } = useAuth();

  const navigate = useNavigate();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, user, navigate]);

  return (
    <section>
      <h1 className="font-bold">Dashboard</h1>
      <p>
        <span className="font-bold">{user && user.displayName}</span>, welcome
        to the dashboard!
      </p>
    </section>
  );
}

export default Dashboard;

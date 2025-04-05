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
  const { user, token, isTokenValid } = useAuth();

  const navigate = useNavigate();

  /**
   * Redirect to login page if user is not logged in
   */
  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, [token, user, navigate]);

  return (
    <section>
      <h1 className="font-bold">Dashboard</h1>
      <p>
        <span className="font-bold">{user && user.name}</span>, welcome to the
        dashboard!
      </p>
      <div className="user-management">
        <button
          className="bg-blue-500 text-white rounded"
          onClick={() => navigate("/users")}
        >
          Go to User Management
        </button>
      </div>
    </section>
  );
}

export default Dashboard;

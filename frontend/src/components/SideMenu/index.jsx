import "./style.scss";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QUILL_ROLES } from "../../utils/constants";

/**
 * SideMenu component renders a side menu for the application.
 *
 * @component
 * @returns {JSX.Element} The side menu component.
 */
function SideMenu() {
  const { user, token, logout, isTokenValid } = useAuth();
  const navigate = useNavigate();

  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, [token, user, navigate]);

  // Function to handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // If the user is not logged in, do not render the side menu
  if (!user) {
    return;
  }

  const getAdminMenu = () => {
    return (
      <>
        <li className="cursor-pointer" onClick={() => navigate("/dashboard")}>
          Manuscript Queue
        </li>
        <li className="cursor-pointer" onClick={() => navigate("/users")}>
          User Management
        </li>
        <li
          className="cursor-pointer"
          onClick={() => navigate("/register/user")}
        >
          Add New User
        </li>
      </>
    );
  };

  const getEmployeeMenu = () => {
    return (
      <>
        <li className="cursor-pointer" onClick={() => navigate("/dashboard")}>
          Manuscript Queue
        </li>
      </>
    );
  };

  const getAuthorMenu = () => {
    return (
      <>
        <li className="cursor-pointer" onClick={() => navigate("/dashboard")}>
          My Manuscripts
        </li>
      </>
    );
  };

  return (
    <aside className="flex">
      <div className="flex flex-1 flex-col">
        <h2>
          <a
            className="cursor-pointer"
            href="#"
            onClick={() => navigate("/dashboard")}
          >
            My Dashboard
          </a>
        </h2>
        <ul>
          {user.role_id == QUILL_ROLES.ADMIN && getAdminMenu()}
          {user.role_id == QUILL_ROLES.EMPLOYEE && getEmployeeMenu()}
          {user.role_id == QUILL_ROLES.AUTHOR && getAuthorMenu()}
          <li className="cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default SideMenu;

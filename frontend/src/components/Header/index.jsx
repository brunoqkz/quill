import "./style.scss";
import logo from "../../assets/quill_logo_navy.png";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogoClick = () => {
    if (user) navigate("/dashboard");
    else navigate("/");
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center text-center text-2xl">
      <div className="flex flex-1 cursor-pointer" onClick={handleLogoClick}>
        <img src={logo} alt="Ethereal Ink" />
      </div>
      <div className="flex flex-1 justify-center">
        <h1 className="font-bold uppercase">Ethereal Ink</h1>
      </div>
      <div className="flex flex-1 justify-end">
        {user ? (
          <button className="text-white" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="text-white">Book With Us</button>
        )}
      </div>
    </header>
  );
}

export default Header;

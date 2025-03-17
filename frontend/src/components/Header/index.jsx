import "./style.scss";
import logo from "../../assets/quill_logo_navy.png";

function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center text-center text-2xl">
      <img src={logo} alt="Ethereal Ink" />
      <h1 className="font-bold uppercase">Ethereal Ink</h1>
      <button className="text-white" type="submit">
        Book With Us
      </button>
    </header>
  );
}

export default Header;

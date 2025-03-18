import "./style.scss";
import logo from "../../assets/quill_logo_navy.png";

function Header() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center text-center text-2xl">
      <div className="flex flex-1">
        <img src={logo} alt="Ethereal Ink" />
      </div>
      <div className="flex flex-1 justify-center">
        <h1 className="font-bold uppercase">Ethereal Ink</h1>
      </div>
      <div className="flex flex-1 justify-end">
        <button className="text-white" type="submit">
          Book With Us
        </button>
      </div>
    </header>
  );
}

export default Header;

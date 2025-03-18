import "./style.scss";
import logo from "../../assets/quill_logo_grey.png";
import socialsInstagram from "../../assets/socials_instagram.png";
import socialsX from "../../assets/socials_x.png";
import socialsLinkedIn from "../../assets/socials_linkedin.png";

function Footer() {
  return (
    <footer className="flex justify-between items-center">
      <div className="company flex flex-row gap-10">
        <img className="logo" src={logo} alt="Ethereal Ink" />
        <div className="company-desc flex flex-col gap-4 justify-evenly">
          <p className="company-name">Quill</p>
          <div className="copyright flex flex-col gap-2">
            <p>Ethereal Ink @ 2025</p>
            <p>Privacy — Terms</p>
          </div>
        </div>
      </div>
      <div className="directory flex gap-40">
        <div className="sub-directory flex flex-col gap-8 justify-evenly">
          <p className="directory-title">Questions?</p>
          <div className="directory-item flex flex-col gap-4">
            <a href="#">Getting Selected</a>
            <a href="#">Uploading a Book</a>
            <a href="#">FAQ</a>
          </div>
        </div>
        <div className="sub-directory flex flex-col gap-8 justify-evenly">
          <p className="directory-title">About</p>
          <div className="directory-item flex flex-col gap-4">
            <a href="#">Quill, Inc.</a>
            <a href="#">Contact Us</a>
            <a href="#">News & Press</a>
          </div>
        </div>
        <div className="sub-directory flex flex-col gap-8 justify-evenly">
          <p className="directory-title">Stay Connected</p>
          <div className="directory-item flex flex-col gap-4">
            <a className="flex gap-4" href="#">
              <img src={socialsInstagram} alt="Instagram Logo" />
              Instagram
            </a>
            <a className="flex gap-4" href="#">
              <img src={socialsX} alt="X Logo" />X
            </a>
            <a className="flex gap-4" href="#">
              <img src={socialsLinkedIn} alt="LinkedIn Logo" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

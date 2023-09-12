import "./NavBar.css";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [show, setShow] = useState(true);

  const handleShow = () => {
    setShow((current) => !current);
  };

  return (
    <header className="up-top">
      <button onClick={handleShow} className="toggle"></button>
      <div className="logo">Project Dio</div>
      {show && (
        <div className="display-menu">
          <Link className="menu" to={"/"}>
            Clock One
          </Link>
          <Link className="menu" to={"/ClockTwo"}>
            Clock Two
          </Link>
          <Link className="menu" to={"/ClockThree"}>
            The World
          </Link>
        </div>
      )}
    </header>
  );
};
export default Navbar;

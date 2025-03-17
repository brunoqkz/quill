import "./style.scss";
import { useState } from "react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className="flex flex-1 justify-center items-center">
      <fieldset className="flex flex-col gap-2 border-1 rounded-lg">
        <label>E-mail</label>
        <input
          type="email"
          placeholder="yourname@etherealink.ca"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter 8 characters or more"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="actions flex gap-4">
          <button className="btn-sign-in">Sign in</button>
          <button className="btn-register">Register</button>
        </div>
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Forgot your password?
        </a>
      </fieldset>
    </form>
  );
}

export default SignInForm;

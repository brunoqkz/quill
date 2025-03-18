import "./style.scss";
import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";

/**
 * SignInForm component
 * @returns {JSX.Element}
 */
function SignInForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Handle login form submission
   * @param {Event} e
   * @returns {Promise<void>}
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex justify-center" onSubmit={handleLogin}>
      <fieldset className="flex flex-col gap-2 border-1 rounded-lg">
        <label>E-mail</label>
        <input
          type="email"
          placeholder="yourname@etherealink.ca"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter 8 characters or more"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="actions flex gap-4">
          <button type="submit" className="btn-sign-in" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <button type="button" className="btn-register">
            Register
          </button>
        </div>
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          Forgot your password?
        </a>

        {error && <p className="text-red-500">{error}</p>}
      </fieldset>
    </form>
  );
}

export default SignInForm;

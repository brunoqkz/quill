import "./style.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

/**
 * NewAuthorForm component
 * @returns {JSX.Element}
 */
function NewAuthorForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  /**
   * Handle author registration form submission
   * @param {Event} e
   * @returns {Promise<void>}
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const authorData = {
      name,
      email,
      password,
      role_id: 3,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/register/author",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authorData),
        }
      );

      if (response.ok) {
        // Successful registration
        await handleLogin();
      } else {
        // Handle various error responses
        const data = await response.json();
        if (response.status === 400) {
          setError("Invalid input. Please check your form.");
        } else if (response.status === 409) {
          setError("Email already exists.");
        } else if (response.status === 500) {
          setError("Internal server error. Please try again later.");
        } else {
          setError(data.message || "An unknown error occurred.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle login after registration
   */
  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="flex justify-center" onSubmit={handleRegister}>
      <fieldset className="flex flex-col gap-2 border-1 rounded-lg">
        <legend>Create Account:</legend>
        <label>Name</label>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>E-mail</label>
        <input
          type="email"
          placeholder="Personal email address"
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
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <button
            type="button"
            className="btn-sign-in"
            onClick={() => navigate("/")}
          >
            Sign In
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </fieldset>
    </form>
  );
}

export default NewAuthorForm;

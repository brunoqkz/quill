import "./style.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { API_ENDPOINTS } from "../../utils/constants";

/**
 * NewUserForm component
 * @returns {JSX.Element}
 */
function NewUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("3");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token, isTokenValid } = useAuth();

  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!isTokenValid()) {
      navigate("/");
    }
  }, [token, user, navigate]);

  /**
   * Handle user registration form submission
   * @param {Event} e
   * @returns {Promise<void>}
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const userData = {
      name,
      email,
      password,
      role_id: parseInt(role, 10),
    };

    try {
      const response = await fetch(API_ENDPOINTS.USERS.BASE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        navigate("/users");
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
   * Handle password change
   * @param {Event} e
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (confirmPassword && e.target.value !== confirmPassword) {
      setError("Passwords do not match.");
    } else {
      setError("");
    }
  };

  /**
   * Handle confirm password change
   * Sets error message if passwords do not match
   * @param {Event} e
   */
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setError("Passwords do not match.");
    } else {
      setError("");
    }
  };

  return (
    <form className="flex justify-center" onSubmit={handleRegister}>
      <fieldset className="flex flex-col gap-2 border-1 rounded-lg">
        <legend>Create a new User:</legend>
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
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter 8 characters or more"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
        />
        <label>Role</label>
        <select
          className="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="2">Employee</option>
          <option value="3">Author</option>
        </select>
        <div className="actions flex gap-4">
          <button
            type="submit"
            className="btn-register"
            disabled={loading || error}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <button
            type="button"
            className="btn-sign-in"
            onClick={() => navigate("/users")}
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </fieldset>
    </form>
  );
}

export default NewUserForm;

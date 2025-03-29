import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import { API_ENDPOINTS } from "../../utils/constants";
import "./style.scss";

/**
 * User component
 * Display user details and allow editing
 * @returns {JSX.Element}
 */
function User() {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(state?.isEditing || false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_id: 2,
  });

  // Fetch user data on component mount
  useEffect(() => {
    // Fetch user data by ID
    const fetchUserData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USERS.GET_BY_ID(userId), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();

        setUserData(data);
        setFormData({
          name: data.name,
          email: data.email,
          role_id: data.role_id,
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [userId, token]);

  // Handle input change for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update user request
  const handleUpdate = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS.GET_BY_ID(userId), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data.");
      }

      alert("User updated successfully!");
      setUserData((prev) => ({
        ...prev,
        ...formData,
      }));
      setIsEditing(false);
      navigate("/users");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user.");
      navigate("/users");
    }
  };

  // Handle delete user request
  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmation) {
      try {
        const response = await fetch(API_ENDPOINTS.USERS.GET_BY_ID(userId), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user.");
        }

        alert("User deleted successfully!");
        navigate("/users");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
        navigate("/users");
      }
    }
  };

  if (!userData) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="user-data-container">
      <h1>User Details</h1>

      {/* Displaying user details */}
      <div className="user-info">
        <div className="user-field">
          <strong>Name: </strong>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userData.name}</span>
          )}
        </div>

        <div className="user-field">
          <strong>Email: </strong>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userData.email}</span>
          )}
        </div>

        <div className="user-field">
          <strong>Role: </strong>
          {isEditing ? (
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleInputChange}
            >
              <option value={1}>Admin</option>
              <option value={2}>Employee</option>
              <option value={3}>Author</option>
            </select>
          ) : (
            <span>
              {userData.role_id === 1
                ? "Admin"
                : userData.role_id === 2
                ? "Employee"
                : "Author"}
            </span>
          )}
        </div>

        <div className="user-field">
          <strong>Created At: </strong>
          <span>{userData.created_at}</span>
        </div>
      </div>

      {/* Edit and Delete buttons */}
      <div className="user-actions">
        {/* Back Button */}
        <button className="btn-back" onClick={() => navigate("/users")}>
          Back
        </button>

        {isEditing ? (
          <button className="btn-update" onClick={handleUpdate}>
            Save Changes
          </button>
        ) : (
          <>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              Edit User
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Delete User
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default User;

import { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import "./style.scss";
import { FaSearch } from "react-icons/fa";
import TableData from "./TableData";

/**
 * UserManagement component
 * Display user management page
 * @returns {JSX.Element}
 */
function UserManagement() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Role mapping
  const roleMapping = {
    1: "Admin",
    2: "Employee",
    3: "Author",
  };

  /**
   * Format date string to locale string
   * @param {string} dateString
   * @returns {string}
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Fetch users from the API
   * @returns {Promise<void>}
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/");
        }
        throw new Error("Failed to fetch users.");
      }

      const users = await response.json();
      const formattedUsers = users.map((user) => {
        const nameParts = user.name.split(" ");
        const firstName = nameParts[0] || "N/A";
        const lastName = nameParts.slice(1).join(" ") || "N/A";

        return {
          id: user.id,
          user: {
            firstName,
            lastName,
          },
          email: user.email || "N/A",
          role: roleMapping[user.role_id] || "N/A",
          created_at:
            formatDate(user.created_at) || new Date().toLocaleString("en-CA"),
        };
      });

      setData(formattedUsers);
      setFilteredData(formattedUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [token, user, navigate]);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(data); // If no search query, show all data
    } else {
      const filtered = data.filter((row) => {
        return (
          row.user.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          row.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  // Table Columns
  const columns = [
    {
      accessorFn: (row) => row.user.firstName,
      id: "firstName",
      header: "First Name",
    },
    {
      accessorFn: (row) => row.user.lastName,
      id: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
    },
    {
      id: "info",
      header: "Info",
      cell: ({ row }) => (
        <button
          className="btn-info"
          onClick={() => navigate(`/users/${row.original.id}`)}
        >
          Info
        </button>
      ),
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => (
        <button
          className="btn-edit"
          onClick={() =>
            navigate(`/users/${row.original.id}`, {
              state: { isEditing: true },
            })
          }
        >
          Edit
        </button>
      ),
    },
    {
      id: "delete",
      header: "Delete",
      cell: ({ row }) => (
        <button
          className="btn-delete"
          onClick={() => handleDelete(row.original.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  /**
   * Handle user deletion
   * @param {number} userId
   * @returns {Promise<void>}
   */
  const handleDelete = async (userId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (confirmation) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete user.");
        }

        alert("User deleted successfully.");
        fetchUsers(); // Refresh the user list
      } catch (err) {
        alert("Error deleting user: " + err.message);
      }
    }
  };

  return (
    <div className="user-management-container">
      <h1>User Management</h1>

      {/* Search Input */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-icon">
            <FaSearch />
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <TableData data={filteredData} columns={columns} />
      )}

      <div className="actions">
        <button className="btn-add-user" onClick={() => navigate("/users")}>
          +
        </button>
      </div>
    </div>
  );
}

export default UserManagement;

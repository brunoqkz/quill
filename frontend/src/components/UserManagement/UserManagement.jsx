import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../utils/constants";
import { useAuth } from "../AuthProvider";
import TableData from "./TableData";
import "./UserManagement.scss";

/**
 * UserManagement component
 * Display user management page
 * @returns {JSX.Element}
 */
function UserManagement() {
  const { user, token, isTokenValid } = useAuth();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

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
      const response = await fetch(API_ENDPOINTS.USERS.BASE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Redirect to Dashboard if user is not authorized
        if (response.status === 403) {
          navigate("/dashboard");
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
    const isAuthenticated = token && isTokenValid();
    if (!isAuthenticated) {
      navigate("/");
    } else {
      fetchUsers();
    }
  }, [token, isTokenValid, navigate]);
  if (!user || !token) {
    return null;
  }

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery === "") {
      setFilteredData(data); // If no search query, show all data
    } else {
      setFilteredData(filterData(data, searchQuery));
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
      "Are you sure you want to delete this user?",
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

        alert("User deleted successfully.");
        // Remove deleted user from the data
        const newData = [...data].filter((user) => user.id !== userId);
        setData(newData);
        if (searchQuery !== "") {
          setFilteredData(filterData(newData, searchQuery));
        } else {
          setFilteredData(newData);
        }
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
        <button
          className="btn-add-user"
          onClick={() => navigate("/register/user")}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default UserManagement;

/**
 * Filter data based on search query
 * @param {Array} data - Data to be filtered
 * @param {string} searchQuery - Search query
 * @return {Array} - Filtered data
 */
function filterData(data, searchQuery) {
  const filtered = data.filter((row) => {
    return (
      row.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  return filtered;
}

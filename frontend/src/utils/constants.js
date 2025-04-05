const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const API_ENDPOINTS = {
  AUTH: {
    SELF_REGISTER_AUTHOR: `${API_BASE_URL}/api/auth/register/author`,
    REGISTER_EMPLOYEE: `${API_BASE_URL}/api/auth/register/employee`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    GET_BY_ID: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  },
};

const QUILL_ROLES = {
  ADMIN: 1,
  EMPLOYEE: 2,
  AUTHOR: 3,
};
export { API_ENDPOINTS, QUILL_ROLES };

/** Base URL for the backend API */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";


/** API endpoints used for authentication, user management, and manuscript operations */
const API_ENDPOINTS = {
  AUTH: {
    SELF_REGISTER_AUTHOR: `${API_BASE_URL}/api/auth/register/author`,
    REGISTER_EMPLOYEE: `${API_BASE_URL}/api/auth/register/employee`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    GET_BY_ID: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  },
  MANUSCRIPTS: {
    BASE: `${API_BASE_URL}/api/manuscripts`,
    GET_BY_ID: (manuscriptId) =>
      `${API_BASE_URL}/api/manuscripts/${manuscriptId}`,
    ADVANCE: (manuscriptId) =>
      `${API_BASE_URL}/api/manuscripts/${manuscriptId}/advance`,
    CANCEL: (manuscriptId) =>
      `${API_BASE_URL}/api/manuscripts/${manuscriptId}/cancel`,
    COMMENTS: (manuscriptId) =>
      `${API_BASE_URL}/api/manuscripts/${manuscriptId}/comments`,
  },
};

/** Role IDs used in the Quill system */
const QUILL_ROLES = {
  ADMIN: 1,
  EMPLOYEE: 2,
  AUTHOR: 3,
};

/** Manuscript stage IDs mapped to their respective names */
const MANUSCRIPT_STAGES = {
  1: "Submission",
  2: "Review",
  3: "Editing",
  4: "Design",
  5: "Typesetting",
  6: "Proofreading",
  7: "Publication",
  8: "Cancelled",
};

export { API_ENDPOINTS, QUILL_ROLES, MANUSCRIPT_STAGES };

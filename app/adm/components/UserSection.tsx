import React from "react";

type User = {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
};

type UserSectionProps = {
  users: User[];
  loadingUsers: boolean;
  selectedUser: string;
  setSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  updatedUsername: string;
  setUpdatedUsername: React.Dispatch<React.SetStateAction<string>>;
  newPassword: string;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  updateUserAccount: () => void;
  deleteUser: (userId: number) => void;
  buttonStyle: React.CSSProperties;
};

export default function UserSection({
  users,
  loadingUsers,
  selectedUser,
  setSelectedUser,
  updatedUsername,
  setUpdatedUsername,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  updateUserAccount,
  deleteUser,
  buttonStyle,
}: UserSectionProps) {
  return (
    <div style={{ backgroundColor: "#1f2937", padding: "1.5rem", borderRadius: "12px" }}>
      <h2>Users Section</h2>

      {loadingUsers && <p>Loading users...</p>}

      <table
        style={{
          width: "100%",
          marginTop: "1rem",
          marginBottom: "2rem",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "20%" }}>Name</th>
            <th style={{ width: "30%" }}>Email</th>
            <th style={{ width: "15%" }}>Role</th>
            <th style={{ width: "35%" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 && !loadingUsers && (
            <tr>
              <td colSpan={4} style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}>
                No users found.
              </td>
            </tr>
          )}

          {users.map((user) => (
            <tr key={user.user_id}>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>{user.username}</td>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>{user.email}</td>
              <td style={{ padding: "0.75rem", textAlign: "center" }}>
                {user.role_id === 2 ? "Admin" : "User"}
              </td>
              <td style={{ padding: "0.75rem", textAlign: "center", verticalAlign: "middle" }}>
                <button
                  style={buttonStyle}
                  onClick={() => {
                    setSelectedUser(user.username);
                    setUpdatedUsername(user.username);
                  }}
                >
                  Select
                </button>
                <button
                  style={{ ...buttonStyle, marginLeft: "1rem", backgroundColor: "#dc2626" }}
                  onClick={() => deleteUser(user.user_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ backgroundColor: "#111827", padding: "1.5rem", borderRadius: "12px" }}>
        <h3 style={{ marginBottom: "1rem" }}>Update User Account</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
          <input
            type="text"
            placeholder="Selected User"
            value={selectedUser}
            disabled
            style={{
              padding: "0.8rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#374151",
              color: "white",
            }}
          />

          <input
            type="text"
            placeholder="New Username"
            value={updatedUsername}
            onChange={(e) => setUpdatedUsername(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <button style={{ ...buttonStyle, marginTop: "1rem" }} onClick={updateUserAccount}>
            Update Account
          </button>
        </div>
      </div>
    </div>
  );
}

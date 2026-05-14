import React from "react";

type User = {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
};

type SettingsSectionProps = {
  users: User[];
  currentAdminPassword: string;
  setCurrentAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  newAdminPassword: string;
  setNewAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  confirmAdminPassword: string;
  setConfirmAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  changeAdminPassword: () => void;
  updateUserRole: (userId: number, newRole: number) => void;
  buttonStyle: React.CSSProperties;
};

export default function SettingsSection({
  users,
  currentAdminPassword,
  setCurrentAdminPassword,
  newAdminPassword,
  setNewAdminPassword,
  confirmAdminPassword,
  setConfirmAdminPassword,
  changeAdminPassword,
  updateUserRole,
  buttonStyle,
}: SettingsSectionProps) {
  return (
    <div style={{ backgroundColor: "#1f2937", padding: "2rem", borderRadius: "12px" }}>
      <h2>Settings Section</h2>

      <div
        style={{
          backgroundColor: "#111827",
          padding: "1.5rem",
          borderRadius: "12px",
          marginTop: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>Change Admin Password</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentAdminPassword}
            onChange={(e) => setCurrentAdminPassword(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <input
            type="password"
            placeholder="New Password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmAdminPassword}
            onChange={(e) => setConfirmAdminPassword(e.target.value)}
            style={{ padding: "0.8rem", borderRadius: "8px", border: "none" }}
          />

          <button style={buttonStyle} onClick={changeAdminPassword}>
            Update Password
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#111827",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>Manage Roles</h3>

        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Current Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>{user.username}</td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                  {user.role_id === 2 ? "Admin" : "User"}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "center", verticalAlign: "middle" }}>
                  <button
                    style={buttonStyle}
                    onClick={() => updateUserRole(user.user_id, user.role_id === 2 ? 1 : 2)}
                  >
                    {user.role_id === 2 ? "Make User" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

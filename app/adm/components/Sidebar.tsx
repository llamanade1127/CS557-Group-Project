type SidebarProps = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  buttonStyle: React.CSSProperties;
};

export default function Sidebar({ activeSection, setActiveSection, buttonStyle }: SidebarProps) {
  return (
    <aside style={{ width: "250px", backgroundColor: "#0f172a", padding: "2rem 1rem" }}>
      <h2 style={{ marginBottom: "2rem", fontSize: "1.8rem" }}>AniMaList</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {["dashboard", "users", "anime", "ratings", "settings"].map((section) => (
          <button
            key={section}
            style={{
              ...buttonStyle,
              backgroundColor: activeSection === section ? "#1d4ed8" : "#374151",
              textTransform: "capitalize",
            }}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
}

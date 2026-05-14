type ToastProps = {
  toastMessage: string;
  toastType: "success" | "error" | "";
};

export default function Toast({ toastMessage, toastType }: ToastProps) {
  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        borderRadius: "10px",
        color: "white",
        zIndex: 9999,
        backgroundColor: toastType === "success" ? "#16a34a" : "#dc2626",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {toastMessage}
    </div>
  );
}

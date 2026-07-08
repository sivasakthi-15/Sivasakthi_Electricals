import "@/styles/layout.css";

export default function Header() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="header">
      <div className="header-title">
        <h1>Electrical Shop Billing & POS</h1>
        <p>{currentDate}</p>
      </div>

      <div className="header-user">
        <div className="user-avatar">
          A
        </div>

        <div className="user-info">
          <h4>Administrator</h4>
          <span>System Admin</span>
        </div>
      </div>
    </header>
  );
}
interface DashboardCardProps {
  title: string;
  value: string | number;
  color?: string;
}

export default function DashboardCard({
  title,
  value,
  color = "#2563eb",
}: DashboardCardProps) {
  return (
    <div
      className="dashboard-card"
      style={{
        borderLeft: `6px solid ${color}`,
      }}
    >
      <div className="dashboard-title">
        {title}
      </div>

      <div className="dashboard-value">
        {value}
      </div>
    </div>
  );  
}


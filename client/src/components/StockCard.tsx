import { ReactNode } from "react";

interface StockCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  warning?: boolean;
}

export default function StockCard({
  title,
  value,
  icon,
  iconBg = "icon-blue",
  warning = false,
}: StockCardProps) {
  return (
    <div
      className={`summary-card ${
        warning ? "warning-card" : ""
      }`}
    >
      <div className="summary-top">
        <div>
          <p className="summary-title">
            {title}
          </p>

          <h2 className="summary-value">
            {value}
          </h2>
        </div>

        {icon && (
          <div
            className={`summary-icon ${iconBg}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
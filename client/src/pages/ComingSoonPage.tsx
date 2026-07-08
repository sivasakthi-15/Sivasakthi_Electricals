import { Clock3 } from "lucide-react";
import "@/styles/comingSoon.css";

type ComingSoonPageProps = {
  title: string;
  description?: string;
};

export default function ComingSoonPage({
  title,
  description = "This module is currently under development and will be available soon.",
}: ComingSoonPageProps) {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <Clock3 size={36} />
        </div>

        <h1 className="coming-soon-title">{title}</h1>

        <p className="coming-soon-description">
          {description}
        </p>

        <div className="coming-soon-badge">
          🚀 Coming Soon
        </div>
      </div>
    </div>
  );
}
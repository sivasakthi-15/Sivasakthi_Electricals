interface StockCardProps {
  title: string;
  value: string | number;
  warning?: boolean;
}

export default function StockCard({
  title,
  value,
  warning = false,
}: StockCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        warning
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <h3 className="text-sm text-gray-500">{title}</h3>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
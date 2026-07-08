import type { InventoryProduct } from "@/api/client";

interface InventoryTableProps {
  products: InventoryProduct[];
}

export default function InventoryTable({
  products,
}: InventoryTableProps) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Product</th>
          <th className="border p-2">Stock</th>
          <th className="border p-2">Unit</th>
          <th className="border p-2">Purchase Rate</th>
          <th className="border p-2">Selling Rate</th>
        </tr>
      </thead>

      <tbody>
        {products.map((product) => (
          <tr key={product._id}>
            <td className="border p-2">
              {product.name}
            </td>

            <td className="border p-2">
              {product.currentStock}
            </td>

            <td className="border p-2">
              {product.unit}
            </td>

            <td className="border p-2">
              ₹{product.purchaseRate}
            </td>

            <td className="border p-2">
              ₹{product.sellingRate}
            </td>
          </tr>
        ))}

        {products.length === 0 && (
          <tr>
            <td
              colSpan={5}
              className="border p-4 text-center"
            >
              No products found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
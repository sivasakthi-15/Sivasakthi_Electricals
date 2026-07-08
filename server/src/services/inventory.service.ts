import Product from "../models/Product.js";
import InventoryTransaction from "../models/InventoryTransaction.js";

export async function getInventory() {
  return Product.find().sort({ name: 1 });
}

export async function getLowStock() {
  return Product.find({
    $expr: {
      $lte: ["$currentStock", "$minimumStock"],
    },
  }).sort({ currentStock: 1 });
}

export async function stockIn(
  productId: string,
  quantity: number,
  remarks = ""
) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  product.currentStock += quantity;
  await product.save();

  await InventoryTransaction.create({
    product: product._id,
    type: "PURCHASE",
    quantity,
    balanceAfter: product.currentStock,
    remarks,
  });

  return product;
}

export async function stockOut(
  productId: string,
  quantity: number,
  remarks = ""
) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.currentStock < quantity) {
    throw new Error("Insufficient stock");
  }

  product.currentStock -= quantity;
  await product.save();

  await InventoryTransaction.create({
    product: product._id,
    type: "SALE",
    quantity,
    balanceAfter: product.currentStock,
    remarks,
  });

  return product;
}

export async function adjustStock(
  productId: string,
  quantity: number,
  remarks = ""
) {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  product.currentStock = quantity;
  await product.save();

  await InventoryTransaction.create({
    product: product._id,
    type: "ADJUSTMENT",
    quantity,
    balanceAfter: product.currentStock,
    remarks,
  });

  return product;
}

export async function getStockHistory(productId: string) {
  return InventoryTransaction.find({
    product: productId,
  })
    .sort({ createdAt: -1 })
    .populate("product");
}

export async function getInventorySummary() {
  const products = await Product.find();

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, p) => sum + p.currentStock,
    0
  );

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.purchaseRate,
    0
  );

  const lowStock = products.filter(
    (p) => p.currentStock <= p.minimumStock
  ).length;

  return {
    totalProducts,
    totalStock,
    inventoryValue,
    lowStock,
  };
}
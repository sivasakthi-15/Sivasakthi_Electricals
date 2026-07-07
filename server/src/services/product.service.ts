import Product from "../models/Product";
import { formatName } from "../utils/text.js";

export interface ProductInput {
  description: string;
  rate: number;
  unit: string;
}

function normalizeName(name: string): string {
  return formatName(name).replace(/\s+/g, " ");
}

/**
 * Creates a product if it doesn't exist.
 * Otherwise updates the latest values.
 */
export async function updateOrCreateProduct(
  products: ProductInput[]
): Promise<void> {
  for (const item of products) {
    const name = normalizeName(item.description);

    if (!name) continue;

    const existing = await Product.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });

    if (!existing) {
      await Product.create({
        name,
        latestRate: item.rate,
        unit: item.unit,
        timesUsed: 1,
        lastUsed: new Date(),
        active: true,
      });

      continue;
    }

    existing.latestRate = item.rate;
    existing.unit = item.unit;
    existing.timesUsed += 1;
    existing.lastUsed = new Date();

    await existing.save();
  }
}

/**
 * Create Product manually.
 */
export async function createProduct(data: {
  name: string;
  latestRate: number;
  unit: string;
}) {
  const name = normalizeName(data.name);

  if (!name) {
    throw new Error("Product name is required.");
  }

  const exists = await Product.findOne({
    name: new RegExp(`^${name}$`, "i"),
  });

  if (exists) {
    throw new Error("Product already exists.");
  }

  return Product.create({
    name,
    latestRate: data.latestRate,
    unit: data.unit,
    active: true,
    timesUsed: 0,
    lastUsed: new Date(),
  });
}

/**
 * Returns all active products.
 */
export async function getAllProducts() {
  return Product.find({
    active: true,
  }).sort({
    name: 1,
  });
}

/**
 * Search products by name.
 */
export async function searchProducts(query: string) {
  const q = normalizeName(query);

  if (!q) {
    return [];
  }

  return Product.find({
    active: true,
    name: {
      $regex: q,
      $options: "i",
    },
  })
    .sort({
      timesUsed: -1,
      name: 1,
    })
    .limit(20);
}

/**
 * Update a product manually.
 */
export async function updateProduct(
  id: string,
  data: {
    name?: string;
    latestRate?: number;
    unit?: string;
    active?: boolean;
  }
) {
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    update.name = normalizeName(data.name);
  }

  if (data.latestRate !== undefined) {
    update.latestRate = data.latestRate;
  }

  if (data.unit !== undefined) {
    update.unit = data.unit;
  }

  if (data.active !== undefined) {
    update.active = data.active;
  }

  return Product.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
}

/**
 * Enable / Disable a product.
 */
export async function toggleProductStatus(
  id: string,
  active: boolean
) {
  return Product.findByIdAndUpdate(
    id,
    {
      active,
      updatedAt: new Date(),
    },
    {
      new: true,
    }
  );
}
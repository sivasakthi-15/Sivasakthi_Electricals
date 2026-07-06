import Product from "../models/Product";

export interface ProductInput {
  description: string;
  rate: number;
  unit: string;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
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
    latestRate?: number;
    unit?: string;
    active?: boolean;
  }
) {
  return Product.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
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
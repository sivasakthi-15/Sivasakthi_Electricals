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

/* ============================================================
   Billing Auto Product Creation
============================================================ */

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

        category: "General",

        latestRate: item.rate,
        purchaseRate: item.rate,
        sellingRate: item.rate,

        currentStock: 0,
        minimumStock: 0,
        reorderLevel: 0,

        unit: item.unit,

        barcode: "",
        hsnCode: "",
        gst: 18,

        timesUsed: 1,
        lastUsed: new Date(),

        active: true,
      });

      continue;
    }

    existing.latestRate = item.rate;
    existing.sellingRate = item.rate;
    existing.unit = item.unit;

    existing.timesUsed += 1;
    existing.lastUsed = new Date();

    await existing.save();
  }
}

/* ============================================================
   Manual Product Creation
============================================================ */

export async function createProduct(data: {
  name: string;

  category?: string;

  latestRate?: number;

  purchaseRate?: number;

  sellingRate?: number;

  currentStock?: number;

  minimumStock?: number;

  reorderLevel?: number;

  unit?: string;

  barcode?: string;

  hsnCode?: string;

  gst?: number;
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

    category: data.category ?? "General",

    latestRate: data.latestRate ?? 0,

    purchaseRate: data.purchaseRate ?? 0,

    sellingRate: data.sellingRate ?? data.latestRate ?? 0,

    currentStock: data.currentStock ?? 0,

    minimumStock: data.minimumStock ?? 0,

    reorderLevel: data.reorderLevel ?? 0,

    unit: data.unit ?? "Nos",

    barcode: data.barcode ?? "",

    hsnCode: data.hsnCode ?? "",

    gst: data.gst ?? 18,

    active: true,

    timesUsed: 0,

    lastUsed: new Date(),
  });
}

/* ============================================================
   Get Products
============================================================ */

export async function getAllProducts() {
  return Product.find({
    active: true,
  }).sort({
    name: 1,
  });
}

/* ============================================================
   Search Products
============================================================ */

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

/* ============================================================
   Update Product
============================================================ */

export async function updateProduct(
  id: string,
  data: {
    name?: string;

    category?: string;

    latestRate?: number;

    purchaseRate?: number;

    sellingRate?: number;

    currentStock?: number;

    minimumStock?: number;

    reorderLevel?: number;

    unit?: string;

    barcode?: string;

    hsnCode?: string;

    gst?: number;

    active?: boolean;
  }
) {
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    update.name = normalizeName(data.name);
  }

  if (data.category !== undefined) {
    update.category = data.category;
  }

  if (data.latestRate !== undefined) {
    update.latestRate = data.latestRate;
  }

  if (data.purchaseRate !== undefined) {
    update.purchaseRate = data.purchaseRate;
  }

  if (data.sellingRate !== undefined) {
    update.sellingRate = data.sellingRate;
  }

  if (data.currentStock !== undefined) {
    update.currentStock = data.currentStock;
  }

  if (data.minimumStock !== undefined) {
    update.minimumStock = data.minimumStock;
  }

  if (data.reorderLevel !== undefined) {
    update.reorderLevel = data.reorderLevel;
  }

  if (data.unit !== undefined) {
    update.unit = data.unit;
  }

  if (data.barcode !== undefined) {
    update.barcode = data.barcode;
  }

  if (data.hsnCode !== undefined) {
    update.hsnCode = data.hsnCode;
  }

  if (data.gst !== undefined) {
    update.gst = data.gst;
  }

  if (data.active !== undefined) {
    update.active = data.active;
  }

  return Product.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
}

/* ============================================================
   Enable / Disable Product
============================================================ */

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
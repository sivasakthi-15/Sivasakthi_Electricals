import Customer from "../models/Customer";

export interface CustomerInput {
  name: string;
  mobile: string;
  place: string;
  billAmount: number;
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Creates a customer if not found.
 * Otherwise updates customer statistics.
 */
export async function updateOrCreateCustomer(
  customer: CustomerInput
): Promise<void> {
  const name = normalize(customer.name);
  const mobile = normalize(customer.mobile);
  const place = normalize(customer.place);

  // Ignore completely empty customer
  if (!name && !mobile) {
    return;
  }

  let existing = null;

  // Prefer mobile number
  if (mobile) {
    existing = await Customer.findOne({ mobile });
  }

  // If no mobile match, try customer name
  if (!existing && name) {
    existing = await Customer.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
  }

  if (!existing) {
    await Customer.create({
      name,
      mobile,
      place,
      totalPurchase: customer.billAmount,
      timesVisited: 1,
      lastVisit: new Date(),
      active: true,
    });

    return;
  }

  existing.name = name || existing.name;
  existing.mobile = mobile || existing.mobile;
  existing.place = place || existing.place;

  existing.timesVisited += 1;
  existing.totalPurchase += customer.billAmount;
  existing.lastVisit = new Date();

  await existing.save();
}

/**
 * Get all active customers.
 */
export async function getAllCustomers() {
  return Customer.find({
    active: true,
  }).sort({
    name: 1,
  });
}

/**
 * Search customers.
 */
export async function searchCustomers(query: string) {
  const q = normalize(query);

  if (!q) {
    return [];
  }

  return Customer.find({
    active: true,
    $or: [
      {
        name: {
          $regex: q,
          $options: "i",
        },
      },
      {
        mobile: {
          $regex: q,
          $options: "i",
        },
      },
      {
        place: {
          $regex: q,
          $options: "i",
        },
      },
    ],
  }).limit(20);
}

/**
 * Update customer.
 */
export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    mobile?: string;
    place?: string;
    active?: boolean;
  }
) {
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    update.name = normalize(data.name);
  }

  if (data.mobile !== undefined) {
    update.mobile = normalize(data.mobile);
  }

  if (data.place !== undefined) {
    update.place = normalize(data.place);
  }

  if (data.active !== undefined) {
    update.active = data.active;
  }

  return Customer.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
}


/**
 * Create customer manually.
 */
export async function createCustomer(data: {
  name: string;
  mobile?: string;
  place?: string;
}) {
  const name = normalize(data.name);
  const mobile = normalize(data.mobile ?? "");
  const place = normalize(data.place ?? "");

  if (!name) {
    throw new Error("Customer name is required.");
  }

  // Check duplicate mobile
  if (mobile) {
    const existing = await Customer.findOne({ mobile });

    if (existing) {
      throw new Error("Customer with this mobile already exists.");
    }
  }

  return Customer.create({
    name,
    mobile,
    place,
    totalPurchase: 0,
    timesVisited: 0,
    lastVisit: new Date(),
    active: true,
  });
}


/**
 * Enable / Disable customer.
 */
export async function toggleCustomerStatus(
  id: string,
  active: boolean
) {
  return Customer.findByIdAndUpdate(
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
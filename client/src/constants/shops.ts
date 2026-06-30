import type { ShopId } from "@/types/bill";

export interface ShopConfig {
  id: ShopId;
  name: string;
  shortKey: "SE" | "MP";
  address: string;
  phone: string;
  altMobile: string;
  gstin: string;
  bank: {
    name: string;
    branch: string;
    ifsc: string;
    accountNumber: string;
  };
  proprietorLabel: string;
  defaultUpi: string;
}

export const SHOPS: Record<ShopId, ShopConfig> = {
  sivasakthi: {
    id: "sivasakthi",
    name: "SIVASAKTHI ELECTRICALS",
    shortKey: "SE",
    address: "123 Main Road, Your City — 000000",
    phone: "+91 98765 43210",
    altMobile: "+91 91234 56789",
    gstin: "33AAAAA0000A1Z5",
    bank: {
      name: "State Bank of India",
      branch: "Main Branch",
      ifsc: "SBIN0001234",
      accountNumber: "12345678901",
    },
    proprietorLabel: "PROPRIETOR",
    defaultUpi: "sivasakthi@upi",
  },
  meenatchi: {
    id: "meenatchi",
    name: "SRI MEENATCHI PIPES & ELECTRICALS",
    shortKey: "MP",
    address: "456 Market Street, Your City — 000000",
    phone: "+91 98765 11111",
    altMobile: "+91 98765 22222",
    gstin: "33BBBBB0000B1Z5",
    bank: {
      name: "Indian Bank",
      branch: "Town Branch",
      ifsc: "IDIB000M001",
      accountNumber: "9876543210987",
    },
    proprietorLabel: "PROPRIETOR",
    defaultUpi: "meenatchi@upi",
  },
};

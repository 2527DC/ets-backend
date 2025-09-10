// src/modules/vendor/vendor.schema.js
import { z } from "zod";

export const CreateVendorSchema = z.object({
  vendor: z.object({
    name: z.string().min(1, "Vendor name is required"),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string()
      .regex(/^\d{10}$/, { message: "Phone must be exactly 10 digits" })
      .optional()
      .nullable(),
    address: z.string().optional().nullable(),
    logo: z.string().url("Invalid logo URL").optional().nullable(),
    website: z.string().url("Invalid website URL").optional().nullable(),
    licenseNumber: z.string().optional().nullable(),
    gstNumber: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
  adminUser: z.object({
    name: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string()
      .regex(/^\d{10}$/, { message: "Phone must be exactly 10 digits" }),
  }).optional(),
  permissions: z.array(
    z.object({
      moduleKey: z.string(),
      canRead: z.boolean().optional(),
      canWrite: z.boolean().optional(),
      canDelete: z.boolean().optional(),
    })
  ).optional().default([]),
});



// ---------- Update Vendor Schema ----------
export const UpdateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone must be exactly 10 digits" })
    .optional()
    .nullable(),

  address: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),

  licenseNumber: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),

  isActive: z.boolean().optional(),

  onboardedAt: z
    .coerce.date()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today; // ✅ today or future only
      },
      { message: "Onboarded date cannot be in the past" }
    ),
});

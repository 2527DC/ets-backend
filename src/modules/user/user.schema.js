import { z } from "zod";
import { SpecialNeeds } from "@prisma/client";

// Use Prisma enum values for validation
export const CreateUserSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    userId: z.string().min(1),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
    email: z.string().email("Invalid email format"),
    departmentId: z.number(),
    phone: z
      .string()
      .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" })
      .optional(),

    alternate_mobile_number: z
      .string()
      .regex(/^\d{10}$/, {
        message: "Alternate mobile number must be exactly 10 digits",
      })
      .optional(),

    roleId: z.number().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
    lat: z.string(),
    lng: z.string(),
    additionalInfo: z.any().optional(),

    // ✅ Use Prisma Enum
    specialNeed: z
      .nativeEnum(SpecialNeeds)
      .optional()
      .nullable(),

    specialNeedStart: z.coerce.date().optional().nullable(),
    specialNeedEnd: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // If specialNeed is provided and not NONE (if NONE exists in your enum), dates must be provided
      if (data.specialNeed && data.specialNeed !== SpecialNeeds.NONE) {
        return data.specialNeedStart !== null && data.specialNeedEnd !== null;
      }
      return true;
    },
    {
      message:
        "specialNeedStart and specialNeedEnd are required when specialNeed is provided",
      path: ["specialNeedStart"],
    }
  );
  
  export const UpdateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    userId: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
    email: z.string().email().optional(),
    departmentId: z.number().optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" })
      .optional()
      .nullable(),
    alternate_mobile_number: z
      .string()
      .regex(/^\d{10}$/, {
        message: "Alternate mobile number must be exactly 10 digits",
      })
      .optional()
      .nullable(),
    roleId: z.number().optional().nullable(),
    address: z.string().optional().nullable(),
    landmark: z.string().optional().nullable(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    additionalInfo: z.any().optional().nullable(),

    specialNeed: z.nativeEnum(SpecialNeeds).optional().nullable(),
    specialNeedStart: z.coerce.date().optional().nullable(),
    specialNeedEnd: z.coerce.date().optional().nullable(),
  })
  // ------------------- VALIDATIONS -------------------
  .refine(
    (data) => {
      if (data.specialNeed) {
        return !!data.specialNeedStart && !!data.specialNeedEnd;
      }
      return true;
    },
    {
      message:
        "specialNeedStart and specialNeedEnd are required when specialNeed is provided",
      path: ["specialNeedStart"],
    }
  )
  .refine(
    (data) => {
      if (data.specialNeed) {
        if (!data.specialNeedStart && data.specialNeedEnd) return false;
        if (data.specialNeedStart && !data.specialNeedEnd) return false;
      }
      return true;
    },
    {
      message:
        "Both specialNeedStart and specialNeedEnd must be provided when specialNeed is set",
      path: ["specialNeedEnd"],
    }
  )
  .refine(
    (data) => {
      if (data.specialNeedStart && data.specialNeedEnd) {
        return data.specialNeedEnd > data.specialNeedStart;
      }
      return true;
    },
    {
      message: "specialNeedEnd must be after specialNeedStart",
      path: ["specialNeedEnd"],
    }
  )
  // ------------------- NORMALIZATION -------------------
  .transform((data) => {
    if (
      !data.specialNeed ||
      !data.specialNeedStart ||
      !data.specialNeedEnd
    ) {
      return {
        ...data,
        specialNeed: null,
        specialNeedStart: null,
        specialNeedEnd: null,
      };
    }
    return data;
  });

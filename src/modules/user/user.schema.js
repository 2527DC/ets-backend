import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  userId: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS']),
  email: z.email('Invalid email format'),
  departmentId: z.number(),
  phone: z
  .string()
  .regex(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  .optional(),

alternate_mobile_number: z
  .string()
  .regex(/^\d{10}$/, { message: 'Alternate mobile number must be exactly 10 digits' })
  .optional(),

  roleId: z.number().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(), // ✅ Added if needed
  lat: z.string(),
  lng: z.string(),
  // distance_from_company: z.number().optional(), // ✅ Added
  additionalInfo: z.any().optional(),

  // Special need
  specialNeed: z.enum(['PREGNENT', 'DISABLED', 'NONE']).optional(),
  specialNeedStart: z.coerce.date().optional(),
  specialNeedEnd: z.coerce.date().optional(),

  // ✅ Add date range object
  dateRange: z
    .object({
      startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
      endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
    })
    .optional(),
});


export const UpdateUserSchema = CreateUserSchema.partial();

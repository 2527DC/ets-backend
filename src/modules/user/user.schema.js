import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  userId:z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHERS']),
  email: z.email('Invalid email format'),
  phone: z.string().optional(),
  companyId: z.number(),
  roleId: z.number().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  additionalInfo: z.any().optional(),

  // ✅ Special need support
  specialNeed: z.enum(['PREGNENT']).optional(),
  specialNeedStart: z.coerce.date().optional(),
  specialNeedEnd: z.coerce.date().optional(),
});


export const UpdateUserSchema = CreateUserSchema.partial();

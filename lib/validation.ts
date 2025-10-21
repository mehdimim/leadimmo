import { z } from 'zod';

export const leadSubmissionSchema = z
  .object({
    firstName: z.string().min(2).max(60),
    email: z
      .string()
      .email()
      .optional()
      .or(z.literal('').transform((value) => (value === '' ? undefined : value))),
    phone: z.string().min(6).max(40),
    budget: z.string().min(1).max(40),
    propertyType: z.string().min(1).max(40),
    areas: z.array(z.string()).default([]),
    timing: z.string().min(1).max(60),
    callPreference: z.string().min(1).max(40),
    timezone: z.string().min(2).max(60).default('Asia/Bangkok'),
    message: z.string().max(2000).optional(),
    locale: z.string().min(2).max(5).default('en'),
    consent: z
      .boolean()
      .refine((value) => value === true, {
        message: 'Consent required'
      }),
    _hpt: z.string().optional(),
    turnstileToken: z.string().optional()
  })
  .refine((data) => !data._hpt, {
    message: 'Spam detected',
    path: ['_hpt']
  });

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export const adminLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export const translatePostSchema = z.object({
  targetLocale: z.enum(['th', 'fr', 'es', 'zh'])
});

export const cronTokenSchema = z.object({
  authorization: z.string().regex(/^Bearer\s.+/i)
});


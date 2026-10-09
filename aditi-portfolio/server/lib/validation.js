import { z } from 'zod';
const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Use a valid http(s) URL')
  .optional()
  .default('');
export const projectInput = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
  summary: z.string().trim().min(10).max(700),
  highlights: z.array(z.string().trim().min(1).max(300)).max(12).default([]),
  stack: z.array(z.string().trim().min(1).max(60)).min(1).max(20),
  category: z.enum(['fullstack', 'backend', 'frontend', 'design']),
  liveUrl: httpUrl,
  repoUrl: httpUrl,
  imageUrl: httpUrl,
  featured: z.boolean().default(false),
  order: z.number().int().min(0).max(9999).default(99),
});
export const contactInput = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.string().trim().email('Please enter a valid email.').max(254),
  interest: z.string().trim().max(80).default('General conversation'),
  message: z.string().trim().min(10, 'Tell me a little more (at least 10 characters).').max(5000),
  website: z.string().max(0, 'Request rejected.').optional().default(''),
});

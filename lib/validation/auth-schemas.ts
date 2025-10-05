/**
 * Authentication Validation Schemas
 * Zod schemas for validating auth-related inputs
 */

import { z } from 'zod'

// Common passwords to block (top 100 most common passwords)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567', 'letmein',
  'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
  'passw0rd', 'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael', 'football',
  'password1', 'welcome', 'jesus', 'ninja', 'mustang', 'password123', 'admin', 'admin123',
  'root', 'toor', 'pass', 'test', 'guest', 'oracle', 'changeme', 'whatever', 'Password1',
  'P@ssw0rd', 'P@ssword', 'Password!', '12345', '123456789', 'picture1', 'password!',
  'Passw0rd', 'Password', 'Charlie', 'aa123456', 'welcome1', 'qwerty123', 'princess',
])

// Password validation: enhanced security
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)')
  .refine((password) => {
    // Check against common passwords (case-insensitive)
    return !COMMON_PASSWORDS.has(password.toLowerCase())
  }, 'Password is too common. Please choose a stronger password')
  .refine((password) => {
    // Check for sequential characters (123, abc, etc.)
    const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm']
    for (const seq of sequences) {
      for (let i = 0; i < seq.length - 2; i++) {
        const substring = seq.substring(i, i + 3)
        if (password.toLowerCase().includes(substring) || password.toLowerCase().includes(substring.split('').reverse().join(''))) {
          return false
        }
      }
    }
    return true
  }, 'Password contains sequential characters. Please choose a stronger password')
  .refine((password) => {
    // Check for repeated characters (aaa, 111, etc.)
    return !/(.)\1{2,}/.test(password)
  }, 'Password contains repeated characters. Please choose a stronger password')

// Email validation
const emailSchema = z.string().email('Invalid email address')

// User roles: admin, instructor (via instructor_profiles), client (member)
export const userRoleSchema = z.enum(['admin', 'instructor', 'client'])
export type UserRole = z.infer<typeof userRoleSchema>

// Signup schema with email-based password validation
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['instructor', 'client']), // admin created via invite only
  organizationId: z.string().uuid().optional(),
}).refine((data) => {
  // Ensure password doesn't contain email username
  const emailUsername = data.email.split('@')[0].toLowerCase()
  return !data.password.toLowerCase().includes(emailUsername)
}, {
  message: 'Password cannot contain parts of your email address',
  path: ['password'],
})

export type SignupInput = z.infer<typeof signupSchema>

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// Reset password request schema
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

// Update password schema
export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

// Helper function to validate and parse data
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    }
  }
}

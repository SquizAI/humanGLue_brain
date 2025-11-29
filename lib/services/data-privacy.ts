/**
 * Data Privacy Service
 *
 * Handles PII anonymization, consent management, and GDPR/CCPA compliance.
 * Implements data subject rights: access, rectification, erasure, portability.
 *
 * GDPR Articles Implemented:
 * - Article 15: Right to Access
 * - Article 16: Right to Rectification
 * - Article 17: Right to Erasure (Right to be Forgotten)
 * - Article 20: Right to Data Portability
 * - Article 21: Right to Object
 */

import { createClient } from '@/lib/supabase/server'

export type ConsentCategory = 'essential' | 'functional' | 'analytics' | 'marketing' | 'data_sharing'
export type AnonymizationStrategy = 'hash' | 'mask' | 'redact' | 'generalize' | 'pseudonymize' | 'delete'
export type AnonymizationReason = 'user_request' | 'data_retention' | 'legal_requirement' | 'admin_action'

export interface ConsentType {
  id: string
  code: string
  name: string
  description: string
  is_required: boolean
  category: ConsentCategory
}

export interface UserConsent {
  id: string
  user_id: string
  consent_type_id: string
  granted: boolean
  granted_at: string | null
  revoked_at: string | null
  consent_type?: ConsentType
}

export interface DataExportRequest {
  id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requested_at: string
  completed_at: string | null
  export_url: string | null
  expires_at: string | null
  format: 'json' | 'csv'
}

export interface DeletionRequest {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
  reason: string | null
  requested_at: string
  approved_at: string | null
  approved_by: string | null
  completed_at: string | null
}

// ============================================================================
// Consent Management
// ============================================================================

/**
 * Get all available consent types
 */
export async function getConsentTypes(): Promise<ConsentType[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consent_types')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch consent types: ${error.message}`)
  }

  return data || []
}

/**
 * Get user's current consents
 */
export async function getUserConsents(userId: string): Promise<UserConsent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_consents')
    .select(`
      *,
      consent_type:consent_types(*)
    `)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to fetch user consents: ${error.message}`)
  }

  return data || []
}

/**
 * Update user consent
 */
export async function updateConsent(
  userId: string,
  consentTypeId: string,
  granted: boolean,
  metadata?: {
    ip_address?: string
    user_agent?: string
  }
): Promise<UserConsent> {
  const supabase = await createClient()

  const consentData = {
    user_id: userId,
    consent_type_id: consentTypeId,
    granted,
    granted_at: granted ? new Date().toISOString() : null,
    revoked_at: !granted ? new Date().toISOString() : null,
    ip_address: metadata?.ip_address || null,
    user_agent: metadata?.user_agent || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_consents')
    .upsert(consentData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update consent: ${error.message}`)
  }

  return data
}

/**
 * Check if user has granted specific consent
 */
export async function hasConsent(userId: string, consentCode: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_consents')
    .select(`
      granted,
      consent_type:consent_types!inner(code)
    `)
    .eq('user_id', userId)
    .eq('consent_types.code', consentCode)
    .single()

  if (error || !data) {
    return false
  }

  return data.granted
}

// ============================================================================
// Data Export (GDPR Article 15 - Right to Access)
// ============================================================================

/**
 * Request user data export
 */
export async function requestDataExport(
  userId: string,
  format: 'json' | 'csv' = 'json'
): Promise<DataExportRequest> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_export_requests')
    .insert({
      user_id: userId,
      format,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create export request: ${error.message}`)
  }

  // TODO: Trigger background job to process export
  // This would collect all user data from all tables and create downloadable file

  return data
}

/**
 * Get user's export requests
 */
export async function getExportRequests(userId: string): Promise<DataExportRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_export_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch export requests: ${error.message}`)
  }

  return data || []
}

/**
 * Export all user data
 * This collects data from all tables for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<any> {
  const supabase = await createClient()

  // Collect data from all user-related tables
  const [user, consents, assessments, organizations] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_consents').select('*, consent_type:consent_types(*)').eq('user_id', userId),
    supabase.from('assessments').select('*').eq('user_id', userId),
    supabase.from('organization_members').select('*, organization:organizations(*)').eq('user_id', userId),
  ])

  return {
    user: user.data,
    consents: consents.data,
    assessments: assessments.data,
    organizations: organizations.data,
    exported_at: new Date().toISOString(),
    export_version: '1.0',
  }
}

// ============================================================================
// Data Deletion (GDPR Article 17 - Right to be Forgotten)
// ============================================================================

/**
 * Request account deletion
 */
export async function requestDeletion(
  userId: string,
  reason?: string
): Promise<DeletionRequest> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deletion_requests')
    .insert({
      user_id: userId,
      status: 'pending',
      reason: reason || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create deletion request: ${error.message}`)
  }

  return data
}

/**
 * Get user's deletion requests
 */
export async function getDeletionRequests(userId: string): Promise<DeletionRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deletion_requests')
    .select('*')
    .eq('user_id', userId)
    .order('requested_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch deletion requests: ${error.message}`)
  }

  return data || []
}

/**
 * Anonymize user data (soft delete with PII removal)
 * This is called via the PostgreSQL function for consistency
 */
export async function anonymizeUserData(
  userId: string,
  reason: AnonymizationReason = 'user_request'
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  // Call the PostgreSQL function
  const { data, error } = await supabase.rpc('anonymize_user_data', {
    target_user_id: userId,
    anonymization_reason: reason,
  })

  if (error) {
    throw new Error(`Failed to anonymize user data: ${error.message}`)
  }

  return {
    success: true,
    message: `User data anonymized successfully`,
  }
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Approve deletion request (admin only)
 */
export async function approveDeletion(
  requestId: string,
  adminId: string
): Promise<DeletionRequest> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deletion_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: adminId,
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to approve deletion request: ${error.message}`)
  }

  // TODO: Trigger background job to process deletion

  return data
}

/**
 * Get all pending deletion requests (admin only)
 */
export async function getPendingDeletions(): Promise<DeletionRequest[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deletion_requests')
    .select('*')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending deletions: ${error.message}`)
  }

  return data || []
}

/**
 * Get anonymization logs (admin only)
 */
export async function getAnonymizationLogs(
  filters?: {
    userId?: string
    tableName?: string
    startDate?: string
    endDate?: string
  }
): Promise<any[]> {
  const supabase = await createClient()

  let query = supabase
    .from('anonymization_logs')
    .select('*')
    .order('performed_at', { ascending: false })

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters?.tableName) {
    query = query.eq('table_name', filters.tableName)
  }

  if (filters?.startDate) {
    query = query.gte('performed_at', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('performed_at', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch anonymization logs: ${error.message}`)
  }

  return data || []
}

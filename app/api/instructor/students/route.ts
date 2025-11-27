/**
 * Instructor Students Management API
 * @endpoint GET /api/instructor/students
 * @endpoint POST /api/instructor/students/bulk-email
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireInstructor, getPaginationParams } from '@/lib/api/instructor-auth'
import { handleAPIError, paginatedResponse, successResponse, logError } from '@/lib/api/instructor-errors'
import { getStudentsQuerySchema } from '@/lib/validation/instructor-schemas'

// ============================================================================
// GET /api/instructor/students
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const { instructorId } = await requireInstructor(request)
    const supabase = await createClient()

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const query = getStudentsQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      engagement: searchParams.get('engagement'),
      course: searchParams.get('course'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    const { page, limit, offset } = getPaginationParams(searchParams)

    // Build the query to get students enrolled in instructor's courses
    let studentsQuery = supabase
      .from('course_enrollments')
      .select(`
        user_id,
        created_at,
        users!inner (
          id,
          full_name,
          email,
          avatar_url,
          metadata
        )
      `, { count: 'exact' })
      // TODO: Add instructor_id filter when courses table has instructor_id column
      .order('created_at', { ascending: false })

    // Apply search filter
    if (query.search) {
      studentsQuery = studentsQuery.or(
        `full_name.ilike.%${query.search}%,email.ilike.%${query.search}%`,
        { foreignTable: 'users' }
      )
    }

    // Apply course filter
    if (query.course) {
      studentsQuery = studentsQuery.eq('course_id', query.course)
    }

    // Execute query with pagination
    const { data: enrollmentsData, error: enrollmentsError, count } = await studentsQuery
      .range(offset, offset + limit - 1)

    if (enrollmentsError) {
      throw enrollmentsError
    }

    // Get unique students (a student may be enrolled in multiple courses)
    const uniqueStudentIds = Array.from(
      new Set(enrollmentsData?.map(e => e.user_id) || [])
    )

    // Get detailed student information with course progress
    const studentsPromises = uniqueStudentIds.map(async (studentId) => {
      // Get student's enrollments
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          progress_percentage,
          status,
          last_accessed_at,
          created_at,
          courses (
            id,
            title
          )
        `)
        .eq('user_id', studentId)

      // Get student's recent activity
      const { data: recentActivity } = await supabase
        .from('lesson_progress')
        .select(`
          id,
          completed_at,
          course_lessons (
            title,
            content_type
          )
        `)
        .in('enrollment_id', enrollments?.map(e => e.id) || [])
        .order('completed_at', { ascending: false })
        .limit(5)

      // Calculate statistics
      const totalEnrollments = enrollments?.length || 0
      const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0
      const averageProgress = enrollments?.length
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length
          )
        : 0

      // Calculate engagement score (based on progress, activity, completion rate)
      const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0
      const activityScore = recentActivity?.length ? (recentActivity.length / 5) * 100 : 0
      const engagementScore = Math.round((averageProgress + completionRate + activityScore) / 3)

      // Get student info
      const studentEnrollment = enrollmentsData?.find(e => e.user_id === studentId)
      const student = studentEnrollment?.users

      // Determine status based on activity
      const lastActivity = enrollments?.[0]?.last_accessed_at
      const daysSinceActivity = lastActivity
        ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      let status: 'active' | 'inactive' | 'completed' = 'inactive'
      if (completedCourses === totalEnrollments && totalEnrollments > 0) {
        status = 'completed'
      } else if (daysSinceActivity <= 7) {
        status = 'active'
      }

      return {
        id: studentId,
        name: (student as any)?.full_name || '',
        email: (student as any)?.email || '',
        avatar: (student as any)?.avatar_url || null,
        enrolledCourses: totalEnrollments,
        completedCourses,
        averageProgress,
        lastActive: lastActivity
          ? getRelativeTime(new Date(lastActivity))
          : 'Never',
        lastActivityDate: lastActivity || new Date(0).toISOString(),
        engagementScore,
        totalWatchTime: '0h 0m', // TODO: Calculate from lesson progress
        assignmentsCompleted: 0, // TODO: Calculate from quiz/assignment data
        assignmentsTotal: 0,
        status,
        enrollmentDate: studentEnrollment?.created_at || '',
        courses: enrollments?.map(e => ({
          id: e.course_id,
          name: (e.courses as any)?.title || '',
          progress: e.progress_percentage || 0,
          lastAccessed: e.last_accessed_at
            ? getRelativeTime(new Date(e.last_accessed_at))
            : 'Never',
          grade: 0, // TODO: Calculate from quiz scores
          assignments: {
            completed: 0,
            total: 0,
          },
        })) || [],
        recentActivity: recentActivity?.map(activity => ({
          type: (activity.course_lessons as any)?.content_type || 'lesson' as const,
          description: `Completed "${(activity.course_lessons as any)?.title || 'Unknown'}"`,
          time: getRelativeTime(new Date(activity.completed_at || '')),
          timestamp: activity.completed_at || '',
        })) || [],
      }
    })

    let students = await Promise.all(studentsPromises)

    // Apply status filter
    if (query.status !== 'all') {
      students = students.filter(s => s.status === query.status)
    }

    // Apply engagement filter
    if (query.engagement !== 'all') {
      students = students.filter(s => {
        if (query.engagement === 'high') return s.engagementScore >= 80
        if (query.engagement === 'medium') return s.engagementScore >= 50 && s.engagementScore < 80
        if (query.engagement === 'low') return s.engagementScore < 50
        return true
      })
    }

    // Apply sorting
    students.sort((a, b) => {
      let aValue: any, bValue: any

      switch (query.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'progress':
          aValue = a.averageProgress
          bValue = b.averageProgress
          break
        case 'engagement':
          aValue = a.engagementScore
          bValue = b.engagementScore
          break
        case 'lastActive':
        default:
          aValue = new Date(a.lastActivityDate).getTime()
          bValue = new Date(b.lastActivityDate).getTime()
          break
      }

      if (query.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return paginatedResponse(students, {
      page,
      limit,
      total: students.length,
    })

  } catch (error) {
    logError(error, { endpoint: 'GET /api/instructor/students' })
    return handleAPIError(error)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return months === 1 ? '1 month ago' : `${months} months ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return years === 1 ? '1 year ago' : `${years} years ago`
  }
}

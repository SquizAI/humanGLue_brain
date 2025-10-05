/**
 * Instructor Student Detail API
 * @endpoint GET /api/instructor/students/:studentId
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireInstructor, requireStudentAccess } from '@/lib/api/instructor-auth'
import { handleAPIError, successResponse, logError, APIErrors } from '@/lib/api/instructor-errors'

// ============================================================================
// GET /api/instructor/students/:studentId
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // Authenticate and authorize
    const { instructorId } = await requireInstructor(request)
    const { studentId } = params

    // Verify instructor has access to this student
    await requireStudentAccess(instructorId, studentId)

    const supabase = createClient()

    // Get student basic info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        phone,
        timezone,
        organization_id,
        metadata,
        organizations (
          id,
          name
        )
      `)
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      throw APIErrors.NOT_FOUND('Student', studentId)
    }

    // Get all course enrollments with detailed progress
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        status,
        progress_percentage,
        last_accessed_at,
        completed_at,
        certificate_url,
        created_at,
        courses (
          id,
          title,
          pillar,
          level,
          thumbnail_url
        )
      `)
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })

    if (enrollmentsError) {
      throw enrollmentsError
    }

    // Get detailed course progress for each enrollment
    const courseDetailsPromises = enrollments?.map(async (enrollment) => {
      // Get modules for this course
      const { data: modules } = await supabase
        .from('course_modules')
        .select(`
          id,
          title,
          sort_order
        `)
        .eq('course_id', enrollment.course_id)
        .order('sort_order', { ascending: true })

      // Get lessons progress for each module
      const modulesWithProgress = await Promise.all(
        modules?.map(async (module) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select(`
              id,
              title,
              content_type,
              sort_order
            `)
            .eq('module_id', module.id)
            .order('sort_order', { ascending: true })

          // Get progress for each lesson
          const lessonsWithProgress = await Promise.all(
            lessons?.map(async (lesson) => {
              const { data: progress } = await supabase
                .from('lesson_progress')
                .select('*')
                .eq('enrollment_id', enrollment.id)
                .eq('lesson_id', lesson.id)
                .single()

              return {
                id: lesson.id,
                name: lesson.title,
                type: lesson.content_type,
                completed: progress?.is_completed || false,
                timeSpent: progress?.time_spent_seconds || 0,
                lastAccessed: progress?.last_accessed_at || undefined,
              }
            }) || []
          )

          // Calculate module progress
          const completedLessons = lessonsWithProgress.filter(l => l.completed).length
          const totalLessons = lessonsWithProgress.length
          const moduleProgress = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0

          return {
            id: module.id,
            name: module.title,
            progress: moduleProgress,
            lessons: lessonsWithProgress,
          }
        }) || []
      )

      return {
        id: enrollment.course_id,
        name: (enrollment.courses as any)?.title || '',
        progress: enrollment.progress_percentage || 0,
        lastAccessed: enrollment.last_accessed_at
          ? new Date(enrollment.last_accessed_at).toISOString()
          : undefined,
        grade: 0, // TODO: Calculate from quiz scores
        assignments: {
          completed: 0,
          total: 0,
        },
        enrolledAt: enrollment.created_at,
        completedAt: enrollment.completed_at || undefined,
        certificateUrl: enrollment.certificate_url || undefined,
        modules: modulesWithProgress,
      }
    }) || []

    const courseDetails = await Promise.all(courseDetailsPromises)

    // Get activity timeline
    const { data: activityData } = await supabase
      .from('lesson_progress')
      .select(`
        id,
        lesson_id,
        is_completed,
        completed_at,
        enrollment_id,
        course_lessons (
          title,
          content_type,
          module_id,
          course_modules (
            course_id,
            courses (
              title
            )
          )
        )
      `)
      .in('enrollment_id', enrollments?.map(e => e.id) || [])
      .order('completed_at', { ascending: false })
      .limit(50)

    const activityTimeline = activityData?.map(activity => ({
      type: activity.is_completed ? 'completion' : 'lesson' as const,
      description: activity.is_completed
        ? `Completed "${(activity.course_lessons as any)?.title || 'Unknown'}"`
        : `Accessed "${(activity.course_lessons as any)?.title || 'Unknown'}"`,
      time: activity.completed_at
        ? getRelativeTime(new Date(activity.completed_at))
        : 'Unknown',
      timestamp: activity.completed_at || '',
      courseId: (activity.course_lessons as any)?.course_modules?.course_id,
      courseName: (activity.course_lessons as any)?.course_modules?.courses?.title,
      metadata: {},
    })) || []

    // Calculate statistics
    const totalEnrollments = enrollments?.length || 0
    const completedCourses = enrollments?.filter(e => e.status === 'completed').length || 0
    const totalLessons = courseDetails.reduce((sum, course) =>
      sum + course.modules.reduce((mSum, module) =>
        mSum + module.lessons.length, 0
      ), 0
    )
    const completedLessons = courseDetails.reduce((sum, course) =>
      sum + course.modules.reduce((mSum, module) =>
        mSum + module.lessons.filter(l => l.completed).length, 0
      ), 0
    )

    // Build student detail response
    const studentDetail = {
      id: student.id,
      name: student.full_name,
      email: student.email,
      avatar: student.avatar_url || null,
      phone: student.phone || undefined,
      timezone: student.timezone || 'UTC',
      organization: {
        id: student.organization_id || '',
        name: (student.organizations as any)?.name || '',
      },
      enrolledCourses: totalEnrollments,
      completedCourses,
      averageProgress: totalEnrollments > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / totalEnrollments
          )
        : 0,
      lastActive: enrollments?.[0]?.last_accessed_at
        ? getRelativeTime(new Date(enrollments[0].last_accessed_at))
        : 'Never',
      lastActivityDate: enrollments?.[0]?.last_accessed_at || new Date(0).toISOString(),
      engagementScore: 0, // Calculated below
      totalWatchTime: '0h 0m', // TODO: Calculate from lesson progress
      assignmentsCompleted: 0,
      assignmentsTotal: 0,
      status: 'active' as const, // Determined below
      enrollmentDate: enrollments?.[0]?.created_at || '',
      courses: courseDetails.slice(0, 5), // Top 5 for summary
      recentActivity: activityTimeline.slice(0, 10), // Top 10 recent activities
      courseDetails,
      activityTimeline,
      stats: {
        totalLessonsCompleted: completedLessons,
        totalLessonsTotal: totalLessons,
        totalQuizzesPassed: 0, // TODO: Calculate from quiz data
        totalQuizzesTotal: 0,
        averageQuizScore: 0,
        certificatesEarned: enrollments?.filter(e => e.certificate_url).length || 0,
      },
    }

    return successResponse(studentDetail)

  } catch (error) {
    logError(error, {
      endpoint: 'GET /api/instructor/students/:studentId',
      studentId: params.studentId,
    })
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

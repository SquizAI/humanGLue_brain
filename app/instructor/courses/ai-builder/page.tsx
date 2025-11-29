'use client'

import { useRouter } from 'next/navigation'
import { AICourseBuilder } from '@/components/organisms/AICourseBuilder'

export default function AICourseBuilderPage() {
  const router = useRouter()

  const handleGenerate = async (course: any) => {
    // In a real implementation, this would:
    // 1. Save the generated course to the database
    // 2. Create all modules and lessons
    // 3. Redirect to the new course edit page

    console.log('Generated course:', course)

    // Simulate course creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to courses list
    router.push('/instructor/courses')
  }

  return <AICourseBuilder onGenerate={handleGenerate} />
}

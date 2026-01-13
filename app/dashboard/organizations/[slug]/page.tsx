'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Building2,
  Loader2
} from 'lucide-react'

interface AssessmentSummary {
  organizationId: string
  organizationName: string
  industry: string | null
  assessmentDate: string
  executiveSummary: string
  maturityLevel: string
  maturityScore: number
  maturityPercentile: number | null
  keyMetrics: {
    overallScore: number
    dimensionCount: number
    strengthsCount: number
    gapsCount: number
    recommendationsCount: number
    participantsCount: number
  }
  topStrengths: string[]
  criticalGaps: string[]
}

interface ConsensusTheme {
  id: string
  theme_name: string
  frequency: number
  sentiment: number
  quotes: string[]
}

interface RealityGap {
  id: string
  dimension: string
  leadership_perception: number
  actual_evidence: number
  gap_size: number
}

interface Recommendation {
  id: string
  title: string
  description: string
  timeframe: string
  effort_required: string
  status: string
}

interface SkillsProfile {
  id: string
  person_name: string
  title: string
  department: string
  ai_skill_level: string
  is_champion: boolean
}

export default function OrganizationDashboard() {
  const params = useParams()
  const organizationId = params.slug as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<AssessmentSummary | null>(null)
  const [themes, setThemes] = useState<ConsensusTheme[]>([])
  const [gaps, setGaps] = useState<RealityGap[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [skills, setSkills] = useState<SkillsProfile[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [summaryRes, themesRes, gapsRes, recsRes, skillsRes] = await Promise.all([
          fetch(`/api/organizations/${organizationId}/assessment-summary`),
          fetch(`/api/organizations/${organizationId}/consensus-themes`),
          fetch(`/api/organizations/${organizationId}/reality-gaps`),
          fetch(`/api/organizations/${organizationId}/recommendations`),
          fetch(`/api/organizations/${organizationId}/team-skills`)
        ])

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          setSummary(summaryData.data)
        }

        if (themesRes.ok) {
          const themesData = await themesRes.json()
          setThemes(themesData.data || [])
        }

        if (gapsRes.ok) {
          const gapsData = await gapsRes.json()
          setGaps(gapsData.data || [])
        }

        if (recsRes.ok) {
          const recsData = await recsRes.json()
          setRecommendations(recsData.data || [])
        }

        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setSkills(skillsData.data || [])
        }

      } catch (err) {
        setError('Failed to load assessment data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (organizationId) {
      fetchData()
    }
  }, [organizationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading assessment data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  const getMaturityColor = (level: string) => {
    switch (level) {
      case 'excelling': return 'bg-green-500'
      case 'evolving': return 'bg-blue-500'
      case 'establishing': return 'bg-yellow-500'
      case 'experimenting': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600'
    if (sentiment < -0.3) return 'text-red-600'
    return 'text-yellow-600'
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{summary?.organizationName || 'Organization'}</h1>
          {summary?.industry && (
            <Badge variant="outline">{summary.industry}</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          AI Maturity Assessment Dashboard
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{summary?.maturityScore?.toFixed(0) || 0}%</span>
              <Badge className={getMaturityColor(summary?.maturityLevel || 'exploring')}>
                {summary?.maturityLevel || 'Exploring'}
              </Badge>
            </div>
            <Progress value={summary?.maturityScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-3xl font-bold">{summary?.keyMetrics?.participantsCount || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-3xl font-bold">{gaps.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-3xl font-bold">{recommendations.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Summary */}
      {summary?.executiveSummary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {summary.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Details */}
      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="themes">Consensus Themes</TabsTrigger>
          <TabsTrigger value="gaps">Reality Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="team">Team Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="themes">
          <div className="grid gap-4">
            {themes.map((theme) => (
              <Card key={theme.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{theme.theme_name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Frequency: {theme.frequency}</Badge>
                      <span className={`text-sm font-medium ${getSentimentColor(theme.sentiment)}`}>
                        Sentiment: {theme.sentiment?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {theme.quotes && theme.quotes.length > 0 && (
                    <div className="space-y-2">
                      {theme.quotes.slice(0, 2).map((quote, idx) => (
                        <blockquote key={idx} className="border-l-2 border-muted pl-4 italic text-muted-foreground">
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {themes.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No consensus themes found</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gaps">
          <div className="grid gap-4">
            {gaps.map((gap) => (
              <Card key={gap.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{gap.dimension}</CardTitle>
                    <Badge variant="destructive">Gap: {gap.gap_size?.toFixed(1)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Leadership Perception</p>
                      <div className="flex items-center gap-2">
                        <Progress value={gap.leadership_perception * 10} className="flex-1" />
                        <span className="font-medium">{gap.leadership_perception?.toFixed(1)}/10</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Evidence</p>
                      <div className="flex items-center gap-2">
                        <Progress value={gap.actual_evidence * 10} className="flex-1" />
                        <span className="font-medium">{gap.actual_evidence?.toFixed(1)}/10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {gaps.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No reality gaps found</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {['immediate', 'short_term', 'long_term'].map((timeframe) => {
              const filtered = recommendations.filter(r => r.timeframe === timeframe)
              if (filtered.length === 0) return null
              return (
                <div key={timeframe}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">
                    {timeframe.replace('_', ' ')} Actions
                  </h3>
                  <div className="grid gap-3">
                    {filtered.map((rec) => (
                      <Card key={rec.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">{rec.effort_required} effort</Badge>
                              <Badge variant={rec.status === 'completed' ? 'default' : 'secondary'}>
                                {rec.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
            {recommendations.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No recommendations found</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map((profile) => (
              <Card key={profile.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{profile.person_name}</h4>
                      <p className="text-sm text-muted-foreground">{profile.title}</p>
                      <p className="text-xs text-muted-foreground">{profile.department}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="capitalize">{profile.ai_skill_level}</Badge>
                      {profile.is_champion && (
                        <div className="mt-1">
                          <Badge variant="default" className="bg-yellow-500">
                            <Target className="h-3 w-3 mr-1" />
                            Champion
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {skills.length === 0 && (
              <p className="text-muted-foreground text-center py-8 col-span-full">No team skills data found</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

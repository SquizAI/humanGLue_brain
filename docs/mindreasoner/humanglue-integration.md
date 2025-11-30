# HumanGlue Mind Reasoner Integration

How HumanGlue uses Mind Reasoner to build psychometric profiles of prospects and optimize communication strategies.

## Use Cases

### 1. Prospect Profiling
Build digital twins of prospects from video call transcripts to understand their communication style, decision-making patterns, and motivators.

### 2. Communication Optimization
Simulate how prospects will respond to different outreach messages before sending them.

### 3. Team Assessment
Analyze team members' communication styles to improve internal collaboration and client matching.

### 4. Client Success Prediction
Predict client satisfaction and identify churn risk based on communication patterns.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HumanGlue Platform                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │  Prospect   │───▶│   Mind      │───▶│  Psychometric Profile   │ │
│  │  Research   │    │  Reasoner   │    │  (Neo4j)                │ │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘ │
│         │                  │                       │               │
│         ▼                  ▼                       ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐ │
│  │  Firecrawl  │    │  Transcript │    │  Communication          │ │
│  │  Research   │    │  Upload     │    │  Recommendations        │ │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Prospect → Mind → Profile Pipeline

```
1. User identifies prospect
      │
      ▼
2. Firecrawl deep research
      │
      ▼
3. Store prospect in Neo4j
      │
      ▼
4. User uploads video transcript
      │
      ▼
5. Create Mind Reasoner mind
      │
      ▼
6. Upload transcript → Create snapshot
      │
      ▼
7. Wait for training completion
      │
      ▼
8. Run psychometric simulations
      │
      ▼
9. Store profile in Neo4j
      │
      ▼
10. Generate communication recommendations
```

## API Endpoints

### POST /api/outreach/minds
Create a Mind Reasoner mind for a prospect.

```typescript
// Request
{
  prospectId: string,      // Neo4j prospect ID
  name: string,            // Display name for the mind
}

// Response
{
  success: true,
  mind: {
    id: string,
    digitalTwinId: string,
    prospectId: string
  }
}
```

### POST /api/outreach/minds/upload
Upload a transcript to an existing mind.

```typescript
// Request (multipart/form-data)
{
  mindId: string,
  file: File               // .vtt, .pdf, or .docx
}

// Response
{
  success: true,
  artifactId: string,
  snapshotId: string
}
```

### GET /api/outreach/minds/:mindId/status
Check snapshot processing status.

```typescript
// Response
{
  success: true,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress: number         // 0-100
}
```

### POST /api/outreach/minds/:mindId/simulate
Run a simulation on a trained mind.

```typescript
// Request
{
  scenario: string,        // The situation to simulate
  model?: 'mind-reasoner-pro' | 'mind-reasoner-standard'
}

// Response
{
  success: true,
  result: {
    thinking: string,
    feeling: string,
    saying: string,
    acting: string
  }
}
```

### POST /api/outreach/minds/:mindId/analyze
Run standard psychometric analysis simulations.

```typescript
// Response
{
  success: true,
  profile: {
    communicationStyle: string,
    decisionMaking: string,
    riskTolerance: string,
    persuasionStyle: string,
    conflictStyle: string,
    motivators: string[],
    stressors: string[]
  }
}
```

## Implementation

### MindReasonerService

```typescript
// lib/services/mind-reasoner.ts

import { executeWrite, executeRead } from '@/lib/neo4j/client'

interface MindReasonerConfig {
  apiKey: string
  baseUrl: string
}

export class MindReasonerService {
  private apiKey: string
  private baseUrl: string

  constructor(config: MindReasonerConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl
  }

  // Create a new mind
  async createMind(name: string): Promise<Mind> {
    const response = await fetch(`${this.baseUrl}/minds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
    return response.json()
  }

  // Get signed upload URL
  async getUploadUrl(mindId: string): Promise<UploadUrlResponse> {
    const response = await fetch(`${this.baseUrl}/minds/${mindId}/upload-url`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })
    return response.json()
  }

  // Create snapshot from uploaded artifact
  async createSnapshot(
    mindId: string,
    digitalTwinId: string,
    artifactId: string
  ): Promise<SnapshotResponse> {
    const response = await fetch(`${this.baseUrl}/digital-twins/${digitalTwinId}/assessments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mindId,
        artifactIds: [artifactId]
      })
    })
    return response.json()
  }

  // Check snapshot status
  async getSnapshotStatus(mindId: string, snapshotId: string): Promise<SnapshotStatus> {
    const response = await fetch(
      `${this.baseUrl}/minds/${mindId}/assessments/${snapshotId}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    )
    return response.json()
  }

  // Run simulation
  async simulate(
    mindId: string,
    scenario: string,
    model: string = 'mind-reasoner-pro'
  ): Promise<SimulationResult> {
    const response = await fetch(`${this.baseUrl}/simulate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mindId,
        selectedSimulationModel: model,
        scenario: { message: scenario }
      })
    })
    return response.json()
  }

  // Wait for snapshot to complete
  async waitForSnapshot(
    mindId: string,
    snapshotId: string,
    maxAttempts: number = 60,
    intervalMs: number = 10000
  ): Promise<SnapshotStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getSnapshotStatus(mindId, snapshotId)
      if (status.status === 'completed' || status.status === 'failed') {
        return status
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
    throw new Error('Snapshot processing timeout')
  }
}

export const mindReasoner = new MindReasonerService({
  apiKey: process.env.MIND_REASONER_API_KEY!,
  baseUrl: 'https://app.mindreasoner.com/api/public/v1'
})
```

### Psychometric Analysis

```typescript
// lib/services/psychometric-analyzer.ts

import { mindReasoner } from './mind-reasoner'
import { storePsychometricProfile } from '@/lib/neo4j/mind-operations'

const ANALYSIS_PROMPTS = {
  communicationStyle: `
    Based on the conversation patterns, what is this person's primary communication style?
    Options: direct (gets to the point quickly), diplomatic (softens messages, uses qualifiers),
    analytical (data-driven, asks clarifying questions), expressive (uses stories, emotional language).
    Respond with just the style name.
  `,

  decisionMaking: `
    How does this person typically make decisions?
    Options: intuitive (goes with gut feeling), analytical (needs data and time),
    collaborative (seeks consensus), decisive (makes quick calls).
    Respond with just the style name.
  `,

  riskTolerance: `
    What is this person's risk tolerance level?
    Options: conservative (prefers safe, proven approaches), moderate (balanced risk/reward),
    aggressive (willing to take big risks for big rewards).
    Respond with just the level.
  `,

  persuasionStyle: `
    What type of persuasion is most effective with this person?
    Options: logical (facts, data, ROI), emotional (stories, vision, values),
    authority (credentials, expertise), social-proof (testimonials, case studies).
    Respond with just the style name.
  `,

  motivators: `
    List the top 3-5 things that motivate this person based on their communication.
    Format as a comma-separated list.
  `,

  stressors: `
    List the top 3-5 things that seem to stress or frustrate this person.
    Format as a comma-separated list.
  `
}

export async function analyzePsychometrics(mindId: string, snapshotId: string) {
  const results: Record<string, any> = {}

  // Run all analysis simulations in parallel
  const analyses = await Promise.all(
    Object.entries(ANALYSIS_PROMPTS).map(async ([key, prompt]) => {
      const result = await mindReasoner.simulate(mindId, prompt)
      return { key, value: result.saying || result.thinking }
    })
  )

  // Process results
  for (const { key, value } of analyses) {
    if (key === 'motivators' || key === 'stressors') {
      results[key] = value.split(',').map((s: string) => s.trim())
    } else {
      results[key] = value.toLowerCase().trim()
    }
  }

  // Store in Neo4j
  await storePsychometricProfile({
    mindId,
    snapshotId,
    ...results
  })

  return results
}
```

## UI Components

### ProspectMindCard

Display mind status and profile for a prospect:

```tsx
// components/outreach/ProspectMindCard.tsx

interface ProspectMindCardProps {
  prospect: Prospect
  mind?: Mind
  profile?: PsychometricProfile
  onCreateMind: () => void
  onUploadTranscript: () => void
  onSimulate: (scenario: string) => void
}

export function ProspectMindCard({
  prospect,
  mind,
  profile,
  onCreateMind,
  onUploadTranscript,
  onSimulate
}: ProspectMindCardProps) {
  if (!mind) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Digital Twin</CardTitle>
          <CardDescription>
            Create a digital twin to analyze {prospect.name}'s communication style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreateMind}>
            <Brain className="mr-2 h-4 w-4" />
            Create Mind
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Digital Twin</CardTitle>
          <Badge variant={mind.snapshotStatus === 'completed' ? 'success' : 'secondary'}>
            {mind.snapshotStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {mind.snapshotStatus === 'completed' && profile ? (
          <div className="space-y-4">
            <ProfileAttribute label="Communication" value={profile.communicationStyle} />
            <ProfileAttribute label="Decision Making" value={profile.decisionMaking} />
            <ProfileAttribute label="Risk Tolerance" value={profile.riskTolerance} />
            <ProfileAttribute label="Best Persuaded By" value={profile.persuasionStyle} />

            <div>
              <Label>Motivators</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.motivators.map(m => (
                  <Badge key={m} variant="outline">{m}</Badge>
                ))}
              </div>
            </div>

            <SimulationInput onSimulate={onSimulate} />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a conversation transcript to train the digital twin.
            </p>
            <Button onClick={onUploadTranscript}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Transcript
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

## Environment Variables

```bash
# Mind Reasoner API
MIND_REASONER_API_KEY=your_api_key_here

# Optional: Integration keys
GONG_ACCESS_KEY=your_gong_key
GONG_ACCESS_SECRET=your_gong_secret
FATHOM_API_KEY=your_fathom_key
FIREFLIES_API_KEY=your_fireflies_key
```

## Roadmap

### Phase 1: Basic Integration ✅
- Mind Reasoner service wrapper
- Neo4j schema for minds and profiles
- Basic psychometric analysis

### Phase 2: Communication Optimization (In Progress)
- Message simulation before sending
- A/B testing different approaches
- Personalized template generation

### Phase 3: Team Analytics
- Team communication style mapping
- Optimal client-team matching
- Internal collaboration insights

### Phase 4: Predictive Analytics
- Churn risk prediction
- Deal close probability
- Engagement scoring

## Best Practices

1. **Minimum Data Quality** — Ensure transcripts have clear speaker attribution
2. **Recent Data** — Use transcripts from the last 6 months for accuracy
3. **Multiple Sources** — Combine data from different meeting types
4. **Regular Updates** — Re-train minds quarterly with new data
5. **Simulation Testing** — Test scenarios before actual outreach

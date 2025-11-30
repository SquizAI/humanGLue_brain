# Mind Reasoner Neo4j Integration

Store psychometric profiles from Mind Reasoner simulations in your Neo4j knowledge graph for relationship mapping and analysis.

## Graph Schema

### Nodes

#### Mind Node
Represents a Mind Reasoner digital twin linked to a prospect.

```cypher
(:Mind {
  id: UUID,                    // Mind Reasoner mind ID
  name: String,                // Display name
  digitalTwinId: UUID,         // Associated digital twin ID
  latestSnapshotId: UUID,      // Most recent completed snapshot
  snapshotStatus: String,      // pending | processing | completed | failed
  createdAt: DateTime,
  updatedAt: DateTime
})
```

#### PsychometricProfile Node
Stores analyzed psychometric dimensions from simulations.

```cypher
(:PsychometricProfile {
  id: UUID,
  mindId: UUID,                // Reference to Mind node
  snapshotId: UUID,            // Snapshot this profile is based on
  communicationStyle: String,  // direct | diplomatic | analytical | expressive
  decisionMaking: String,      // intuitive | analytical | collaborative | decisive
  riskTolerance: String,       // conservative | moderate | aggressive
  persuasionStyle: String,     // logical | emotional | authority | social-proof
  conflictStyle: String,       // avoiding | accommodating | competing | collaborating
  motivators: [String],        // Array of key motivators
  stressors: [String],         // Array of stress triggers
  analyzedAt: DateTime
})
```

#### SimulationResult Node
Stores individual simulation responses for historical analysis.

```cypher
(:SimulationResult {
  id: UUID,
  mindId: UUID,
  scenario: String,            // The simulation prompt
  thinking: String,            // How they think
  feeling: String,             // Emotional response
  saying: String,              // Verbal response
  acting: String,              // Behavioral response
  model: String,               // mind-reasoner-pro | mind-reasoner-standard
  simulatedAt: DateTime
})
```

### Relationships

```cypher
// Link Mind to Prospect
(p:Prospect)-[:HAS_MIND]->(m:Mind)

// Link Mind to Psychometric Profile
(m:Mind)-[:HAS_PROFILE]->(pp:PsychometricProfile)

// Link Mind to Simulation Results
(m:Mind)-[:SIMULATION]->(sr:SimulationResult)

// Link Profile to Snapshot
(pp:PsychometricProfile)-[:FROM_SNAPSHOT]->(s:Snapshot)
```

## Cypher Operations

### Create Mind for Prospect

```cypher
MATCH (p:Prospect {id: $prospectId})
CREATE (m:Mind {
  id: $mindId,
  name: $name,
  digitalTwinId: $digitalTwinId,
  snapshotStatus: 'pending',
  createdAt: datetime(),
  updatedAt: datetime()
})
CREATE (p)-[:HAS_MIND]->(m)
RETURN m
```

### Update Mind After Snapshot Completes

```cypher
MATCH (m:Mind {id: $mindId})
SET m.latestSnapshotId = $snapshotId,
    m.snapshotStatus = 'completed',
    m.updatedAt = datetime()
RETURN m
```

### Store Psychometric Profile

```cypher
MATCH (m:Mind {id: $mindId})
CREATE (pp:PsychometricProfile {
  id: randomUUID(),
  mindId: $mindId,
  snapshotId: $snapshotId,
  communicationStyle: $communicationStyle,
  decisionMaking: $decisionMaking,
  riskTolerance: $riskTolerance,
  persuasionStyle: $persuasionStyle,
  conflictStyle: $conflictStyle,
  motivators: $motivators,
  stressors: $stressors,
  analyzedAt: datetime()
})
CREATE (m)-[:HAS_PROFILE]->(pp)
RETURN pp
```

### Store Simulation Result

```cypher
MATCH (m:Mind {id: $mindId})
CREATE (sr:SimulationResult {
  id: randomUUID(),
  mindId: $mindId,
  scenario: $scenario,
  thinking: $thinking,
  feeling: $feeling,
  saying: $saying,
  acting: $acting,
  model: $model,
  simulatedAt: datetime()
})
CREATE (m)-[:SIMULATION]->(sr)
RETURN sr
```

### Query Prospects with Psychometric Data

```cypher
MATCH (p:Prospect)-[:HAS_MIND]->(m:Mind)-[:HAS_PROFILE]->(pp:PsychometricProfile)
WHERE pp.communicationStyle = 'analytical'
RETURN p.name, p.title, p.company, pp.decisionMaking, pp.motivators
ORDER BY m.updatedAt DESC
```

### Find Similar Communication Styles

```cypher
MATCH (p1:Prospect)-[:HAS_MIND]->(m1:Mind)-[:HAS_PROFILE]->(pp1:PsychometricProfile)
WHERE p1.id = $prospectId
WITH pp1.communicationStyle as targetStyle, pp1.persuasionStyle as targetPersuasion
MATCH (p2:Prospect)-[:HAS_MIND]->(m2:Mind)-[:HAS_PROFILE]->(pp2:PsychometricProfile)
WHERE pp2.communicationStyle = targetStyle
  AND pp2.persuasionStyle = targetPersuasion
  AND p2.id <> $prospectId
RETURN p2.name, p2.company, pp2
LIMIT 10
```

### Get Simulation History

```cypher
MATCH (m:Mind {id: $mindId})-[:SIMULATION]->(sr:SimulationResult)
RETURN sr.scenario, sr.thinking, sr.feeling, sr.saying, sr.acting, sr.simulatedAt
ORDER BY sr.simulatedAt DESC
LIMIT 20
```

## TypeScript Implementation

### Store Mind in Neo4j

```typescript
import { executeWrite } from '@/lib/neo4j/client'

interface MindData {
  mindId: string
  name: string
  digitalTwinId: string
  prospectId: string
}

export async function storeMindInGraph(data: MindData) {
  const query = `
    MATCH (p:Prospect {id: $prospectId})
    CREATE (m:Mind {
      id: $mindId,
      name: $name,
      digitalTwinId: $digitalTwinId,
      snapshotStatus: 'pending',
      createdAt: datetime(),
      updatedAt: datetime()
    })
    CREATE (p)-[:HAS_MIND]->(m)
    RETURN m
  `

  const result = await executeWrite(query, data)
  return result[0]?.m
}
```

### Store Psychometric Profile

```typescript
interface PsychometricData {
  mindId: string
  snapshotId: string
  communicationStyle: string
  decisionMaking: string
  riskTolerance: string
  persuasionStyle: string
  conflictStyle: string
  motivators: string[]
  stressors: string[]
}

export async function storePsychometricProfile(data: PsychometricData) {
  const query = `
    MATCH (m:Mind {id: $mindId})
    CREATE (pp:PsychometricProfile {
      id: randomUUID(),
      mindId: $mindId,
      snapshotId: $snapshotId,
      communicationStyle: $communicationStyle,
      decisionMaking: $decisionMaking,
      riskTolerance: $riskTolerance,
      persuasionStyle: $persuasionStyle,
      conflictStyle: $conflictStyle,
      motivators: $motivators,
      stressors: $stressors,
      analyzedAt: datetime()
    })
    CREATE (m)-[:HAS_PROFILE]->(pp)
    RETURN pp
  `

  const result = await executeWrite(query, data)
  return result[0]?.pp
}
```

### Store Simulation Result

```typescript
interface SimulationData {
  mindId: string
  scenario: string
  thinking: string
  feeling: string
  saying: string
  acting: string
  model: 'mind-reasoner-pro' | 'mind-reasoner-standard'
}

export async function storeSimulationResult(data: SimulationData) {
  const query = `
    MATCH (m:Mind {id: $mindId})
    CREATE (sr:SimulationResult {
      id: randomUUID(),
      mindId: $mindId,
      scenario: $scenario,
      thinking: $thinking,
      feeling: $feeling,
      saying: $saying,
      acting: $acting,
      model: $model,
      simulatedAt: datetime()
    })
    CREATE (m)-[:SIMULATION]->(sr)
    RETURN sr
  `

  const result = await executeWrite(query, data)
  return result[0]?.sr
}
```

## Workflow Integration

### Complete Mind Reasoner → Neo4j Pipeline

```typescript
// 1. Create mind in Mind Reasoner
const mind = await mindReasoner.createMind({ name: prospect.name })

// 2. Store mind reference in Neo4j
await storeMindInGraph({
  mindId: mind.id,
  name: mind.name,
  digitalTwinId: mind.digitalTwin.id,
  prospectId: prospect.id
})

// 3. Upload transcript and create snapshot
const uploadUrl = await mindReasoner.getSignedUploadUrl(mind.id)
await mindReasoner.uploadFile(uploadUrl.signedUrl, transcriptPath)
const snapshot = await mindReasoner.createSnapshot({
  mindId: mind.id,
  digitalTwinId: mind.digitalTwin.id,
  artifactId: uploadUrl.artifactId
})

// 4. Poll until complete
await waitForSnapshot(mind.id, snapshot.mindAssessmentId)

// 5. Update Neo4j with snapshot status
await updateMindStatus(mind.id, snapshot.mindAssessmentId, 'completed')

// 6. Run analysis simulations and store profiles
const profile = await analyzeAndStorePsychometrics(mind.id)
```

## Best Practices

1. **Always link Minds to Prospects** — Maintain graph relationships for querying
2. **Store all simulation results** — Build historical data for pattern analysis
3. **Update snapshot status** — Keep Neo4j in sync with Mind Reasoner state
4. **Use batch operations** — When processing multiple prospects, batch Neo4j writes
5. **Index key properties** — Create indexes on `Mind.id`, `PsychometricProfile.mindId`

## Index Recommendations

```cypher
// Create indexes for performance
CREATE INDEX mind_id IF NOT EXISTS FOR (m:Mind) ON (m.id);
CREATE INDEX mind_snapshot IF NOT EXISTS FOR (m:Mind) ON (m.latestSnapshotId);
CREATE INDEX profile_mind IF NOT EXISTS FOR (pp:PsychometricProfile) ON (pp.mindId);
CREATE INDEX profile_style IF NOT EXISTS FOR (pp:PsychometricProfile) ON (pp.communicationStyle);
CREATE INDEX simulation_mind IF NOT EXISTS FOR (sr:SimulationResult) ON (sr.mindId);
```

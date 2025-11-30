# Mind Reasoner Core Concepts

Mind Reasoner has three core concepts: **Minds**, **Snapshots**, and **Simulations**.

## Minds

A **mind** is a container that represents a person. Think of it as a digital profile.

### What a Mind Does

- **Stores conversation transcripts** — Upload and manage training data
- **Holds metadata** — Name, creation date, and configuration
- **Creates snapshots** — Generate multiple AI models over time as data evolves

### Mind Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Human-readable name |
| `digitalTwin` | object | Associated digital twin for simulations |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |

## Snapshots

A **snapshot** is a trained AI model built from conversation transcripts. It captures how someone thinks and communicates at a specific point in time.

### Training Process

1. **Upload Data** — Provide conversation transcripts (.vtt, .pdf, or .docx format)
   - Minimum: 10-20 conversations or 5,000+ words

2. **AI Training** — Mind Reasoner analyzes across hundreds of dimensions of psychometrics
   - Takes 5-15 minutes

3. **Ready to Use** — Once complete, run unlimited simulations without re-training

### Snapshot States

| Status | Description |
|--------|-------------|
| `pending` | Snapshot created, waiting to process |
| `processing` | AI training in progress |
| `completed` | Ready for simulations |
| `failed` | Processing error occurred |

### Data Requirements

- **Minimum**: 10-20 conversations or 5,000+ words
- **Recommended**: 30-50 conversations for better accuracy
- **Best Results**: Recent transcripts (last 6 months)
- **Format**: Clean, clear speaker attribution

## Simulations

A **simulation** predicts how someone would respond to any scenario based on their trained snapshot.

### Writing Effective Scenarios

**Be Specific:**
- Bad: "How would they handle a complaint?"
- Good: "A customer received a damaged product 3 days before their event. They need a replacement by tomorrow, but the product is out of stock. How would you respond?"

**Include Context:**
- Emotional state (frustrated, confused, urgent)
- Time constraints (by tomorrow, within 24 hours)
- Constraints (out of stock, over budget)
- Desired outcome (resolution, information)

### Simulation Response

The simulation returns a comprehensive analysis of how the person would:
- **Think** — Internal reasoning process
- **Feel** — Emotional response
- **Say** — Verbal response
- **Act** — Behavioral response

### Model Options

| Model | Description | Use Case |
|-------|-------------|----------|
| `mind-reasoner-pro` | Most advanced model | Complex scenarios, high accuracy |
| `mind-reasoner-standard` | Faster model | Quick simulations, batch processing |

## Workflow Summary

```
1. CREATE MIND
   └─→ Returns: mindId, digitalTwinId

2. UPLOAD DATA
   ├─→ Get signed upload URL (returns artifactId)
   └─→ Upload transcript file

3. CREATE SNAPSHOT
   └─→ Returns: snapshotId (mindAssessmentId)

4. WAIT FOR TRAINING
   └─→ Poll until status = "completed"

5. RUN SIMULATIONS
   └─→ Unlimited predictions from trained model
```

## Best Practices

1. **Quality Over Quantity** — Clean transcripts with clear speaker attribution
2. **Recent Data** — Use transcripts from the last 6 months
3. **Diverse Scenarios** — Include various conversation types
4. **Specific Prompts** — More context = better predictions
5. **Iterate** — Run multiple scenarios and compare patterns

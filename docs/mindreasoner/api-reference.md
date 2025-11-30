# Mind Reasoner API Reference

The Mind Reasoner REST API allows you to programmatically create digital minds, upload data, and run simulations.

## Base URL

```
https://app.mindreasoner.com/api/public/v1
```

## Authentication

All requests require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

Get your API key from the [Mind Reasoner Dashboard](https://app.mindsim.com).

---

## Minds API

### Create a Mind

Create a new digital mind container.

**Endpoint:** `POST /minds`

**Request:**
```bash
curl -X POST https://app.mindreasoner.com/api/public/v1/minds \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Example Mind"}'
```

**Response:**
```json
{
  "mind": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Example Mind",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "digitalTwin": {
    "id": "abcde123-e89b-12d3-a456-426614174001",
    "name": "Default"
  }
}
```

### Get All Minds

List all minds in your account.

**Endpoint:** `GET /minds`

**Request:**
```bash
curl -X GET https://app.mindreasoner.com/api/public/v1/minds \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Mind by ID

Retrieve a specific mind by its ID.

**Endpoint:** `GET /minds/{mindId}`

**Request:**
```bash
curl -X GET https://app.mindreasoner.com/api/public/v1/minds/YOUR_MIND_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Data Upload API

### Get Signed Upload URL

Get a secure, one-time URL for uploading a data file.

**Endpoint:** `GET /minds/{mindId}/signed-url`

**Request:**
```bash
curl -X GET "https://app.mindreasoner.com/api/public/v1/minds/YOUR_MIND_ID/signed-url" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "signedUrl": "https://storage.googleapis.com/...",
  "fileName": "...",
  "artifactId": "fedcba98-e89b-12d3-a456-426614174002"
}
```

### Upload File to Signed URL

Upload your transcript file to the signed URL.

**Endpoint:** `PUT {signedUrl}`

**Request:**
```bash
curl -X PUT "YOUR_SIGNED_URL" \
  -H "Content-Type: text/vtt" \
  --data-binary "@/path/to/your/transcript.vtt"
```

**Supported File Types:**
- `.vtt` - WebVTT transcript (Content-Type: `text/vtt`)
- `.pdf` - PDF document (Content-Type: `application/pdf`)
- `.docx` - Word document (Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)

---

## Snapshots API

### Create Snapshot

Start processing uploaded data into a trained AI model.

**Endpoint:** `POST /minds/{mindId}/snapshots`

**Request:**
```bash
curl -X POST "https://app.mindreasoner.com/api/public/v1/minds/YOUR_MIND_ID/snapshots" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "digitalTwinId=YOUR_DIGITAL_TWIN_ID" \
  -F "artifactId=YOUR_ARTIFACT_ID"
```

**Response:**
```json
{
  "message": "Mind assessment started",
  "mindAssessmentId": "98765432-e89b-12d3-a456-426614174003",
  "artifactId": "fedcba98-e89b-12d3-a456-426614174002"
}
```

### Get Snapshot Status

Check the processing status of a snapshot.

**Endpoint:** `GET /minds/{mindId}/snapshots/{snapshotId}/status`

**Request:**
```bash
curl -X GET "https://app.mindreasoner.com/api/public/v1/minds/YOUR_MIND_ID/snapshots/YOUR_SNAPSHOT_ID/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "id": "98765432-e89b-12d3-a456-426614174003",
  "status": "completed",
  "createdAt": "2024-01-15T10:35:00Z",
  "completedAt": "2024-01-15T10:45:00Z"
}
```

**Status Values:**
- `pending` - Waiting to process
- `processing` - AI training in progress
- `completed` - Ready for simulations
- `failed` - Processing error

---

## Simulation API

### Run Simulation

Run an AI prediction on a trained mind.

**Endpoint:** `POST /simulate`

**Request:**
```bash
curl -X POST https://app.mindreasoner.com/api/public/v1/simulate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mindId": "YOUR_MIND_ID",
    "scenario": {
      "message": "What would be your response to this customer complaint?"
    },
    "selectedSimulationModel": "mind-reasoner-pro"
  }'
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mindId` | UUID | Yes | The mind to simulate |
| `scenario.message` | string | Yes | The scenario to simulate |
| `selectedSimulationModel` | string | No | Model to use (`mind-reasoner-pro` or `mind-reasoner-standard`) |

**Response:**
```json
{
  "message": "Based on the provided data, my response would be...",
  "confidence": 0.85,
  "analysis": {
    "thinking": "Internal reasoning...",
    "feeling": "Emotional response...",
    "saying": "Verbal response...",
    "acting": "Behavioral response..."
  }
}
```

---

## Error Responses

All endpoints return standard HTTP error codes:

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Description of the error",
    "details": {}
  }
}
```

---

## Rate Limits

- **Standard tier**: 100 requests/minute
- **Pro tier**: 500 requests/minute
- **Enterprise**: Custom limits

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Max requests per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

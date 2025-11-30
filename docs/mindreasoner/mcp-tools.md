# Mind Reasoner MCP Tools Reference

Complete documentation of all Mind Reasoner MCP tools available through the MCP Server.

## Core Tools (14 Total)

### Mind Management

| Tool | Operation | Purpose |
|------|-----------|---------|
| `get_all_minds` | READ | List all minds |
| `search_minds` | READ | Search for minds by name/attributes |
| `get_mind_by_id` | READ | Get a specific mind |
| `create_mind` | CREATE | Create a new digital mind |

### Tag Management

| Tool | Operation | Purpose |
|------|-----------|---------|
| `get_all_tags` | READ | List all organization tags with mind counts |
| `update_tag` | UPDATE | Rename a tag across all minds |
| `delete_tag` | DELETE | Delete a tag from the workspace |
| `set_mind_tags` | UPDATE | Set/replace tags for a specific mind |

### Data Upload & Processing

| Tool | Operation | Purpose |
|------|-----------|---------|
| `get_signed_upload_url` | GET | Get secure upload URL |
| `upload_file_to_signed_url` | UPLOAD | Upload transcript files |
| `create_artifact` | CREATE | Create artifact from integrations |
| `create_snapshot` | CREATE | Process uploaded data |
| `get_snapshot_status` | GET | Check processing status |

### Simulation

| Tool | Operation | Purpose |
|------|-----------|---------|
| `simulate` | RUN | Run AI predictions on a mind |

---

## Tool Details

### create_mind

Create a new digital mind container.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Human-readable name for the mind |

**Returns:**
- `mind.id` - UUID of the created mind
- `digitalTwin.id` - UUID of the associated digital twin

**Example:**
```
"Create a new mind for my sales manager named Alex"
```

### get_all_minds

List all minds in your account.

**Parameters:** None

**Returns:** Array of mind objects with IDs, names, and metadata.

**Example:**
```
"Show me all the minds I've created"
```

### search_minds

Search minds by name, email, or attributes.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query |

**Example:**
```
"Find minds related to sales"
```

### get_signed_upload_url

Get a secure, one-time URL for uploading files.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mindId` | UUID | Yes | ID of the mind |

**Returns:**
- `signedUrl` - Temporary upload URL
- `artifactId` - ID to reference the uploaded file

### upload_file_to_signed_url

Upload a transcript file to the signed URL.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signedUrl` | string | Yes | URL from get_signed_upload_url |
| `filePath` | string | Yes | Local path to the file |
| `contentType` | string | Yes | MIME type of the file |

**Supported MIME Types:**
- `text/vtt` - WebVTT transcripts
- `application/pdf` - PDF documents
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word docs

### create_snapshot

Start processing uploaded data into a trained AI model.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mindId` | UUID | Yes | ID of the mind |
| `digitalTwinId` | UUID | Yes | ID of the digital twin |
| `artifactId` | UUID | Yes | ID of the uploaded artifact |

**Returns:** `mindAssessmentId` (snapshotId) for status checking

### get_snapshot_status

Check the processing status of a snapshot.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mindId` | UUID | Yes | ID of the mind |
| `snapshotId` | UUID | Yes | ID from create_snapshot |

**Status Values:**
- `pending` - Waiting to process
- `processing` - Training in progress
- `completed` - Ready for simulations
- `failed` - Error occurred

### simulate

Run AI predictions on a trained mind.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mindId` | UUID | Yes | ID of the mind |
| `scenario.message` | string | Yes | Scenario to simulate |
| `selectedSimulationModel` | string | No | Model to use |

**Model Options:**
- `mind-reasoner-pro` - Most advanced (default)
- `mind-reasoner-standard` - Faster, less detailed

---

## Integration Tools

### Gong Tools (3)

| Tool | Purpose |
|------|---------|
| `gong_list_calls` | List sales call recordings with date filtering |
| `gong_get_transcript` | Get detailed transcripts with speaker attribution |
| `gong_get_call_details` | Get participant details, topics, and call analytics |

### Fathom Tools (3)

| Tool | Purpose |
|------|---------|
| `fathom_list_meetings` | List meetings with summaries and participants |
| `fathom_get_transcript` | Get transcripts with speaker details |
| `fathom_get_meeting_details` | Get comprehensive meeting information |

### Fireflies Tools (3)

| Tool | Purpose |
|------|---------|
| `fireflies_list_transcripts` | List meeting transcripts with date filtering |
| `fireflies_get_transcript` | Get detailed transcripts with speaker analytics |
| `fireflies_search_transcripts` | Search transcripts by keyword |

### Zoom Tools (3)

| Tool | Purpose |
|------|---------|
| `zoom_list_recordings` | List cloud recordings |
| `zoom_get_transcript` | Get meeting transcript |
| `zoom_get_meeting_details` | Get meeting metadata |

---

## Workflow Patterns

### First-Time Setup
```
1. create_mind → Returns mindId, digitalTwinId
2. get_signed_upload_url → Returns signedUrl, artifactId
3. upload_file_to_signed_url → Confirms upload
4. create_snapshot → Returns snapshotId
5. get_snapshot_status → Wait for "completed"
6. simulate → Run predictions
```

### Running Multiple Simulations
After training completes, use `simulate` unlimited times without re-training.

### Adding New Data
Skip step 1 (mind exists), run steps 2-6 with new data.

---

## Error Handling

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Resource doesn't exist |
| 429 | Rate Limited - Wait and retry |
| 400 | Bad Request - Check parameters |

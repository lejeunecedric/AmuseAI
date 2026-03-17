---
phase: 05-job-queue
plan: 01
phase_name: "Job Queue"
plan_name: "Async Job Processing"
subsystem: "API"
tags: ["jobs", "async", "queue", "background-service", "task-processing"]
dependency_graph:
  requires: ["02-text-to-image", "03-image-transformation", "04-model-management"]
  provides: []
  affects: ["02-text-to-image", "03-image-transformation"]
tech_stack:
  added: ["BackgroundService"]
  patterns: ["Producer-consumer queue", "Background processing", "Async/await", "HTTP 202 Accepted"]
key_files:
  created:
    - "Amuse.API/Models/Job.cs"
    - "Amuse.API/Services/JobQueueService.cs"
  modified:
    - "Amuse.API/Program.cs"
decisions: []
metrics:
  duration: "15 minutes"
  completed_date: "2026-03-17"
---

# Phase 5 Plan 01: Job Queue Summary

**One-liner:** Implemented full async job queue system with background processing, converting all generation endpoints to return job IDs immediately while processing asynchronously.

## What Was Built

### 1. Job Model (`Amuse.API/Models/Job.cs`)
Represents an async job with comprehensive tracking:

**JobStatus Enum:**
- **Pending**: Job created, waiting in queue
- **Processing**: Job currently being executed
- **Completed**: Job finished successfully
- **Failed**: Job encountered an error
- **Cancelled**: Job was cancelled before completion

**Job Properties:**
- **Id**: Unique GUID identifier
- **Type**: Job type (text2img, img2img, upscale)
- **Status**: Current job status
- **CreatedAt**: Timestamp when job was created
- **StartedAt**: Timestamp when processing began
- **CompletedAt**: Timestamp when job finished/failed/cancelled
- **Progress**: Progress percentage (0-100)
- **Result**: Output data (e.g., `{ image: "base64..." }`)
- **Error**: Error message if job failed
- **Request**: Original request data

### 2. JobQueueService (`Amuse.API/Services/JobQueueService.cs`)
Background service implementing `BackgroundService` for async job processing:

**Features:**
- Runs continuously in background processing queue
- Thread-safe using `ConcurrentDictionary` and `ConcurrentQueue`
- Automatic job lifecycle management
- Cancellation support
- Comprehensive logging

**Methods:**
- `CreateJobAsync(type, request)`: Creates new job, adds to queue, returns immediately
- `GetAllJobsAsync()`: Returns all jobs sorted by creation time
- `GetJobAsync(id)`: Returns specific job details
- `CancelJobAsync(id)`: Cancels pending or processing job
- `ExecuteAsync()`: Background processing loop (from BackgroundService)

**Processing Flow:**
1. Job created with status "Pending"
2. Background service picks up job from queue
3. Status changes to "Processing"
4. Job executes based on type (text2img/img2img/upscale)
5. On success: Status = "Completed", Result = image data
6. On failure: Status = "Failed", Error = message
7. If cancelled during processing: Status = "Cancelled"

### 3. Updated Generation Endpoints (`Amuse.API/Program.cs`)

**Changed from synchronous to async:**

**POST /api/generate/text2img** (Modified)
- Validates request parameters
- Creates job and returns immediately with HTTP 202 Accepted
- Response: `{ jobId, status: "pending", message, checkStatusAt }`

**POST /api/generate/img2img** (Modified)
- Validates request parameters
- Creates job and returns immediately with HTTP 202 Accepted
- Response: `{ jobId, status: "pending", message, checkStatusAt }`

**POST /api/upscale** (Modified)
- Validates request parameters
- Creates job and returns immediately with HTTP 202 Accepted
- Response: `{ jobId, status: "pending", message, checkStatusAt }`

### 4. New Job Management Endpoints

**GET /api/jobs**
Returns list of all jobs with their current status.
```json
{
  "jobs": [
    {
      "id": "abc123",
      "type": "text2img",
      "status": "completed",
      "createdAt": "2026-03-17T20:30:00Z",
      "progress": 100,
      "result": { "image": "base64..." }
    }
  ]
}
```

**GET /api/jobs/{id}**
Returns specific job details including result if completed.
```json
{
  "id": "abc123",
  "type": "text2img",
  "status": "completed",
  "createdAt": "2026-03-17T20:30:00Z",
  "startedAt": "2026-03-17T20:30:01Z",
  "completedAt": "2026-03-17T20:30:05Z",
  "progress": 100,
  "result": { "image": "base64..." }
}
```

**DELETE /api/jobs/{id}**
Cancels a pending or processing job.
```json
{ "message": "Job 'abc123' cancelled successfully", "jobId": "abc123" }
```

## Technical Decisions

1. **BackgroundService**: Used ASP.NET Core's built-in `BackgroundService` for reliable background processing that integrates with application lifecycle.

2. **HTTP 202 Accepted**: Return code for generation endpoints to indicate request accepted but processing async.

3. **Concurrent Collections**: Used `ConcurrentDictionary` and `ConcurrentQueue` for thread-safe access without locks.

4. **Immediate Response**: All generation endpoints return immediately with job ID, allowing clients to poll for results.

5. **In-Memory Storage**: Jobs stored in memory (sufficient for v1). Can be extended to Redis/database for persistence.

## Workflow Example

```bash
# 1. Create a generation job
curl -X POST http://localhost:5000/api/generate/text2img \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat", "width": 512, "height": 512, "steps": 20}'
# Response: { "jobId": "abc123", "status": "pending", ... }

# 2. Check job status
curl http://localhost:5000/api/jobs/abc123
# Response: { "id": "abc123", "status": "processing", "progress": 50, ... }

# 3. Get completed result
curl http://localhost:5000/api/jobs/abc123
# Response: { "id": "abc123", "status": "completed", "result": { "image": "base64..." }, ... }

# 4. Or cancel if needed
curl -X DELETE http://localhost:5000/api/jobs/abc123
```

## API Endpoints Summary (Complete)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /health | GET | Health check |
| /api/info | GET | API version and capabilities |
| /api/generate/text2img | POST | Create T2I job (returns job ID) |
| /api/generate/img2img | POST | Create I2I job (returns job ID) |
| /api/upscale | POST | Create upscale job (returns job ID) |
| /api/models | GET | List all models |
| /api/models/{id} | GET | Get model details |
| /api/models/loaded | GET | List loaded models |
| /api/models/{id}/load | POST | Load model |
| /api/models/{id}/unload | POST | Unload model |
| **/api/jobs** | **GET** | **List all jobs** |
| **/api/jobs/{id}** | **GET** | **Get job status/result** |
| **/api/jobs/{id}** | **DELETE** | **Cancel job** |

## Requirements Satisfied

- [x] **JOB-01**: POST endpoints return job ID immediately (async processing)
- [x] **JOB-02**: GET /api/jobs returns list of jobs with status
- [x] **JOB-03**: GET /api/jobs/{id} returns job status and result
- [x] **JOB-04**: DELETE /api/jobs/{id} cancels pending/running job
- [x] **JOB-05**: Job status includes: pending, processing, completed, failed, cancelled

## Commits

- `b9fea73`: feat(phase-5): implement async job queue system

## Project Complete! 🎉

All 5 phases of the AmuseAI Headless API have been successfully implemented!

**Final Statistics:**
- 5 Phases Complete
- 5 Plans Complete
- 26/26 Requirements Satisfied
- 13 API Endpoints
- 5 Services
- 7 Models

**Next Steps (v2 Ideas):**
- Real model integration with OnnxStack
- WebSocket for real-time progress updates
- Batch operations
- Video generation endpoints
- Authentication (if needed for remote access)
- Redis for distributed job processing

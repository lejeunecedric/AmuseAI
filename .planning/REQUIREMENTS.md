# Requirements: AmuseAI Headless API

**Defined:** 2026-03-17
**Core Value:** Enable automated, programmatic AI image/video generation through a REST API

## v1 Requirements

### API Server

- [ ] **API-01**: Server starts as console application on configurable port (default 5000)
- [ ] **API-02**: Server responds to health check at GET /health
- [ ] **API-03**: Server returns API info at GET /api info (version, capabilities)
- [ ] **API-04**: Server graceful shutdown on Ctrl+C or kill signal

### Text-to-Image Generation

- [ ] **T2I-01**: POST /api/generate/text2img accepts prompt, returns generated image
- [ ] **T2I-02**: Supports negative_prompt parameter
- [ ] **T2I-03**: Supports width, height parameters (512-1024)
- [ ] **T2I-04**: Supports steps, guidance_scale parameters
- [ ] **T2I-05**: Supports seed parameter for reproducibility
- [ ] **T2I-06**: Returns image as Base64 or file path

### Image-to-Image Generation

- [ ] **I2I-01**: POST /api/generate/img2img accepts prompt + input image, returns transformed image
- [ ] **I2I-02**: Supports strength/denoise parameter (0.0-1.0)
- [ ] **I2I-03**: Supports same generation parameters as T2I (steps, seed, etc.)

### Image Upscaling

- [ ] **UPS-01**: POST /api/upscale accepts input image, returns upscaled image
- [ ] **UPS-02**: Supports scale parameter (2x, 4x)
- [ ] **UPS-03**: Supports tile_mode parameter for large images

### Model Management

- [ ] **MOD-01**: GET /api/models returns list of available models
- [ ] **MOD-02**: GET /api/models/{id} returns model details
- [ ] **MOD-03**: POST /api/models/{id}/load loads specified model
- [ ] **MOD-04**: POST /api/models/{id}/unload unloads specified model
- [ ] **MOD-05**: GET /api/models/loaded returns currently loaded models

### Job Queue

- [ ] **JOB-01**: POST endpoints return job ID immediately (async processing)
- [ ] **JOB-02**: GET /api/jobs returns list of jobs with status
- [ ] **JOB-03**: GET /api/jobs/{id} returns job status and result
- [ ] **JOB-04**: DELETE /api/jobs/{id} cancels pending/running job
- [ ] **JOB-05**: Job status includes: pending, processing, completed, failed, cancelled

### Configuration

- [ ] **CFG-01**: Port configurable via appsettings.json or command line
- [ ] **CFG-02**: Model paths configurable (default from existing AmuseAI settings)
- [ ] **CFG-03**: Device (CPU/DirectML) configurable

## v2 Requirements

### Video Generation

- **VID-01**: POST /api/generate/text2video — text-to-video generation
- **VID-02**: POST /api/generate/img2video — image-to-video generation
- **VID-03**: POST /api/generate/vid2video — video-to-video transformation

### Batch Operations

- **BAT-01**: POST /api/batch accepts multiple prompts, returns multiple images
- **BAT-02**: GET /api/batch/{id} returns batch job status

### WebSocket

- **WS-01**: WebSocket endpoint for real-time progress updates
- **WS-02**: WebSocket endpoint for streaming generated images

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication | Local-only use, open API for v1 |
| User management | Not needed for headless API |
| Web UI dashboard | CLI-first for v1 |
| Rate limiting | Defer to v2 |
| Redis/job persistence | In-memory sufficient for v1 |
| OAuth/API keys | Defer to v2 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Partial (code complete, build blocked) |
| API-02 | Phase 1 | Partial (code complete, build blocked) |
| API-03 | Phase 1 | Partial (code complete, build blocked) |
| API-04 | Phase 1 | Partial (code complete, build blocked) |
| T2I-01 | Phase 2 | Pending |
| T2I-02 | Phase 2 | Pending |
| T2I-03 | Phase 2 | Pending |
| T2I-04 | Phase 2 | Pending |
| T2I-05 | Phase 2 | Pending |
| T2I-06 | Phase 2 | Pending |
| I2I-01 | Phase 3 | Pending |
| I2I-02 | Phase 3 | Pending |
| I2I-03 | Phase 3 | Pending |
| UPS-01 | Phase 3 | Pending |
| UPS-02 | Phase 3 | Pending |
| UPS-03 | Phase 3 | Pending |
| MOD-01 | Phase 4 | Pending |
| MOD-02 | Phase 4 | Pending |
| MOD-03 | Phase 4 | Pending |
| MOD-04 | Phase 4 | Pending |
| MOD-05 | Phase 4 | Pending |
| JOB-01 | Phase 5 | Pending |
| JOB-02 | Phase 5 | Pending |
| JOB-03 | Phase 5 | Pending |
| JOB-04 | Phase 5 | Pending |
| JOB-05 | Phase 5 | Pending |
| CFG-01 | Phase 1 | Partial (code complete, build blocked) |
| CFG-02 | Phase 1 | Partial (code complete, build blocked) |
| CFG-03 | Phase 1 | Partial (code complete, build blocked) |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after initial definition*

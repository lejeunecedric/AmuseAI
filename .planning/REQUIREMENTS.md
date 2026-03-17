# Requirements: AmuseAI Headless API

**Defined:** 2026-03-17
**Core Value:** Enable automated, programmatic AI image/video generation through a REST API

## v1 Requirements

### API Server

- [x] **API-01**: Server starts as console application on configurable port (default 5000)
- [x] **API-02**: Server responds to health check at GET /health
- [x] **API-03**: Server returns API info at GET /api info (version, capabilities)
- [x] **API-04**: Server graceful shutdown on Ctrl+C or kill signal

### Text-to-Image Generation

- [x] **T2I-01**: POST /api/generate/text2img accepts prompt, returns generated image
- [x] **T2I-02**: Supports negative_prompt parameter
- [x] **T2I-03**: Supports width, height parameters (512-1024)
- [x] **T2I-04**: Supports steps, guidance_scale parameters
- [x] **T2I-05**: Supports seed parameter for reproducibility
- [x] **T2I-06**: Returns image as Base64 or file path

### Image-to-Image Generation

- [x] **I2I-01**: POST /api/generate/img2img accepts prompt + input image, returns transformed image
- [x] **I2I-02**: Supports strength/denoise parameter (0.0-1.0)
- [x] **I2I-03**: Supports same generation parameters as T2I (steps, seed, etc.)

### Image Upscaling

- [x] **UPS-01**: POST /api/upscale accepts input image, returns upscaled image
- [x] **UPS-02**: Supports scale parameter (2x, 4x)
- [x] **UPS-03**: Supports tile_mode parameter for large images

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

- [x] **CFG-01**: Port configurable via appsettings.json or command line
- [x] **CFG-02**: Model paths configurable (default from existing AmuseAI settings)
- [x] **CFG-03**: Device (CPU/DirectML) configurable

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
| API-01 | Phase 1 | Complete |
| API-02 | Phase 1 | Complete |
| API-03 | Phase 1 | Complete |
| API-04 | Phase 1 | Complete |
| T2I-01 | Phase 2 | Complete |
| T2I-02 | Phase 2 | Complete |
| T2I-03 | Phase 2 | Complete |
| T2I-04 | Phase 2 | Complete |
| T2I-05 | Phase 2 | Complete |
| T2I-06 | Phase 2 | Complete |
| I2I-01 | Phase 3 | Complete |
| I2I-02 | Phase 3 | Complete |
| I2I-03 | Phase 3 | Complete |
| UPS-01 | Phase 3 | Complete |
| UPS-02 | Phase 3 | Complete |
| UPS-03 | Phase 3 | Complete |
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
| CFG-01 | Phase 1 | Complete |
| CFG-02 | Phase 1 | Complete |
| CFG-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after Phase 3 completion*

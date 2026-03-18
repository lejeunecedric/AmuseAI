# Roadmap: AmuseAI Headless API

**Milestone v1.0:** ✅ Complete (Phases 1-5) — 26/26 requirements
**Milestone v1.1:** ○ Planned (Phases 6-10) — 22/22 requirements mapped

**Total Phases:** 10
**Granularity:** standard
**Overall Coverage:** 48/48 requirements mapped ✓

## Phases

- [x] **Phase 1: API Server Foundation** - Console app setup, basic server, config (completed 2026-03-17)
- [x] **Phase 2: Text-to-Image** - T2I generation endpoint (completed 2026-03-17)
- [x] **Phase 3: Image Transformation** - I2I and Upscale endpoints (completed 2026-03-17)
- [x] **Phase 4: Model Management** - Model listing, load/unload endpoints (completed 2026-03-17)
- [x] **Phase 5: Job Queue** - Async job processing (completed 2026-03-17)

---

## Phase Details

### Phase 1: API Server Foundation

**Goal:** Console application with basic API server running

**Depends on:** Nothing (first phase)

**Requirements:** API-01, API-02, API-03, API-04, CFG-01, CFG-02, CFG-03

**Success Criteria** (what must be TRUE):
1. Server starts and listens on configured port
2. GET /health returns 200 OK
3. GET /api/info returns version and capabilities
4. Server shuts down gracefully on Ctrl+C
5. Port configurable via appsettings.json and command line
6. Model paths configurable
7. Device (CPU/DirectML) configurable

**Plans:** 1/1 plans complete

---

### Phase 2: Text-to-Image

**Goal:** Users can generate images from text prompts via API

**Depends on:** Phase 1

**Requirements:** T2I-01, T2I-02, T2I-03, T2I-04, T2I-05, T2I-06

**Success Criteria** (what must be TRUE):
1. POST /api/generate/text2img accepts prompt and returns image
2. Negative prompt parameter works
3. Width/height parameters work (512-1024 range)
4. Steps and guidance_scale parameters affect generation
5. Seed parameter produces reproducible results
6. Output returned as Base64 or file path

**Plans:** 1/1 plans complete - 02-01-PLAN.md, 02-01-SUMMARY.md

---

### Phase 3: Image Transformation

**Goal:** Users can transform existing images via API

**Depends on:** Phase 2

**Requirements:** I2I-01, I2I-02, I2I-03, UPS-01, UPS-02, UPS-03

**Success Criteria** (what must be TRUE):
1. POST /api/generate/img2img accepts prompt + input image, returns transformed image
2. Strength parameter controls transformation intensity (0.0-1.0)
3. Same generation parameters available as T2I (steps, seed, guidance_scale)
4. POST /api/upscale accepts input image, returns upscaled image
5. Scale parameter supports 2x and 4x upscaling
6. Tile mode parameter available for large images

**Plans:** 1/1 plans complete - 03-01-SUMMARY.md

---

### Phase 4: Model Management

**Goal:** Users can list, load, and unload AI models via API

**Depends on:** Phase 1

**Requirements:** MOD-01, MOD-02, MOD-03, MOD-04, MOD-05

**Success Criteria** (what must be TRUE):
1. GET /api/models returns list of all available models with metadata
2. GET /api/models/{id} returns specific model details
3. POST /api/models/{id}/load loads model into memory with confirmation
4. POST /api/models/{id}/unload frees model from memory
5. GET /api/models/loaded returns currently loaded models with memory usage

**Plans:** 1/1 plans complete - 04-01-SUMMARY.md

---

### Phase 5: Job Queue

**Goal:** Long-running operations return job IDs for async tracking

**Depends on:** Phase 2, Phase 3, Phase 4

**Requirements:** JOB-01, JOB-02, JOB-03, JOB-04, JOB-05

**Success Criteria** (what must be TRUE):
1. Generation endpoints return job ID immediately (async)
2. GET /api/jobs returns list of all jobs with status
3. GET /api/jobs/{id} returns specific job details and result
4. DELETE /api/jobs/{id} cancels pending/running job
5. Job status accurately reflects: pending, processing, completed, failed, cancelled

**Plans:** 1/1 plans complete - 05-01-SUMMARY.md

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Server Foundation | 1/1 | Complete    | 2026-03-17 |
| 2. Text-to-Image | 1/1 | Complete    | 2026-03-17 |
| 3. Image Transformation | 1/1 | Complete    | 2026-03-17 |
| 4. Model Management | 1/1 | Complete    | 2026-03-17 |
| 5. Job Queue | 1/1 | Complete    | 2026-03-17 |

---

---

## Milestone v1.1: API Web Client

**Phases:** 5 (Phases 6-10)
**Granularity:** standard
**Coverage:** 22/22 requirements mapped ✓

## Phases v1.1

- [ ] **Phase 6: Web Client Foundation** - Static file server, API discovery, basic layout
- [ ] **Phase 7: Generation Testing UI** - Forms for T2I, I2I, Upscale with results
- [ ] **Phase 8: Job Monitor Dashboard** - Real-time job status with auto-refresh
- [x] **Phase 9: Model Management UI** - Load/unload interface (completed 2026-03-18)
- [x] **Phase 10: API Inspector** - Request/response debugging tools (completed 2026-03-18)

---

### Phase 6: Web Client Foundation

**Goal:** Web client serves static files and connects to API

**Depends on:** Phase 1 (API must be running)

**Requirements:** WEB-01, WEB-02, WEB-03, WEB-04

**Success Criteria** (what must be TRUE):
1. Web client starts on port 5001
2. Client auto-detects API at localhost:5000
3. Serves clean HTML/CSS/JS without build step
4. Basic responsive layout with navigation

**Plans:** 1 plan - 06-01-PLAN.md

---

### Phase 7: Generation Testing UI

**Goal:** Developers can test all generation endpoints via forms

**Depends on:** Phase 6

**Requirements:** GEN-01, GEN-02, GEN-03, GEN-04, GEN-05

**Success Criteria** (what must be TRUE):
1. T2I form has all parameter inputs
2. I2I form supports image upload
3. Upscale form has image upload and scale selector
4. Generated images display inline
5. Raw request/response JSON visible

**Plans:** 1 plan - 07-01-PLAN.md

---

### Phase 8: Job Monitor Dashboard

**Goal:** Real-time monitoring of job queue

**Depends on:** Phase 6, Phase 5 (Job Queue API)

**Requirements:** JOBM-01, JOBM-02, JOBM-03, JOBM-04, JOBM-05

**Success Criteria** (what must be TRUE):
1. All jobs listed with current status
2. Auto-refresh every 2 seconds
3. Click job to see details and result
4. Cancel button works for pending/processing jobs
5. Visual status indicators (colors/icons)

**Plans:** 1 plan - 08-01-PLAN.md

---

### Phase 9: Model Management UI

**Goal:** Visual interface for model operations

**Depends on:** Phase 6, Phase 4 (Model API)

**Requirements:** MODU-01, MODU-02, MODU-03, MODU-04

**Success Criteria** (what must be TRUE):
1. All models displayed with metadata
2. Currently loaded models highlighted
3. Load/unload buttons with confirmation
4. Memory usage displayed

**Plans:** 1/1 plans complete

---

### Phase 10: API Inspector

**Goal:** Debug and inspect API calls

**Depends on:** Phase 6

**Requirements:** INSP-01, INSP-02, INSP-03, INSP-04

**Success Criteria** (what must be TRUE):
1. Raw HTTP requests displayed
2. Raw HTTP responses displayed
3. Copy-to-clipboard for curl commands
4. Response time shown for each call

**Plans:** 1/1 plans complete

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Server Foundation | 1/1 | Complete    | 2026-03-17 |
| 2. Text-to-Image | 1/1 | Complete    | 2026-03-17 |
| 3. Image Transformation | 1/1 | Complete    | 2026-03-17 |
| 4. Model Management | 1/1 | Complete    | 2026-03-17 |
| 5. Job Queue | 1/1 | Complete    | 2026-03-17 |
| 6. Web Client Foundation | 1/1 | Planned     | - |
| 7. Generation Testing UI | 1/1 | Planned     | - |
| 8. Job Monitor Dashboard | 1/1 | Planned     | - |
| 9. Model Management UI | 1/1 | Complete   | 2026-03-18 |
| 10. API Inspector | 1/1 | Complete   | 2026-03-18 |

---

*Roadmap created: 2026-03-17*
*Updated: 2026-03-17 for v1.1 API Web Client*
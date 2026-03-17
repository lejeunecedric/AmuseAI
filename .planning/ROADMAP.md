# Roadmap: AmuseAI Headless API

**Phases:** 5
**Granularity:** standard
**Coverage:** 26/26 requirements mapped ✓

## Phases

- [x] **Phase 1: API Server Foundation** - Console app setup, basic server, config (completed 2026-03-17)
- [x] **Phase 2: Text-to-Image** - T2I generation endpoint (completed 2026-03-17)
- [x] **Phase 3: Image Transformation** - I2I and Upscale endpoints (completed 2026-03-17)
- [x] **Phase 4: Model Management** - Model listing, load/unload endpoints (completed 2026-03-17)
- [ ] **Phase 5: Job Queue** - Async job processing

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

**Goal:** Users can list, load, and unload models via API

**Depends on:** Phase 1

**Requirements:** MOD-01, MOD-02, MOD-03, MOD-04, MOD-05

**Success Criteria** (what must be TRUE):
1. GET /api/models returns list of available models with details
2. GET /api/models/{id} returns specific model info
3. POST /api/models/{id}/load loads model into memory
4. POST /api/models/{id}/unload frees model from memory
5. GET /api/models/loaded returns currently loaded models

**Plans:** 1 plan - 01-01-PLAN.md

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

**Plans:** 1 plan - 01-01-PLAN.md

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Server Foundation | 1/1 | Complete    | 2026-03-17 |
| 2. Text-to-Image | 1/1 | Complete    | 2026-03-17 |
| 3. Image Transformation | 1/1 | Complete    | 2026-03-17 |
| 4. Model Management | 1/1 | Complete    | 2026-03-17 |
| 5. Job Queue | 0/1 | Not started | - |

---

*Roadmap created: 2026-03-17*
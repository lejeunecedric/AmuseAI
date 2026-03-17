# AmuseAI Headless API

## What This Is

A headless API server that exposes AmuseAI's AI image/video generation capabilities via HTTP endpoints. Runs as a separate console application, allowing programmatic access to text-to-image, image-to-image, upscaling, and model management without the WPF UI.

## Core Value

Enable automated, programmatic AI image/video generation through a REST API, allowing AmuseAI to be integrated into pipelines, scripts, and external applications.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] API server runs as standalone console application
- [ ] Text-to-image generation endpoint
- [ ] Image-to-image generation endpoint
- [ ] Image upscaling endpoint
- [ ] Model management endpoints (list, load, unload)
- [ ] Job queue for batch/long-running operations
- [ ] Job status tracking and retrieval

### Out of Scope

- WPF UI integration — headless runs separately
- User authentication — local-only open API
- Web UI dashboard — CLI + curl usage only
- Video generation via API — defer to v2
- Real-time WebSocket streaming — polling only for v1

## Context

**Existing codebase:** AmuseAI is a WPF desktop app using ONNX Stack for local AI inference. The core AI libraries (OnnxStack.*) are pure .NET with no UI dependencies.

**Key existing services to leverage:**
- `ModelCacheService` — loads/unloads ONNX pipelines
- `ProviderService` — configures DirectML/CPU execution
- `ModelFactory` — creates model configurations
- `StableDiffusionPipeline` — core generation logic

**Technical approach:**
- New `Amuse.API` console project (ASP.NET Core minimal APIs)
- Share model configurations with existing WPF app
- Use existing OnnxStack libraries (no changes needed)
- Job queue using in-memory dictionary + file-based persistence

## Constraints

- **Platform:** Windows 10+ x64 (DirectML GPU acceleration)
- **Runtime:** .NET 8.0 (same as existing app)
- **Dependencies:** Must work with existing OnnxStack v0.60.0
- **Port:** Default 5000, configurable via appsettings

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate console app | Clean separation, can deploy headless | — Pending |
| No authentication | Local-only use, simpler for v1 | — Pending |
| In-memory job queue | Fast for single-instance, can add Redis later | — Pending |
| Polling for status | Simpler than WebSocket for v1 | — Pending |

---
*Last updated: 2026-03-17 after initialization*

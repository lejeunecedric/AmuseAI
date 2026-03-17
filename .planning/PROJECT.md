# AmuseAI Headless API

## What This Is

A headless API server that exposes AmuseAI's AI image/video generation capabilities via HTTP endpoints. Runs as a separate console application, allowing programmatic access to text-to-image, image-to-image, upscaling, and model management without the WPF UI.

## Core Value

Enable automated, programmatic AI image/video generation through a REST API, allowing AmuseAI to be integrated into pipelines, scripts, and external applications.

## Requirements

### Validated

- ✓ API server runs as standalone console application (v1.0)
- ✓ Text-to-image generation endpoint (v1.0)
- ✓ Image-to-image generation endpoint (v1.0)
- ✓ Image upscaling endpoint (v1.0)
- ✓ Model management endpoints (list, load, unload) (v1.0)
- ✓ Job queue for async operations (v1.0)
- ✓ Job status tracking and retrieval (v1.0)

### Active

- [ ] Web-based API testing interface
- [ ] Real-time job monitoring dashboard
- [ ] Interactive model management UI
- [ ] Request/response inspector
- [ ] Inline image display for generated results
- [ ] Form-based parameter input for all endpoints

### Out of Scope

- WPF UI integration — headless runs separately
- User authentication — local-only open API
- Production web dashboard — this is a dev/testing tool only
- Video generation via API — defer to v2
- Real-time WebSocket streaming — polling only for v1
- Mobile app — not needed for API testing
- Advanced user management — single-user dev tool

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
| Separate console app | Clean separation, can deploy headless | ✓ Good |
| No authentication | Local-only use, simpler for v1 | ✓ Good |
| In-memory job queue | Fast for single-instance, can add Redis later | ✓ Good |
| Polling for status | Simpler than WebSocket for v1 | ✓ Good |

## Current Milestone: v1.1 API Web Client

**Goal:** Create a web-based testing tool for developers to interact with the AmuseAI API

**Target features:**
- Web UI for testing all API endpoints (T2I, I2I, Upscale)
- Real-time job status monitoring with auto-refresh
- Model management interface (list, load, unload)
- Request/response inspection for debugging
- Simple form-based interface for parameter input
- Display generated images inline

---
*Last updated: 2026-03-17 after v1.0 completion*

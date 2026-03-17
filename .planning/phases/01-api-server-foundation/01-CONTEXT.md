# Phase 1: API Server Foundation - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Console application with basic API server running. Includes:
- Server starts and listens on configured port
- GET /health returns 200 OK
- GET /api/info returns version and capabilities
- Server shuts down gracefully on Ctrl+C
- Port, model paths, and device configurable

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Standalone solution (Amuse.API.sln) separate from main Amuse.sln
- New Amuse.API console project
- References shared model configs from existing Amuse.UI project

### Response Format
- Minimal JSON format — return data directly or simple wrapper
- No consistent envelope (success/error fields)

### Error Handling
- JSON error bodies with details (not just HTTP status codes)
- Include error message and field-level details where applicable

### Logging
- Serilog (same as Amuse.UI)
- Console sink for output
- File sink for persistence

</decisions>

<specifics>
## Specific Ideas

- "Standalone solution keeps cleaner boundaries"
- "Simple response format — direct values, not heavy envelopes"
- "JSON errors — more useful for API consumers"

</specifics>

<a_code_context>
## Existing Code Insights

### Reusable Assets
- Amuse.UI Services: ModelCacheService, ProviderService, ModelFactory — can be referenced from API project
- AmuseSettings model — already handles model paths and device config

### Established Patterns
- Serilog with file sinks in Amuse.UI
- DI container (Microsoft.Extensions.Hosting) already used
- ONNX Stack libraries are .NET Standard compatible

### Integration Points
- Model configs can be shared via project reference to Amuse.UI
- Settings from existing Amuse settings location (AppData/AmuseAI)

</a_code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-api-server-foundation*
*Context gathered: 2026-03-17*

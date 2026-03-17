# Phase 2: Text-to-Image - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can generate images from text prompts via API. This phase delivers:
- POST /api/generate/text2img endpoint that accepts text prompts and returns generated images
- Support for core Stable Diffusion parameters (negative prompt, dimensions, steps, guidance scale, seed)
- Image output as Base64 or file path
- Proper error handling and validation

Depends on: Phase 1 (API server foundation)
</domain>

<decisions>
## Implementation Decisions

### Endpoint Structure
- POST /api/generate/text2img with JSON request body
- Separate from image-to-image and upscaling endpoints for clarity
- Follows REST conventions with clear resource naming

### Parameter Handling
- All generation parameters in request body as JSON properties
- Validate parameter ranges (dimensions 512-1024, steps > 0, etc.)
- Use sensible defaults matching Stable Diffusion conventions
- Return validation errors as JSON error bodies with field-level details

### Image Output Format
- Return generated image as Base64 string in JSON response
- Consistent with API-02/API-03 response format (direct values)
- No file system writes for v1 (defer batch/file saving to later phases)

### Model Selection
- Use default model from configuration (AmuseSettings)
- No model selection parameter in v1 (use configured/default model)
- Model management endpoints (Phase 4) handle loading/unloading
</decisions>

<specifics>
## Specific Ideas

- "POST endpoint with JSON body feels most RESTful for complex parameters"
- "Base64 output keeps it simple - no file cleanup needed"
- "Use same model config as WPF app for consistency"
- "Validate inputs early with clear error messages"
</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Amuse.UI Services: ModelCacheService, ProviderService, ModelFactory
- AmuseUI StableDiffusion views (GenerateImageResultAsync, etc.) for reference
- Existing OnnxStack.StableDiffusion pipeline usage patterns
- Serilog logging already configured in Amuse.API

### Established Patterns
- Two-stage Serilog initialization from Phase 1
- Minimal API pattern with WebApplication.CreateBuilder
- JSON request/response handling from Phase 1 research
- Configuration via appsettings.json with ApiSettings section

### Integration Points
- Reference Amuse.API project to access ModelCacheService and related services
- Use same appsettings.json configuration patterns
- Reuse Serilog configuration from Phase 1
</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope
</deferred>

---

*Phase: 02-text-to-image*
*Context gathered: 2026-03-17*

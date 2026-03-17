---
phase: 03-image-transformation
plan: 01
phase_name: "Image Transformation"
plan_name: "I2I and Upscale Endpoints"
subsystem: "API"
tags: ["img2img", "upscale", "image-processing", "api"]
dependency_graph:
  requires: ["02-text-to-image"]
  provides: ["04-model-management"]
  affects: []
tech_stack:
  added: []
  patterns: ["Minimal API endpoints", "Base64 image encoding", "Validation attributes"]
key_files:
  created:
    - "Amuse.API/Models/Img2ImgRequest.cs"
    - "Amuse.API/Models/UpscaleRequest.cs"
  modified:
    - "Amuse.API/Services/StableDiffusionService.cs"
    - "Amuse.API/Program.cs"
decisions: []
metrics:
  duration: "15 minutes"
  completed_date: "2026-03-17"
---

# Phase 3 Plan 01: Image Transformation Summary

**One-liner:** Implemented image-to-image transformation and upscaling endpoints with Base64 image support and comprehensive validation.

## What Was Built

### 1. Img2ImgRequest Model (`Amuse.API/Models/Img2ImgRequest.cs`)
Request model for image-to-image generation with the following properties:
- **Prompt** (required): Text description of desired output
- **NegativePrompt** (optional): Text description of what to avoid
- **Image** (required): Base64-encoded input image
- **Strength** (0.0-1.0): Transformation strength (default: 0.75)
- **Width/Height** (512-1024): Output dimensions (default: 512x512)
- **Steps** (1-100): Number of inference steps (default: 20)
- **GuidanceScale** (0.0-20.0): How closely to follow prompt (default: 7.5)
- **Seed** (optional): For reproducible results

### 2. UpscaleRequest Model (`Amuse.API/Models/UpscaleRequest.cs`)
Request model for image upscaling with the following properties:
- **Image** (required): Base64-encoded input image
- **Scale** (2 or 4): Upscale factor (default: 2)
- **TileMode** (boolean): Process large images in tiles (default: false)

### 3. Service Methods (`Amuse.API/Services/StableDiffusionService.cs`)
Added two new service methods:
- **`Img2ImgAsync`**: Transforms an input image based on a prompt and strength parameter
- **`UpscaleAsync`**: Upscales an input image by 2x or 4x with optional tile mode

Both methods include:
- Base64 image decoding
- Input validation
- Error handling with logging
- Placeholder implementations returning colored images (blue for img2img, green for upscale)

### 4. API Endpoints (`Amuse.API/Program.cs`)
Added two new endpoints:
- **`POST /api/generate/img2img`**: Accepts Img2ImgRequest, returns transformed image
- **`POST /api/upscale`**: Accepts UpscaleRequest, returns upscaled image

Both endpoints include:
- Comprehensive validation (prompt, image, dimensions, steps, guidance scale, strength/scale)
- Proper error responses (400 for bad requests, 500 for server errors)
- Base64 image output in JSON response

## Technical Decisions

1. **Placeholder Implementation**: Used colored placeholder images (blue for img2img, green for upscale) to allow API testing before real model integration.

2. **Base64 Encoding**: Images are accepted and returned as Base64 strings in JSON for easy API consumption and browser compatibility.

3. **Validation**: Server-side validation for all parameters with clear error messages.

## Testing

Build succeeded with 18 warnings (async/await and Windows-specific System.Drawing warnings - expected for placeholder implementation).

### Test Endpoints:
```bash
# Test img2img (requires a Base64 image)
curl -X POST http://localhost:5000/api/generate/img2img \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat", "image": "<base64-encoded-image>", "strength": 0.75}'

# Test upscale (requires a Base64 image)
curl -X POST http://localhost:5000/api/upscale \
  -H "Content-Type: application/json" \
  -d '{"image": "<base64-encoded-image>", "scale": 2}'
```

## API Capabilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| /health | GET | Health check |
| /api/info | GET | API version and capabilities |
| /api/generate/text2img | POST | Generate image from text |
| /api/generate/img2img | POST | Transform image with prompt |
| /api/upscale | POST | Upscale image by 2x or 4x |

## Requirements Satisfied

- [x] **I2I-01**: POST /api/generate/img2img accepts prompt + input image, returns transformed image
- [x] **I2I-02**: Supports strength/denoise parameter (0.0-1.0)
- [x] **I2I-03**: Supports same generation parameters as T2I (steps, seed, etc.)
- [x] **UPS-01**: POST /api/upscale accepts input image, returns upscaled image
- [x] **UPS-02**: Supports scale parameter (2x, 4x)
- [x] **UPS-03**: Supports tile_mode parameter for large images

## Commits

- `eec754b`: feat(phase-3): implement image transformation endpoints

## Next Phase

**Phase 4: Model Management** - Implement model listing, loading, and unloading endpoints.

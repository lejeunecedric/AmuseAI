---
phase: 10-api-inspector
plan: 01
type: execute
subsystem: Web Client
phase_name: "Phase 10: API Inspector"
tags: [web-client, inspector, debugging, javascript, curl]
dependencies:
  requires:
    - "09-model-management-ui"
  provides:
    - "API debugging and inspection functionality"
  affects: []
tech-stack:
  added:
    - "Event listener pattern for API interception"
  patterns:
    - "Observer pattern for API call capture"
    - "Session-based in-memory history"
    - "Accordion-style expandable details"
    - "curl command generation"
key-files:
  created:
    - path: "Amuse.Web/wwwroot/js/inspector.js"
      description: "Main module for API inspection with history, curl generation, UI"
  modified:
    - path: "Amuse.Web/wwwroot/js/api.js"
      description: "Wrapped fetchApi() with event listener pattern for capture"
    - path: "Amuse.Web/wwwroot/js/app.js"
      description: "Integrated inspector initialization and section lifecycle"
    - path: "Amuse.Web/wwwroot/index.html"
      description: "Added full Inspector UI with controls and history list"
    - path: "Amuse.Web/wwwroot/css/styles.css"
      description: "Added inspector styles for method badges, status colors, details"
decisions: []
metrics:
  duration: "35 min"
  completed_date: "2026-03-18"
  tasks_completed: 5
  files_created: 1
  files_modified: 4
  commits: 5
---

# Phase 10 Plan 01: API Inspector Summary

## What Was Built

Complete API Inspector module for debugging API interactions with request/response capture, curl command generation, and timing analysis.

### Core Functionality

1. **API Call Capture** - Intercepts all API calls via event listener pattern
   - Wrapped fetchApi() captures timing, request, and response details
   - Uses performance.now() for sub-millisecond precision
   - Clones response to capture body without consuming
   - Captures errors with full context

2. **History Management** - Maintains session-based call history
   - In-memory storage (max 100 calls)
   - Newest-first display order
   - Clear all functionality
   - Pause/Resume capture controls

3. **Curl Generation** - Generates valid curl commands from captured requests
   - Compact format (single line)
   - Pretty format (multi-line with continuation)
   - Proper shell escaping for special characters
   - Copy to clipboard with visual feedback

4. **Call Details UI** - Accordion-style expandable entries
   - Method badge (GET=green, POST=blue, DELETE=red)
   - Status badge (2xx=green, 3xx=blue, 4xx=orange, 5xx=red)
   - Response time in milliseconds
   - Expandable sections: Timing, Request, Response, Curl Command

5. **Body Handling** - Smart display for large payloads
   - Automatic truncation for bodies > 10KB
   - Base64 image data detection and placeholder
   - Size indicators for all bodies

### Architecture

```
api.js fetchApi()
    ↓ (wrapped with capture)
notifyListeners()
    ↓
inspector.js recordApiCall()
    ↓
Render to #inspector-history-list
```

### Data Structure

```javascript
{
    id: 'call-{timestamp}-{random}',
    timestamp: 1712345678901,
    request: {
        method: 'POST',
        url: 'http://localhost:5000/api/generate/text2img',
        headers: { 'Content-Type': 'application/json' },
        body: '{"prompt":"sunset"}',
        bodySize: 19
    },
    response: {
        status: 202,
        statusText: 'Accepted',
        headers: { 'content-type': 'application/json' },
        body: '{"jobId":"abc-123"}',
        bodySize: 20
    },
    timing: {
        startTime: 1234567890.5,
        endTime: 1234567935.7,
        duration: 45.2
    },
    error: null // or { message, name }
}
```

### Implementation Highlights

- **Non-breaking**: All existing API calls work unchanged
- **Zero overhead when inactive**: Capture only when Inspector section is visible
- **Clean separation**: api.js emits events, inspector.js handles storage/UI
- **Consistent patterns**: Uses same MutationObserver pattern as jobs/models

### Requirements Coverage

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| INSP-01: Capture all API requests | ✅ Complete | Event listener pattern in api.js |
| INSP-02: Generate curl commands | ✅ Complete | generateCurlCommand() with compact/pretty |
| INSP-03: Display response times | ✅ Complete | performance.now() timing displayed in ms |
| INSP-04: Show headers and body | ✅ Complete | Expandable sections with headers/body |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] inspector.js exists with initInspector, startCapturing, stopCapturing, recordApiCall, clearHistory
- [x] api.js exports addApiCallListener and maintains all existing exports
- [x] app.js imports and initializes inspector, sets up MutationObserver
- [x] index.html has #inspector-history-list, #inspector-clear-btn, #inspector-empty-state
- [x] styles.css has .inspector-call, .call-method, .call-status, .curl-display
- [x] JavaScript syntax validated (node --check passed)
- [x] No breaking changes to existing functionality

## Commits

1. **643c026** - feat(10-01): Task 1 - Create inspector.js module
2. **ee517bd** - feat(10-01): Task 2 - Add API interception to api.js
3. **03d31dd** - feat(10-01): Task 3 - Add Inspector UI to index.html
4. **4c2b986** - feat(10-01): Task 4 - Add Inspector CSS styles
5. **a9832be** - feat(10-01): Task 5 - Integrate inspector with app.js

## Next Steps

**Awaiting human verification** of the API Inspector:
1. Start Amuse.API and Amuse.Web
2. Navigate to Inspector section first
3. Navigate to Jobs/Models sections to generate API traffic
4. Return to Inspector - verify calls appear
5. Test expansion, curl copy, pause/clear functionality
6. Verify response times are accurate
7. Test error capture (stop API, try operation)

Once verified, Phase 10 is complete and Milestone v1.1 is finished!

# Phase 10: API Inspector - Context

**Phase:** 10 - API Inspector  
**Milestone:** v1.1 Web Client (Final Phase)  
**Status:** Ready for Planning  

## Goal

Provide debugging and inspection tools for API calls, enabling developers to:
- View raw HTTP requests and responses
- Copy curl commands for API testing
- Track response times and API call history
- Inspect errors in detail

## Requirements

| ID | Description | Status |
|----|-------------|--------|
| INSP-01 | Show raw HTTP requests being made | Pending |
| INSP-02 | Show raw HTTP responses | Pending |
| INSP-03 | Copy-to-clipboard for curl commands | Pending |
| INSP-04 | Response time display for each call | Pending |

## Decisions (Locked)

### Architecture Decisions
1. **Intercept at api.js level**: Wrap the existing `fetchApi()` function to capture all requests/responses without modifying individual call sites
2. **In-memory history storage**: Store last 100 API calls in memory (session-based, no localStorage persistence needed for v1)
3. **Curl generation in browser**: Generate curl commands client-side from captured request data
4. **Integrate with existing UI**: Use the existing `section-inspector` placeholder in index.html

### Technical Decisions
5. **Request/response capture format**: Store complete request/response objects including:
   - Timestamp
   - Method, URL, headers, body
   - Response status, headers, body, timing
   - Error details if failed
6. **Timing measurement**: Use `performance.now()` for sub-millisecond precision
7. **Body size limits**: Truncate request/response bodies over 10KB for display (full data still stored)
8. **History management**: Provide clear all button, no individual delete needed for v1

## Claude's Discretion

### Design Options to Recommend
1. **Inspector UI Layout**: 
   - Option A: Split-pane (list on left, detail on right) - recommended for power users
   - Option B: Accordion-style list with expandable items - simpler, more compact
   
2. **History Display**:
   - Option A: Show all API calls from session start
   - Option B: Show only since Inspector section opened + clear history on navigation (recommended)

3. **curl Command Format**:
   - Basic: `curl -X POST -H "Content-Type: application/json" -d '{...}' http://localhost:5000/api/...`
   - Pretty: Multi-line with proper escaping for readability
   - Both: Provide toggle between compact and pretty formats

4. **Response Display**:
   - Show full HTTP response line (status code + status text)
   - Syntax-highlighted JSON body
   - Collapsible headers section

### Implementation Approach
1. Create new `inspector.js` module
2. Modify `api.js` to expose request/response events or use a wrapper pattern
3. Initialize inspector in `app.js` similar to jobs/models modules
4. Populate the existing `#section-inspector` container in index.html

## Deferred Ideas (Out of Scope)

| Feature | Reason |
|---------|--------|
| WebSocket monitoring | No WebSocket API in v1.1 |
| Request replay functionality | Complex feature, defer to v2 |
| Export history to JSON/CSV | Not needed for debugging tool |
| Filter/search in history | Overkill for 100-item limit |
| Network waterfall visualization | Too complex for vanilla JS |
| localStorage persistence | Session-based sufficient for v1 |
| Request modification/editing | Out of scope - use curl instead |

## Current State Analysis

### Existing Infrastructure

**API Communication (`api.js`)**:
- Centralized `fetchApi(endpoint, options)` function used by all modules
- `API_BASE_URL` = `http://localhost:5000`
- Wraps native `fetch()` with default headers and error handling
- Returns JSON or text based on Content-Type

**UI Structure (`index.html`)**:
- Sidebar navigation includes "Inspector" link (data-section="inspector")
- Empty placeholder section exists: `<section id="section-inspector">`
- Consistent with Jobs/Models section patterns

**Module Pattern**:
- ES6 modules with `initXxx()` functions
- Event-driven updates
- State management in module scope
- Polling pattern used in jobs.js and models.js

### API Endpoints Used by Web Client

| Method | Endpoint | Used By |
|--------|----------|---------|
| GET | /health | Connection check (app.js) |
| GET | /api/info | Not currently used in UI |
| GET | /api/jobs | Jobs monitor |
| GET | /api/jobs/{id} | Job details expansion |
| DELETE | /api/jobs/{id} | Cancel job |
| GET | /api/models | Models list |
| GET | /api/models/loaded | Memory summary |
| POST | /api/models/{id}/load | Load model |
| POST | /api/models/{id}/unload | Unload model |
| POST | /api/generate/text2img | T2I form |
| POST | /api/generate/img2img | I2I form |
| POST | /api/upscale | Upscale form |

### Existing Request/Response Display

The generation forms (forms.js) already show request/response JSON:
- `displayRawRequest(formPrefix, data)` - shows POST body
- `displayRawResponse(formPrefix, response)` - shows response JSON
- Toggleable sections in the form UI
- This is form-specific, not a comprehensive API inspector

## Technical Considerations

### Request Interception Strategy

**Option 1: Wrapper Pattern (Recommended)**
```javascript
// In api.js - wrap fetchApi
const originalFetchApi = fetchApi;
export async function fetchApi(endpoint, options) {
    const startTime = performance.now();
    // ... capture request details
    try {
        const response = await originalFetchApi(endpoint, options);
        // ... capture response details
        recordApiCall({ request, response, timing });
        return response;
    } catch (error) {
        // ... capture error details
        recordApiCall({ request, error, timing });
        throw error;
    }
}
```

**Option 2: Event Emitter Pattern**
- Export event target from api.js
- Emit 'request' and 'response' events
- Inspector subscribes to events

### Curl Generation

**Mapping fetch options to curl**:
- Method: `-X {method}`
- Headers: `-H "Key: Value"` (multiple)
- Body: `-d '{...}'` or `--data-binary @file`
- URL: full URL with base
- Special handling for JSON content-type

**Example**:
```bash
curl -X POST \
  http://localhost:5000/api/generate/text2img \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "prompt": "a beautiful sunset",
    "width": 512,
    "height": 512
  }'
```

### Timing Calculation

```javascript
const startTime = performance.now();
const response = await fetch(...);
const endTime = performance.now();
const duration = Math.round(endTime - startTime);
// duration in milliseconds with decimal precision
```

### Data Structure for API Call Log

```javascript
{
    id: 'uuid-or-timestamp',
    timestamp: Date.now(),
    request: {
        method: 'POST',
        url: 'http://localhost:5000/api/generate/text2img',
        headers: { 'Content-Type': 'application/json' },
        body: '{...}', // truncated for display if > 10KB
        bodySize: 1234
    },
    response: {
        status: 202,
        statusText: 'Accepted',
        headers: { 'content-type': 'application/json' },
        body: '{...}', // truncated for display
        bodySize: 567
    },
    timing: {
        startTime: 1234567890,
        duration: 45.2, // milliseconds
        endTime: 1234567935.2
    },
    error: null // or error object if failed
}
```

## Success Criteria

1. All API calls made through `fetchApi()` appear in Inspector history
2. Each entry shows: method, endpoint, status, response time
3. Clicking an entry shows full request/response details
4. Curl command can be copied to clipboard for any request
5. Response times are accurate to millisecond precision
6. History can be cleared with one action
7. Works with existing dark theme UI
8. No console errors during normal operation

## Open Questions

1. Should we include connection check calls to `/health` in the history?
   - Recommendation: Yes, but mark them distinctly (they poll every 5s)
   
2. How should we handle image data in request/response bodies?
   - Recommendation: Show placeholder like `[Base64 image data: 2.3MB]` instead of full data

3. Should we show the full URL or just the endpoint path?
   - Recommendation: Show full URL in details, short path in list

## References

- `api.js` - API communication module (central interception point)
- `forms.js` - Example of request/response display pattern
- `jobs.js` - Module pattern to follow (init, state management, render)
- `index.html` lines 684-693 - Inspector section placeholder
- `styles.css` - JSON display styles (`.json-display`, `.json-toggle`)
- `navigation.js` - Section switching already configured for 'inspector'

## Dependencies

- Phase 6 (Web Client Foundation) - COMPLETE
- Phase 7 (Generation Testing) - COMPLETE (uses fetchApi)
- Phase 8 (Job Monitor) - COMPLETE (uses fetchApi)
- Phase 9 (Model Management) - COMPLETE (uses fetchApi)

All dependencies satisfied. Inspector can intercept all existing API calls.

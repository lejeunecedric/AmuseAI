# Phase 6: Web Client Foundation - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Web client serves static files and connects to API. Runs as separate ASP.NET Core application on port 5001, serves vanilla HTML/CSS/JS with no build step, provides responsive sidebar navigation for accessing generation forms, job monitor, model management, and API inspector.

</domain>

<decisions>
## Implementation Decisions

### Server Architecture
- **Separate ASP.NET Core static file server** (Option B)
- Runs on port 5001 (distinct from API on 5000)
- Clean separation between API and web client
- Uses ASP.NET Core's built-in static file middleware
- Serves files from wwwroot folder

### UI Framework Approach
- **Pure vanilla HTML/CSS/JS** (Option A)
- No build step required
- No external JavaScript frameworks
- No external CSS frameworks (hand-written CSS)
- Modern ES6+ JavaScript
- Fetch API for HTTP requests

### Layout Structure
- **Sidebar navigation with sections** (Option B)
- Fixed left sidebar with navigation links
- Main content area for active section
- Sections: Generate (T2I/I2I/Upscale), Jobs, Models, Inspector
- Responsive: sidebar collapses on mobile

### API Connection
- **Hardcoded localhost:5000** (Option A)
- Simplest approach for local dev tool
- API base URL: `http://localhost:5000`
- No auto-discovery logic needed
- Clear error message if API unavailable

### Port Configuration
- Web client port: 5001 (default, configurable via appsettings.json)
- API port: 5000 (assumed)
- Display connection status indicator

### Claude's Discretion
- Exact CSS styling and color scheme
- Mobile responsive breakpoint values
- JavaScript organization pattern (modules vs single file)
- Error handling UI design
- Loading state indicators

</decisions>

<specifics>
## Specific Ideas

- Developer tool aesthetic — clean, functional, not overly styled
- Dark mode support would be nice (but not required)
- JSON display should be syntax-highlighted
- Image display should show actual generated images inline
- Real-time job updates via polling (2 second interval)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Amuse.API project**: Reference for API endpoint contracts
- **Models (Text2ImgRequest, Img2ImgRequest, etc.)**: Use for form field definitions
- **Job, Model classes**: Use for display structure

### Established Patterns
- **Minimal APIs**: Consistent with existing API project approach
- **In-memory state**: Web client is stateless, all state in API
- **Serilog logging**: Web client should also use structured logging
- **Configuration via appsettings.json**: Same pattern as API

### Integration Points
- Web client connects to API at `http://localhost:5000`
- CORS may need configuration in API to allow web client origin
- API health endpoint (`/health`) used for connection status

</code_context>

<deferred>
## Deferred Ideas

- Auto-discovery of API port (scanning) — not needed for local dev tool
- Configurable API endpoint in UI — can add later if needed
- WebSocket for real-time updates — requirement says polling only
- Authentication — explicitly out of scope per PROJECT.md
- Multi-user support — single dev tool only

</deferred>

---

*Phase: 06-web-client-foundation*
*Context gathered: 2026-03-17*

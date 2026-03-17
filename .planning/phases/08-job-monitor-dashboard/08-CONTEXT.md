# Phase 8: Job Monitor Dashboard - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Real-time monitoring dashboard for the job queue. Displays all jobs in a table with current status, auto-refreshes via polling, allows viewing job details inline, canceling pending/processing jobs, and shows visual status indicators with colors and icons.

</domain>

<decisions>
## Implementation Decisions

### Job List Layout
- **Table view** (Option A)
- Columns: Job ID, Type, Status, Created Time, Actions
- Compact row height for scanning many jobs
- Sortable by time (newest first by default)

### Auto-Refresh Behavior
- **Pause polling when tab hidden** using Page Visibility API (Option B)
- Poll every 2 seconds when Jobs tab is active AND visible
- Resume polling when tab becomes visible again
- Display "Last updated: X seconds ago" indicator
- Manual refresh button available

### Job Detail Display
- **Expand row inline** (accordion style) (Option B)
- Click job row to expand/collapse details
- Expanded view shows: full request params, result (if completed), error (if failed), timestamps
- Image preview inline for completed generation jobs
- Only one job expanded at a time (collapsing others)

### Status Visualization
- **Colors + icons** (Option B)
- Pending: Yellow/amber + hourglass icon
- Processing: Blue + animated spinner icon
- Completed: Green + checkmark icon
- Failed: Red + X icon
- Cancelled: Gray + ban icon
- Status badges with consistent styling

### Cancel Button Behavior
- Show only for Pending and Processing jobs
- Disabled/hidden for Completed, Failed, Cancelled
- Confirmation dialog before canceling
- Update UI immediately on cancel (optimistic)

### Claude's Discretion
- Exact table styling (borders, hover states, row striping)
- Spinner animation implementation
- Timestamp formatting (relative vs absolute)
- Empty state design when no jobs exist
- Error handling for failed API calls

</decisions>

<specifics>
## Specific Ideas

- Table should feel like a monitoring dashboard (Datadog-style clean, functional)
- Show relative timestamps ("2 minutes ago", "just now")
- Include job duration for completed jobs
- Show file size for generated images
- Copy job ID button for each row
- Filter by status (toggle buttons: All | Pending | Processing | Completed | Failed)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- **api.js**: Use fetchApi for GET /api/jobs and DELETE /api/jobs/{id}
- **forms.js**: Similar form patterns can be adapted for job display
- **images.js**: displayGeneratedImage can show job results
- **navigation.js**: Section switching already handles #section-jobs

### Established Patterns
- **Vanilla JS modules**: Create jobs.js module following same pattern
- **Dark theme**: Use existing CSS variables (--color-bg, --color-text, etc.)
- **Polling pattern**: Similar to api.js checkApiConnection, but for jobs list
- **JSON display**: Reuse collapsible JSON viewer from forms

### Integration Points
- Add jobs.js import to app.js
- Add job status polling to app.js (when Jobs tab active)
- Update index.html #section-jobs with table structure
- Extend CSS with table and status badge styles

### API Endpoints to Use
- GET /api/jobs — List all jobs
- GET /api/jobs/{id} — Get specific job (for details)
- DELETE /api/jobs/{id} — Cancel job

</code_context>

<deferred>
## Deferred Ideas

- WebSocket for real-time updates (out of scope — polling only per PROJECT.md)
- Batch operations on multiple jobs (select all, cancel selected)
- Job search/filter by prompt text
- Job persistence across page reloads
- Job history/archiving
- Export job results

</deferred>

---

*Phase: 08-job-monitor-dashboard*
*Context gathered: 2026-03-17*

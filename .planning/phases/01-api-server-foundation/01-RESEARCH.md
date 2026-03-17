# Phase 1: API Server Foundation - Research

**Researched:** 2026-03-17
**Domain:** ASP.NET Core 8 Minimal APIs, Serilog, Configuration Management
**Confidence:** HIGH

## Summary

Phase 1 requires creating a standalone console API server with basic endpoints and configuration management. The project will use ASP.NET Core 8 minimal APIs (not WPF) with Serilog for logging (same as Amuse.UI). Configuration will support appsettings.json with command-line overrides for port, model paths, and device selection. Graceful shutdown is handled natively by WebApplication.

**Primary recommendation:** Create `Amuse.API` console project using `WebApplication.CreateBuilder(args)` pattern with Serilog, reading configuration from appsettings.json and supporting command-line overrides. Reference existing Amuse.UI services via project reference.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Standalone solution (Amuse.API.sln) separate from main Amuse.sln
- Minimal JSON response format — return data directly or simple wrapper
- No consistent envelope (success/error fields)
- JSON error bodies with details (not just HTTP status codes)
- Serilog (same as Amuse.UI) — console sink + file sink
- Console app, not embedded in WPF

### Claude's Discretion
- Project structure details
- Specific endpoint routing conventions

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| API-01 | Server starts as console application on configurable port (default 5000) | ASP.NET Core Kestrel configuration via appsettings.json or --urls command line |
| API-02 | Server responds to health check at GET /health | Minimal API endpoint returning 200 OK |
| API-03 | Server returns API info at GET /api info (version, capabilities) | Minimal API endpoint returning JSON with version/capabilities |
| API-04 | Server graceful shutdown on Ctrl+C or kill signal | WebApplication handles SIGTERM natively |
| CFG-01 | Port configurable via appsettings.json or command line | Multiple configuration sources supported by ASP.NET Core |
| CFG-02 | Model paths configurable (default from existing AmuseSettings) | AmuseSettings.DirectoryModel property |
| CFG-03 | Device (CPU/DirectML) configurable | AmuseSettings.DefaultExecutionDevice and IHardwareSettings |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Microsoft.Extensions.Hosting | 10.0.5 | DI container, application lifetime | Already used in Amuse.UI |
| Serilog.Extensions.Hosting | 10.0.0 | Serilog DI integration | Already used in Amuse.UI |
| Serilog.Settings.Configuration | 10.0.0 | JSON config for Serilog | Already used in Amuse.UI |
| Serilog.Sinks.File | 7.0.0 | File logging | Already used in Amuse.UI |
| Serilog.Sinks.Console | 6.0.0 | Console output | Already used in Amuse.UI |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Serilog.AspNetCore | 10.0.0 | Request logging middleware | For HTTP request logging |
| OnnxStack.Core | 0.60.0 | Core ONNX inference | For sharing model configs |
| OnnxStack.Device | 0.60.0 | Device management | For DirectML/CPU config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Minimal APIs | Controller-based APIs | Minimal APIs have less boilerplate, better for simple endpoints |
| Serilog | Microsoft.Extensions.Logging | Serilog provides structured logging with file sinks (already in use) |
| appsettings.json | Environment variables only | appsettings.json provides defaults, env vars override |

**Installation:**
```bash
# New console project will need:
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Settings.Configuration
dotnet add package Microsoft.Extensions.Hosting
```

## Architecture Patterns

### Recommended Project Structure
```
Amuse.API/
├── Amuse.API.csproj
├── Program.cs              # Entry point with WebApplication setup
├── appsettings.json        # Default configuration
├── appsettings.Development.json
├── Controllers/
│   └── HealthController.cs # GET /health, GET /api/info
├── Services/
│   └── ApiInfoService.cs   # API version/capabilities
├── Models/
│   ├── ApiInfoResponse.cs  # Response models
│   └── HealthResponse.cs
├── Configuration/
│   └── ApiSettings.cs      # Configuration classes
└── Logs/                   # Serilog output (created at runtime)
```

### Pattern 1: WebApplicationBuilder with Serilog
**What:** ASP.NET Core 8 minimal API setup with two-stage Serilog initialization
**When to use:** Console apps that need both early startup logging and full web request logging

**Example:**
```csharp
// Source: https://nblumhardt.com/2024/04/serilog-net8-0-minimal/
// Two-stage bootstrap: first setup Serilog before full app builds
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/api-.txt", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

// Add Serilog with full configuration
builder.Host.UseSerilog((context, loggerConfiguration) => loggerConfiguration
    .ReadFrom.Configuration(context.Configuration)
    .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.Routing", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Amuse.API"));

// Add services
builder.Services.AddSingleton<ApiInfoService>();

var app = builder.Build();

// Map endpoints
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/api/info", (ApiInfoService apiInfo) => apiInfo.GetInfo());

app.Run();
```

### Pattern 2: Port Configuration via appsettings.json + Command Line
**What:** Configure Kestrel listening port with fallback hierarchy
**When to Use:** When port needs to be configurable at runtime

**Example:**
```csharp
// appsettings.json
{
  "Urls": "http://localhost:5000",
  "Logging": {
    "LogLevel": { "Default": "Information" }
  }
}

// Command line override: dotnet run --urls "http://localhost:6000"
// Or environment: ASPNETCORE_URLS="http://localhost:6000"
```

**Source:** https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints

### Pattern 3: Graceful Shutdown
**What:** WebApplication handles SIGTERM (Ctrl+C) automatically
**When to Use:** All production APIs

**Example:**
```csharp
// WebApplication.Run() handles graceful shutdown automatically:
// - Catches SIGTERM (Ctrl+C, kill signal)
// - Stops accepting new requests
// - Waits for in-flight requests to complete
// - Disposes services

var app = builder.Build();
app.MapGet("/health", () => Results.Ok());

// No explicit shutdown code needed - handled by framework
app.Run();
```

### Pattern 4: Reading Custom Configuration Sections
**What:** Bind custom configuration sections in appsettings.json
**When to Use:** API-specific settings beyond port/logging

**Example:**
```csharp
// appsettings.json
{
  "ApiSettings": {
    "DefaultPort": 5000,
    "ModelDirectory": "C:\\Models",
    "Device": "DirectML"
  }
}

// Configuration class
public class ApiSettings
{
    public int DefaultPort { get; set; } = 5000;
    public string ModelDirectory { get; set; } = string.Empty;
    public string Device { get; set; } = "DirectML";
}

// In Program.cs
var builder = WebApplication.CreateBuilder(args);
var apiSettings = builder.Configuration.GetSection("ApiSettings").Get<ApiSettings>();
```

### Pattern 5: JSON Error Responses
**What:** Return structured error JSON instead of plain HTTP status codes
**When to Use:** APIs that need detailed error information

**Example:**
```csharp
// Error response model
public record ApiError(string Message, string? Details = null, Dictionary<string, string>? FieldErrors = null);

// Exception handler
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = new ApiError("Internal server error", "Details here");
        await context.Response.WriteAsJsonAsync(error);
    });
});

// Endpoint-level errors
app.MapGet("/api/info", () =>
{
    try
    {
        // ...
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: ex.Message,
            title: "Failed to get API info",
            statusCode: 500);
    }
});
```

### Anti-Patterns to Avoid
- **Using IWebHostBuilder in .NET 8:** Use WebApplicationBuilder instead — IWebHostBuilder is legacy
- **Missing request logging:** Add Serilog.AspNetCore request middleware for observability
- **No file size limits:** Always set rollingInterval and fileSizeLimitBytes for file logs

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Logging infrastructure | Custom logging with file I/O | Serilog with File sink | Already in use, handles rolling files, structured logging |
| HTTP server | Raw TCP socket server | ASP.NET Core Kestrel | Production-ready, handles HTTP properly |
| Configuration loading | Manual JSON parsing | Microsoft.Extensions.Configuration | Handles env vars, command line, appsettings.json |
| Graceful shutdown | Custom signal handling | WebApplication.Run() | Built-in SIGTERM handling |
| DI container | Manual service instantiation | Microsoft.Extensions.DependencyInjection | Already used in Amuse.UI |

**Key insight:** The existing Amuse.UI codebase already uses all the infrastructure needed. Amuse.API just needs its own configuration and endpoints.

## Common Pitfalls

### Pitfall 1: Port Binding Conflicts
**What goes wrong:** Default port 5000 may conflict with other services (IIS Express, other .NET apps)
**Why it happens:** ASP.NET Core defaults to ports 5000-5300 which may be in use
**How to avoid:** Make port configurable, use environment variable `ASPNETCORE_URLS` or `--urls` command line
**Warning signs:** "Unable to bind to http://localhost:5000" error on startup

### Pitfall 2: Serilog Not Flushing on Shutdown
**What goes wrong:** Log entries lost when application crashes or is terminated
**Why it happens:** Not calling Log.CloseAndFlush() or using async sinks without proper flush
**How to avoid:** Use `Log.CloseAndFlush()` in shutdown handlers or ensure synchronous sinks
**Warning signs:** Missing recent log entries in files after shutdown

### Pitfall 3: CORS Issues in Development
**What goes wrong:** Browser requests blocked when calling API from different origin
**Why it happens:** CORS not configured for cross-origin requests
**How to avoid:** Add CORS policy if frontend will call API (not needed for v1 CLI-only)

### Pitfall 4: Missing appsettings.json in Output
**What goes wrong:** Configuration not found at runtime
**Why it happens:** appsettings.json not set to "Copy to Output Directory"
**How to avoid:** Add to .csproj:
```xml
<ItemGroup>
  <None Update="appsettings.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

## Code Examples

### Basic Console API Server with Health Endpoint
```csharp
// Source: ASP.NET Core 8 minimal API documentation
using Serilog;
using Serilog.Events;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/api-.txt", rollingInterval: RollingInterval.Day)
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Amuse.API...");

    var builder = WebApplication.CreateBuilder(args);
    
    builder.Host.UseSerilog((context, lc) => lc
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext());

    var app = builder.Build();

    // Health check
    app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

    // API Info
    app.MapGet("/api/info", () => Results.Ok(new 
    {
        version = "1.0.0",
        name = "AmuseAI API",
        capabilities = new[] { "text2img", "img2img", "upscale", "models" }
    }));

    Log.Information("Amuse.API started on {Urls}", string.Join(", ", builder.WebHost.GetSetting("urls") ?? "default"));
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

### Configuration with Device and Model Path
```csharp
// appsettings.json
{
  "Urls": "http://localhost:5000",
  "ApiSettings": {
    "ModelDirectory": "C:\\ProgramData\\AmuseAI\\Models",
    "Device": "DirectML"
  },
  "Serilog": {
    "MinimumLevel": { "Default": "Information" },
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "File", "Args": { "path": "Logs/api-.txt", "rollingInterval": "Day" } }
    ]
  }
}

// ApiSettings.cs
public class ApiSettings
{
    public string ModelDirectory { get; set; } = string.Empty;
    public string Device { get; set; } = "DirectML";
}

// Usage in Program.cs
var builder = WebApplication.CreateBuilder(args);
var apiSettings = builder.Configuration.GetSection("ApiSettings").Get<ApiSettings>();

// Pass to services that need it
builder.Services.AddSingleton(apiSettings);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| IWebHostBuilder | WebApplicationBuilder | .NET 6 | Simpler setup for minimal APIs |
| Console.WriteLine logging | Serilog structured logging | Pre-existing | Consistent with Amuse.UI |
| Hardcoded config | appsettings.json + env vars | Pre-existing | Aligns with Amuse.UI |
| Manual DI | Microsoft.Extensions.DependencyInjection | Pre-existing | Same as Amuse.UI |

**Deprecated/outdated:**
- None relevant — using current .NET 8 patterns

## Open Questions

1. **Should Amuse.API share Amuse.UI settings or have separate settings?**
   - What we know: AmuseSettings already handles model paths and device config
   - What's unclear: Should API read same settings file or have its own?
   - Recommendation: Use same settings location for consistency, but allow override via API-specific appsettings.json

2. **What version string should /api/info return?**
   - What we know: Amuse.UI uses version 3.1.9
   - What's unclear: Should API version match or be independent?
   - Recommendation: Use same version for consistency (3.1.9)

3. **Should API run on same machine or be network-accessible?**
   - What we know: Local-only for v1 per requirements
   - What's unclear: Binding to localhost vs all interfaces
   - Recommendation: Default to localhost (127.0.0.1) for security, document how to bind to all interfaces if needed

## Validation Architecture

> Included since workflow.nyquist_validation is enabled in .planning/config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | xUnit + Microsoft.AspNetCore.Mvc.Testing |
| Config file | `Amuse.API.Tests/xunit.runner.json` (default) |
| Quick run command | `dotnet test --filter "API-01|API-02|API-03|API-04|CFG-01|CFG-02|CFG-03" --no-build` |
| Full suite command | `dotnet test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | Server starts on configurable port | Integration | Test Kestrel binding to port | ❌ Wave 0 |
| API-02 | GET /health returns 200 OK | Integration | HTTP GET /health | ❌ Wave 0 |
| API-03 | GET /api/info returns version/capabilities | Integration | HTTP GET /api/info | ❌ Wave 0 |
| API-04 | Graceful shutdown on SIGTERM | Integration | Send SIGTERM, verify clean shutdown | ❌ Wave 0 |
| CFG-01 | Port configurable via appsettings.json | Unit | Verify config binding | ❌ Wave 0 |
| CFG-02 | Model paths configurable | Unit | Verify config binding | ❌ Wave 0 |
| CFG-03 | Device configurable | Unit | Verify config binding | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** N/A for foundation phase
- **Per wave merge:** Full integration tests
- **Phase gate:** All integration tests pass before /gsd-verify-work

### Wave 0 Gaps
- [ ] `tests/Amuse.API.Tests/` — directory for API tests
- [ ] `tests/Amuse.API.Tests/Amuse.API.Tests.csproj` — test project
- [ ] `tests/Amuse.API.Tests/Integration/HealthEndpointTests.cs` — covers API-01, API-02
- [ ] `tests/Amuse.API.Tests/Integration/ApiInfoEndpointTests.cs` — covers API-03
- [ ] `tests/Amuse.API.Tests/Integration/ShutdownTests.cs` — covers API-04
- [ ] `tests/Amuse.API.Tests/Unit/ConfigurationTests.cs` — covers CFG-01, CFG-02, CFG-03

## Sources

### Primary (HIGH confidence)
- https://nblumhardt.com/2024/04/serilog-net8-0-minimal/ - Serilog configuration with minimal APIs
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints - Kestrel endpoint configuration
- https://andrewlock.net/8-ways-to-set-the-urls-for-an-aspnetcore-app/ - Port configuration methods
- Amuse.UI/App.xaml.cs - Existing Serilog and DI setup (lines 134-138)

### Secondary (MEDIUM confidence)
- https://codewithmukesh.com/blog/structured-logging-with-serilog-in-aspnet-core/ - Serilog sinks and configuration
- https://www.roundthecode.com/dotnet-tutorials/file-logging-aspnet-core-made-easy-serilog - File logging setup

### Tertiary (LOW confidence)
- None needed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing Amuse.UI dependencies and patterns
- Architecture: HIGH - ASP.NET Core 8 minimal APIs are well-documented and stable
- Pitfalls: HIGH - Common issues documented in official docs and community

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (30 days for stable .NET 8 patterns)

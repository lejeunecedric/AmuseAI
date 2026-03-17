using Serilog;
using Serilog.Events;
using Amuse.API.Models;
using Amuse.API.Services;
using System.Drawing;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.Routing", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("Logs/api-.txt", rollingInterval: RollingInterval.Day, outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Amuse.API...");

    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container.
    builder.Services.AddScoped<StableDiffusionService>();
    builder.Services.AddSingleton<ModelManagementService>();
    builder.Services.AddHostedService<JobQueueService>();

    builder.Host.UseSerilog((context, loggerConfiguration) => loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Amuse.API"));

    var app = builder.Build();

    // GET /health - returns health status
    app.MapGet("/health", () => Results.Ok(new 
    { 
        status = "healthy", 
        timestamp = DateTime.UtcNow 
    }));

    // GET /api/info - returns API version and capabilities
    app.MapGet("/api/info", () => Results.Ok(new 
    { 
        version = "1.0.0", 
        name = "AmuseAI API",
        capabilities = new[] { "text2img", "img2img", "upscale", "models", "jobs" }
    }));

    // POST /api/generate/text2img - creates a job to generate image from text prompt
    app.MapPost("/api/generate/text2img", async (Text2ImgRequest request, JobQueueService jobQueueService) =>
    {
        try
        {
            if (!request.Prompt?.Trim()?.Any() ?? true)
            {
                return Results.BadRequest(new { error = "Prompt is required" });
            }

            // Validate width and height
            if (request.Width < 512 || request.Width > 1024 || request.Height < 512 || request.Height > 1024)
            {
                return Results.BadRequest(new { error = "Width and height must be between 512 and 1024 pixels" });
            }

            // Validate steps
            if (request.Steps < 1 || request.Steps > 100)
            {
                return Results.BadRequest(new { error = "Steps must be between 1 and 100" });
            }

            // Validate guidance scale
            if (request.GuidanceScale < 0.0f || request.GuidanceScale > 20.0f)
            {
                return Results.BadRequest(new { error = "Guidance scale must be between 0.0 and 20.0" });
            }

            // Create a job and return immediately with job ID
            var job = await jobQueueService.CreateJobAsync("text2img", request);

            return Results.Accepted($"/api/jobs/{job.Id}", new
            {
                jobId = job.Id,
                status = job.Status.ToString().ToLower(),
                message = "Job created successfully",
                checkStatusAt = $"/api/jobs/{job.Id}"
            });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error creating text2img job");
            return Results.StatusCode(500);
        }
    });

    // POST /api/generate/img2img - creates a job to transform an input image
    app.MapPost("/api/generate/img2img", async (Img2ImgRequest request, JobQueueService jobQueueService) =>
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return Results.BadRequest(new { error = "Prompt is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Image))
            {
                return Results.BadRequest(new { error = "Image is required (Base64 encoded)" });
            }

            // Validate width and height
            if (request.Width < 512 || request.Width > 1024 || request.Height < 512 || request.Height > 1024)
            {
                return Results.BadRequest(new { error = "Width and height must be between 512 and 1024 pixels" });
            }

            // Validate steps
            if (request.Steps < 1 || request.Steps > 100)
            {
                return Results.BadRequest(new { error = "Steps must be between 1 and 100" });
            }

            // Validate guidance scale
            if (request.GuidanceScale < 0.0f || request.GuidanceScale > 20.0f)
            {
                return Results.BadRequest(new { error = "Guidance scale must be between 0.0 and 20.0" });
            }

            // Validate strength
            if (request.Strength < 0.0f || request.Strength > 1.0f)
            {
                return Results.BadRequest(new { error = "Strength must be between 0.0 and 1.0" });
            }

            // Create a job and return immediately with job ID
            var job = await jobQueueService.CreateJobAsync("img2img", request);

            return Results.Accepted($"/api/jobs/{job.Id}", new
            {
                jobId = job.Id,
                status = job.Status.ToString().ToLower(),
                message = "Job created successfully",
                checkStatusAt = $"/api/jobs/{job.Id}"
            });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error creating img2img job");
            return Results.StatusCode(500);
        }
    });

    // POST /api/upscale - creates a job to upscale an input image
    app.MapPost("/api/upscale", async (UpscaleRequest request, JobQueueService jobQueueService) =>
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Image))
            {
                return Results.BadRequest(new { error = "Image is required (Base64 encoded)" });
            }

            // Validate scale
            if (request.Scale != 2 && request.Scale != 4)
            {
                return Results.BadRequest(new { error = "Scale must be 2 or 4" });
            }

            // Create a job and return immediately with job ID
            var job = await jobQueueService.CreateJobAsync("upscale", request);

            return Results.Accepted($"/api/jobs/{job.Id}", new
            {
                jobId = job.Id,
                status = job.Status.ToString().ToLower(),
                message = "Job created successfully",
                checkStatusAt = $"/api/jobs/{job.Id}"
            });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error creating upscale job");
            return Results.StatusCode(500);
        }
    });

    // GET /api/models - returns list of available models
    app.MapGet("/api/models", async (ModelManagementService modelService) =>
    {
        try
        {
            var models = await modelService.GetAllModelsAsync();
            return Results.Ok(new { models });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error retrieving models");
            return Results.StatusCode(500);
        }
    });

    // GET /api/models/{id} - returns specific model details
    app.MapGet("/api/models/{id}", async (string id, ModelManagementService modelService) =>
    {
        try
        {
            var model = await modelService.GetModelAsync(id);
            
            if (model == null)
            {
                return Results.NotFound(new { error = $"Model '{id}' not found" });
            }

            return Results.Ok(model);
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error retrieving model {ModelId}", id);
            return Results.StatusCode(500);
        }
    });

    // GET /api/models/loaded - returns currently loaded models
    app.MapGet("/api/models/loaded", async (ModelManagementService modelService) =>
    {
        try
        {
            var models = await modelService.GetLoadedModelsAsync();
            return Results.Ok(new { models });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error retrieving loaded models");
            return Results.StatusCode(500);
        }
    });

    // POST /api/models/{id}/load - loads a model into memory
    app.MapPost("/api/models/{id}/load", async (string id, ModelManagementService modelService) =>
    {
        try
        {
            var model = await modelService.GetModelAsync(id);
            
            if (model == null)
            {
                return Results.NotFound(new { error = $"Model '{id}' not found" });
            }

            var success = await modelService.LoadModelAsync(id);
            
            if (success)
            {
                return Results.Ok(new { message = $"Model '{id}' loaded successfully", modelId = id });
            }
            else
            {
                return Results.Json(new { error = $"Failed to load model '{id}'" }, statusCode: 500);
            }
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error loading model {ModelId}", id);
            return Results.StatusCode(500);
        }
    });

    // POST /api/models/{id}/unload - unloads a model from memory
    app.MapPost("/api/models/{id}/unload", async (string id, ModelManagementService modelService) =>
    {
        try
        {
            var model = await modelService.GetModelAsync(id);
            
            if (model == null)
            {
                return Results.NotFound(new { error = $"Model '{id}' not found" });
            }

            var success = await modelService.UnloadModelAsync(id);
            
            if (success)
            {
                return Results.Ok(new { message = $"Model '{id}' unloaded successfully", modelId = id });
            }
            else
            {
                return Results.BadRequest(new { error = $"Model '{id}' is not loaded" });
            }
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error unloading model {ModelId}", id);
            return Results.StatusCode(500);
        }
    });

    // GET /api/jobs - returns list of all jobs
    app.MapGet("/api/jobs", async (JobQueueService jobQueueService) =>
    {
        try
        {
            var jobs = await jobQueueService.GetAllJobsAsync();
            return Results.Ok(new { jobs });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error retrieving jobs");
            return Results.StatusCode(500);
        }
    });

    // GET /api/jobs/{id} - returns specific job details
    app.MapGet("/api/jobs/{id}", async (string id, JobQueueService jobQueueService) =>
    {
        try
        {
            var job = await jobQueueService.GetJobAsync(id);

            if (job == null)
            {
                return Results.NotFound(new { error = $"Job '{id}' not found" });
            }

            return Results.Ok(job);
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error retrieving job {JobId}", id);
            return Results.StatusCode(500);
        }
    });

    // DELETE /api/jobs/{id} - cancels a job
    app.MapDelete("/api/jobs/{id}", async (string id, JobQueueService jobQueueService) =>
    {
        try
        {
            var success = await jobQueueService.CancelJobAsync(id);

            if (!success)
            {
                return Results.BadRequest(new { error = $"Job '{id}' not found or cannot be cancelled" });
            }

            return Results.Ok(new { message = $"Job '{id}' cancelled successfully", jobId = id });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error cancelling job {JobId}", id);
            return Results.StatusCode(500);
        }
    });

    var urls = builder.WebHost.GetSetting("urls") ?? "http://localhost:5000";
    Log.Information("Amuse.API listening on {Urls}", urls);

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.Information("Amuse.API shutting down...");
    Log.CloseAndFlush();
}

// Make Program class public for testing
public partial class Program { }


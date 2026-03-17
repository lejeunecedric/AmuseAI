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
        capabilities = new[] { "text2img", "img2img", "upscale", "models" }
    }));

    // POST /api/generate/text2img - generates image from text prompt
    app.MapPost("/api/generate/text2img", async (Text2ImgRequest request, StableDiffusionService stableDiffusionService) =>
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

            // Generate the image
            var base64Image = await stableDiffusionService.GenerateAsync(request);

            return Results.Ok(new { image = base64Image });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error generating image");
            return Results.StatusCode(500);
        }
    });

    // POST /api/generate/img2img - transforms an input image based on a prompt
    app.MapPost("/api/generate/img2img", async (Img2ImgRequest request, StableDiffusionService stableDiffusionService) =>
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

            // Transform the image
            var base64Image = await stableDiffusionService.Img2ImgAsync(request);

            return Results.Ok(new { image = base64Image });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error transforming image");
            return Results.StatusCode(500);
        }
    });

    // POST /api/upscale - upscales an input image
    app.MapPost("/api/upscale", async (UpscaleRequest request, StableDiffusionService stableDiffusionService) =>
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

            // Upscale the image
            var base64Image = await stableDiffusionService.UpscaleAsync(request);

            return Results.Ok(new { image = base64Image, scale = request.Scale });
        }
        catch (System.ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
        catch (System.Exception ex)
        {
            Log.Error(ex, "Error upscaling image");
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


using Serilog;
using Serilog.Events;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore.Hosting", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.Routing", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("Logs/web-.txt", rollingInterval: RollingInterval.Day, outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Amuse.Web...");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, loggerConfiguration) => loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Amuse.Web"));

    var app = builder.Build();

    // Enable default files (serves index.html for root requests)
    app.UseDefaultFiles();
    
    // Enable static file serving from wwwroot
    app.UseStaticFiles();

    // Health check endpoint for the web client itself
    app.MapGet("/health", () => Results.Ok(new 
    { 
        status = "healthy", 
        service = "Amuse.Web",
        timestamp = DateTime.UtcNow 
    }));

    var urls = builder.WebHost.GetSetting("urls") ?? "http://localhost:5001";
    Log.Information("Amuse.Web listening on {Urls}", urls);
    Log.Information("API should be running on {ApiUrl}", builder.Configuration["ApiSettings:BaseUrl"] ?? "http://localhost:5000");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.Information("Amuse.Web shutting down...");
    Log.CloseAndFlush();
}

// Make Program class public for testing
public partial class Program { }

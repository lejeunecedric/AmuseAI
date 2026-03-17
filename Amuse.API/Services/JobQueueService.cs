using Amuse.API.Models;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace Amuse.API.Services
{
    /// <summary>
    /// Service for managing async job queue for image generation
    /// </summary>
    public class JobQueueService : BackgroundService
    {
        private readonly ILogger<JobQueueService> _logger;
        private readonly ConcurrentDictionary<string, Job> _jobs;
        private readonly ConcurrentQueue<Job> _pendingJobs;
        private readonly StableDiffusionService _stableDiffusionService;

        public JobQueueService(
            ILogger<JobQueueService> logger,
            StableDiffusionService stableDiffusionService)
        {
            _logger = logger;
            _stableDiffusionService = stableDiffusionService;
            _jobs = new ConcurrentDictionary<string, Job>();
            _pendingJobs = new ConcurrentQueue<Job>();
        }

        /// <summary>
        /// Create a new job and add it to the queue
        /// </summary>
        public Task<Job> CreateJobAsync(string type, object request)
        {
            var job = new Job
            {
                Type = type,
                Request = request,
                Status = JobStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Progress = 0
            };

            _jobs[job.Id] = job;
            _pendingJobs.Enqueue(job);

            _logger.LogInformation("Created job {JobId} of type {JobType}", job.Id, type);

            return Task.FromResult(job);
        }

        /// <summary>
        /// Get all jobs
        /// </summary>
        public Task<IEnumerable<Job>> GetAllJobsAsync()
        {
            return Task.FromResult(_jobs.Values.OrderByDescending(j => j.CreatedAt).AsEnumerable());
        }

        /// <summary>
        /// Get a specific job by ID
        /// </summary>
        public Task<Job?> GetJobAsync(string id)
        {
            _jobs.TryGetValue(id, out var job);
            return Task.FromResult(job);
        }

        /// <summary>
        /// Cancel a pending or processing job
        /// </summary>
        public Task<bool> CancelJobAsync(string id)
        {
            if (!_jobs.TryGetValue(id, out var job))
            {
                return Task.FromResult(false);
            }

            if (job.Status == JobStatus.Completed || job.Status == JobStatus.Failed)
            {
                // Cannot cancel completed/failed jobs
                return Task.FromResult(false);
            }

            job.Status = JobStatus.Cancelled;
            job.CompletedAt = DateTime.UtcNow;
            job.Progress = 0;

            _logger.LogInformation("Cancelled job {JobId}", id);

            return Task.FromResult(true);
        }

        /// <summary>
        /// Background processing loop
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Job queue service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (_pendingJobs.TryDequeue(out var job))
                    {
                        await ProcessJobAsync(job, stoppingToken);
                    }
                    else
                    {
                        // No pending jobs, wait a bit before checking again
                        await Task.Delay(100, stoppingToken);
                    }
                }
                catch (OperationCanceledException)
                {
                    // Normal shutdown
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in job queue processing loop");
                }
            }

            _logger.LogInformation("Job queue service stopped");
        }

        /// <summary>
        /// Process a single job
        /// </summary>
        private async Task ProcessJobAsync(Job job, CancellationToken cancellationToken)
        {
            if (job.Status == JobStatus.Cancelled)
            {
                _logger.LogInformation("Skipping cancelled job {JobId}", job.Id);
                return;
            }

            try
            {
                _logger.LogInformation("Processing job {JobId} of type {JobType}", job.Id, job.Type);

                job.Status = JobStatus.Processing;
                job.StartedAt = DateTime.UtcNow;

                object? result = null;

                // Process based on job type
                switch (job.Type)
                {
                    case "text2img":
                        if (job.Request is Text2ImgRequest text2ImgRequest)
                        {
                            result = await _stableDiffusionService.GenerateAsync(text2ImgRequest);
                        }
                        break;

                    case "img2img":
                        if (job.Request is Img2ImgRequest img2ImgRequest)
                        {
                            result = await _stableDiffusionService.Img2ImgAsync(img2ImgRequest);
                        }
                        break;

                    case "upscale":
                        if (job.Request is UpscaleRequest upscaleRequest)
                        {
                            result = await _stableDiffusionService.UpscaleAsync(upscaleRequest);
                        }
                        break;

                    default:
                        throw new InvalidOperationException($"Unknown job type: {job.Type}");
                }

                // Check if job was cancelled during processing
                if (job.Status == JobStatus.Cancelled)
                {
                    _logger.LogInformation("Job {JobId} was cancelled during processing", job.Id);
                    return;
                }

                job.Status = JobStatus.Completed;
                job.Progress = 100;
                job.Result = new { image = result };
                job.CompletedAt = DateTime.UtcNow;

                _logger.LogInformation("Completed job {JobId}", job.Id);
            }
            catch (Exception ex)
            {
                if (job.Status != JobStatus.Cancelled)
                {
                    job.Status = JobStatus.Failed;
                    job.Error = ex.Message;
                    job.CompletedAt = DateTime.UtcNow;

                    _logger.LogError(ex, "Failed to process job {JobId}", job.Id);
                }
            }
        }
    }
}

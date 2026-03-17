namespace Amuse.API.Models
{
    /// <summary>
    /// Status of a job in the queue
    /// </summary>
    public enum JobStatus
    {
        Pending,
        Processing,
        Completed,
        Failed,
        Cancelled
    }

    /// <summary>
    /// Represents an async job for image generation or processing
    /// </summary>
    public class Job
    {
        /// <summary>
        /// Unique identifier for the job
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        /// <summary>
        /// Type of job (text2img, img2img, upscale)
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Current status of the job
        /// </summary>
        public JobStatus Status { get; set; } = JobStatus.Pending;

        /// <summary>
        /// When the job was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the job started processing
        /// </summary>
        public DateTime? StartedAt { get; set; }

        /// <summary>
        /// When the job completed, failed, or was cancelled
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        /// <summary>
        /// Progress percentage (0-100)
        /// </summary>
        public int Progress { get; set; } = 0;

        /// <summary>
        /// Result data (e.g., Base64 image for completed jobs)
        /// </summary>
        public object? Result { get; set; }

        /// <summary>
        /// Error message if job failed
        /// </summary>
        public string? Error { get; set; }

        /// <summary>
        /// The request data that created this job
        /// </summary>
        public object? Request { get; set; }
    }
}

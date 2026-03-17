namespace Amuse.API.Models
{
    /// <summary>
    /// Represents an AI model available for use
    /// </summary>
    public class Model
    {
        /// <summary>
        /// Unique identifier for the model
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Display name of the model
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Model type (e.g., StableDiffusion, Upscaler)
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Path to the model file or directory
        /// </summary>
        public string Path { get; set; } = string.Empty;

        /// <summary>
        /// Model format (e.g., ONNX, Safetensors)
        /// </summary>
        public string Format { get; set; } = string.Empty;

        /// <summary>
        /// Model size in bytes
        /// </summary>
        public long Size { get; set; }

        /// <summary>
        /// Description of the model
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Whether the model is currently loaded in memory
        /// </summary>
        public bool IsLoaded { get; set; }

        /// <summary>
        /// When the model was loaded (if loaded)
        /// </summary>
        public DateTime? LoadedAt { get; set; }

        /// <summary>
        /// Memory usage in bytes when loaded
        /// </summary>
        public long? MemoryUsage { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace Amuse.API.Models
{
    /// <summary>
    /// Request model for image-to-image generation
    /// </summary>
    public class Img2ImgRequest
    {
        [Required]
        public string Prompt { get; set; } = string.Empty;

        public string? NegativePrompt { get; set; }

        /// <summary>
        /// Base64-encoded input image
        /// </summary>
        [Required]
        public string Image { get; set; } = string.Empty;

        /// <summary>
        /// Strength of transformation (0.0-1.0). Higher means more transformation.
        /// </summary>
        [Range(0.0f, 1.0f)]
        public float Strength { get; set; } = 0.75f;

        [Range(512, 1024)]
        public int Width { get; set; } = 512;

        [Range(512, 1024)]
        public int Height { get; set; } = 512;

        [Range(1, 100)]
        public int Steps { get; set; } = 20;

        [Range(0.0f, 20.0f)]
        public float GuidanceScale { get; set; } = 7.5f;

        public int? Seed { get; set; }
    }
}

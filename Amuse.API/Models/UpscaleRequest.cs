using System.ComponentModel.DataAnnotations;

namespace Amuse.API.Models
{
    /// <summary>
    /// Request model for image upscaling
    /// </summary>
    public class UpscaleRequest
    {
        /// <summary>
        /// Base64-encoded input image
        /// </summary>
        [Required]
        public string Image { get; set; } = string.Empty;

        /// <summary>
        /// Upscale factor (2x or 4x)
        /// </summary>
        [Range(2, 4)]
        public int Scale { get; set; } = 2;

        /// <summary>
        /// Whether to use tile mode for processing large images
        /// </summary>
        public bool TileMode { get; set; } = false;
    }
}

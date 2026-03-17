using System.ComponentModel.DataAnnotations;

namespace Amuse.API.Models
{
    public class Text2ImgRequest
    {
        [Required]
        public string Prompt { get; set; } = string.Empty;

        public string? NegativePrompt { get; set; }

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
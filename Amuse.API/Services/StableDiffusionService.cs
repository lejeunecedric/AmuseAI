using Amuse.API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Threading.Tasks;

namespace Amuse.API.Services
{
    public class StableDiffusionService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<StableDiffusionService> _logger;

        public StableDiffusionService(IConfiguration configuration, ILogger<StableDiffusionService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            // For now, we are not actually loading the model. This is a placeholder.
            // In a later phase, we will integrate with the OnnxStack to generate images.
        }

        public async Task<string> GenerateAsync(Text2ImgRequest request)
        {
            // Validate the request (though validation should be done by the API controller)
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                throw new ArgumentException("Prompt is required", nameof(request.Prompt));
            }

            // For now, generate a placeholder image (a small 10x10 red square)
            // In a real implementation, we would use the Stable Diffusion model to generate the image.
            using var bitmap = new Bitmap(request.Width, request.Height);
            using var graphics = Graphics.FromImage(bitmap);
            graphics.Clear(Color.Red); // Red color as placeholder

            // Convert the image to Base64 string
            using var ms = new MemoryStream();
            bitmap.Save(ms, ImageFormat.Png);
            var base64 = Convert.ToBase64String(ms.ToArray());

            return base64;
        }

        public async Task<string> Img2ImgAsync(Img2ImgRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                throw new ArgumentException("Prompt is required", nameof(request.Prompt));
            }

            if (string.IsNullOrWhiteSpace(request.Image))
            {
                throw new ArgumentException("Image is required", nameof(request.Image));
            }

            try
            {
                // Decode the input image from Base64
                byte[] imageBytes = Convert.FromBase64String(request.Image);

                // Load the input image (placeholder - will decode for real in actual implementation)
                // For now, we'll just return a placeholder result
                _logger.LogInformation("Processing img2img request with strength {Strength}", request.Strength);

                // Placeholder: return a blue image to distinguish from text2img
                using var bitmap = new Bitmap(request.Width, request.Height);
                using var graphics = Graphics.FromImage(bitmap);
                graphics.Clear(Color.Blue); // Blue color as placeholder for img2img

                // Convert the image to Base64 string
                using var ms = new MemoryStream();
                bitmap.Save(ms, ImageFormat.Png);
                var base64 = Convert.ToBase64String(ms.ToArray());

                return base64;
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "Invalid Base64 image data provided");
                throw new ArgumentException("Invalid Base64 image data", nameof(request.Image), ex);
            }
        }

        public async Task<string> UpscaleAsync(UpscaleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Image))
            {
                throw new ArgumentException("Image is required", nameof(request.Image));
            }

            if (request.Scale != 2 && request.Scale != 4)
            {
                throw new ArgumentException("Scale must be 2 or 4", nameof(request.Scale));
            }

            try
            {
                // Decode the input image from Base64
                byte[] imageBytes = Convert.FromBase64String(request.Image);

                _logger.LogInformation("Processing upscale request with scale {Scale}x, tile mode: {TileMode}",
                    request.Scale, request.TileMode);

                // Placeholder: return a green image scaled up
                // In actual implementation, we'd use the real upscaling model
                int scaledWidth = 512 * request.Scale;
                int scaledHeight = 512 * request.Scale;

                using var bitmap = new Bitmap(scaledWidth, scaledHeight);
                using var graphics = Graphics.FromImage(bitmap);
                graphics.Clear(Color.Green); // Green color as placeholder for upscale

                // Convert the image to Base64 string
                using var ms = new MemoryStream();
                bitmap.Save(ms, ImageFormat.Png);
                var base64 = Convert.ToBase64String(ms.ToArray());

                return base64;
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "Invalid Base64 image data provided");
                throw new ArgumentException("Invalid Base64 image data", nameof(request.Image), ex);
            }
        }
    }
}
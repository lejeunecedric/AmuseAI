using Amuse.API.Models;
using Microsoft.Extensions.Configuration;
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

        public StableDiffusionService(IConfiguration configuration)
        {
            _configuration = configuration;
            // For now, we are not actually loading the model. This is a placeholder.
            // In a later phase, we will integrate with the OnnxStack to generate images.
        }

        public async Task<string> GenerateAsync(Text2ImgRequest request)
        {
            // Validate the request (though validation should be done by the API controller)
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                throw new System.ArgumentException("Prompt is required", nameof(request.Prompt));
            }

            // For now, generate a placeholder image (a small 10x10 red square)
            // In a real implementation, we would use the Stable Diffusion model to generate the image.
            using var bitmap = new Bitmap(10, 10);
            using var graphics = Graphics.FromImage(bitmap);
            graphics.Clear(Color.Red); // Red color as placeholder

            // Convert the image to Base64 string
            using var ms = new MemoryStream();
            bitmap.Save(ms, ImageFormat.Png);
            var base64 = Convert.ToBase64String(ms.ToArray());

            return base64;
        }
    }
}
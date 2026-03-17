using Amuse.API.Models;
using Microsoft.Extensions.Configuration;
using OnnxStack.StableDiffusion;
using OnnxStack.StableDiffusion.Config;
using OnnxStack.StableDiffusion.Enums;
using System.IO;
using System.Threading.Tasks;

namespace Amuse.API.Services
{
    public class StableDiffusionService
    {
        private readonly IConfiguration _configuration;
        private readonly StableDiffusionGenerator _generator;

        public StableDiffusionService(IConfiguration configuration)
        {
            _configuration = configuration;
            // Initialize the stable diffusion generator with settings from configuration
            var modelPath = _configuration.GetValue<string>("StableDiffusionModelPath");
            var deviceId = _configuration.GetValue<int>("DefaultExecutionDeviceId");
            var provider = _configuration.GetValue<string>("DefaultExecutionProvider");

            // For simplicity, we assume the model is already loaded and available.
            // In a real scenario, we might use a model cache service similar to the UI.
            // Since we are following the UI patterns, we note that the UI uses ModelFactory.
            // However, in the API we don't have direct access to Amuse.UI.Services.ModelFactory
            // without adding a project reference. For now, we'll create a simplified version
            // that loads the model directly. In a later phase, we can introduce a shared service.

            // This is a placeholder for the actual model loading logic.
            // We'll create a generator that can be used for text-to-image.
            _generator = new StableDiffusionGenerator();
            // Note: The actual initialization would require loading the model, scheduler, etc.
            // This is simplified for the purpose of the plan.
        }

        public async Task<string> GenerateAsync(Text2ImgRequest request)
        {
            // Validate the request (though validation should be done by the API controller)
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                throw new System.ArgumentException("Prompt is required", nameof(request.Prompt));
            }

            // Prepare the generation options based on the request
            var options = new StableDiffusionGeneratorOptions
            {
                Prompt = request.Prompt,
                NegativePrompt = request.NegativePrompt ?? string.Empty,
                Width = request.Width,
                Height = request.Height,
                NumInferenceSteps = request.Steps,
                GuidanceScale = request.GuidanceScale,
                Seed = request.Seed
            };

            // Generate the image
            var result = await _generator.GenerateImageAsync(options);

            // Convert the image to Base64 string
            using var ms = new System.IO.MemoryStream();
            result.Image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            var base64 = System.Convert.ToBase64String(ms.ToArray());

            return base64;
        }
    }
}
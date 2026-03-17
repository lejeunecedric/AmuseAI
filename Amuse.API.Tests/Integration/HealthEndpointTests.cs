using System.Net;
using Xunit;

namespace Amuse.API.Tests.Integration;

public class HealthEndpointTests
{
    [Fact]
    public async Task Health_ReturnsOk()
    {
        // Arrange
        var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        
        // Act
        var response = await client.GetAsync("/health");
        
        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
    
    [Fact]
    public async Task Health_ReturnsHealthyStatus()
    {
        // Arrange
        var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        
        // Act
        var response = await client.GetAsync("/health");
        var content = await response.Content.ReadAsStringAsync();
        
        // Assert
        Assert.Contains("healthy", content, StringComparison.OrdinalIgnoreCase);
    }
}

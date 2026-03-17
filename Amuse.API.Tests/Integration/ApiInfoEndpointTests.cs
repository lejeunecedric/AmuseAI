using System.Net;
using System.Text.Json;
using Xunit;

namespace Amuse.API.Tests.Integration;

public class ApiInfoEndpointTests
{
    [Fact]
    public async Task ApiInfo_ReturnsOk()
    {
        // Arrange
        var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        
        // Act
        var response = await client.GetAsync("/api/info");
        
        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
    
    [Fact]
    public async Task ApiInfo_ReturnsVersion()
    {
        // Arrange
        var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        
        // Act
        var response = await client.GetAsync("/api/info");
        var content = await response.Content.ReadAsStringAsync();
        
        // Assert
        Assert.Contains("version", content, StringComparison.OrdinalIgnoreCase);
    }
    
    [Fact]
    public async Task ApiInfo_ReturnsCapabilities()
    {
        // Arrange
        var client = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
        
        // Act
        var response = await client.GetAsync("/api/info");
        var content = await response.Content.ReadAsStringAsync();
        
        // Assert
        Assert.Contains("capabilities", content, StringComparison.OrdinalIgnoreCase);
    }
}

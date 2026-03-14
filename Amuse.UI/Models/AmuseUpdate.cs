using System;
using System.Text.Json.Serialization;

namespace Amuse.UI.Models
{
    public record AppUpdate
    {
        private readonly AppVersion _version;
        private readonly AppAsset _asset;

        public AppUpdate(AppVersion version, AppAsset asset)
        {
            _asset = asset;
            _version = version;
        }

        public string Version => _version.Version;
        public string Link => _version.Link;
        public string Name => _asset.Name;
        public string DownloadLink => _asset.DownloadLink;
        public double DownloadSize => _asset.DownloadSize;
    }

    public record AppVersion
    {
        [JsonPropertyName("tag_name")]
        public string Version { get; set; }

        [JsonPropertyName("html_url")]
        public string Link { get; set; }

        [JsonPropertyName("assets")]
        public AppAsset[] Assets { get; set; }
    }

    public record AppAsset
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("size")]
        public long Size { get; set; }

        public double DownloadSize => Size == 0 ? 0 : (Size / 1024.0 / 1024.0 / 1024.0);

        [JsonPropertyName("created_at")]
        public DateTime Created { get; set; }

        [JsonPropertyName("browser_download_url")]
        public string DownloadLink { get; set; }
    }
}

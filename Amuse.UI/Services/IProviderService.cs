using Amuse.UI.Enums;
using OnnxStack.Core.Model;

namespace Amuse.UI.Services
{
    public interface IProviderService
    {
        OnnxExecutionProvider GetProvider(ExecutionProvider? provider, int? deviceId);
    }
}

using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace Trazos.UI.Internal;

internal static class TrazosModule
{
    public static ValueTask<IJSObjectReference> ImportAsync(IJSRuntime js) =>
        js.InvokeAsync<IJSObjectReference>("import", "./_content/Trazos.UI/trazos.js");
}

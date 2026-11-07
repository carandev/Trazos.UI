using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>Lets keyboard users jump past the navigation. It stays out of view until focused.</summary>
public partial class SkipLink
{
    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    [Inject]
    private NavigationManager Navigation { get; set; } = null!;

    /// <summary>The fragment of the main content, such as <c>#main</c>.</summary>
    [Parameter]
    public string Href { get; set; } = "#main";

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private IJSObjectReference? _module;

    // A bare fragment resolves against <base href>, which would leave the current page.
    private string ResolvedHref => Href.StartsWith('#')
        ? new Uri(Navigation.Uri).GetLeftPart(UriPartial.Query) + Href
        : Href;

    protected override void OnInitialized() => Navigation.LocationChanged += OnLocationChanged;

    private void OnLocationChanged(object? sender, LocationChangedEventArgs e) => InvokeAsync(StateHasChanged);

    private async Task MoveFocusAsync()
    {
        var fragment = Href.IndexOf('#');
        if (fragment < 0) return;

        try
        {
            _module ??= await TrazosModule.ImportAsync(JS);
            await _module.InvokeVoidAsync("focusById", Href[(fragment + 1)..]);
        }
        catch (JSException)
        {
            // The router still scrolls to the target.
        }
    }

    public async ValueTask DisposeAsync()
    {
        Navigation.LocationChanged -= OnLocationChanged;
        if (_module is null) return;

        try
        {
            await _module.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // The circuit is gone, and the module with it.
        }
    }
}

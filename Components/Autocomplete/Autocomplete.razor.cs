using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>
/// Campo de búsqueda con sugerencias. Consulta <see cref="SearchFunc"/> mientras el usuario
/// escribe (con espera breve para no saturar el servidor) y permite elegir con mouse o teclado.
/// </summary>
public partial class Autocomplete<TItem> : IDisposable
{
    private CancellationTokenSource? _searchCts;
    private List<TItem> _results = [];
    private string _query = string.Empty;
    private bool _isSearching;
    private bool _hasFocus;
    private bool _hasSearched;
    private int _activeIndex = -1;

    [Parameter]
    public string Id { get; set; } = $"trazos-autocomplete-{Guid.NewGuid():N}";

    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public string? HelperText { get; set; }

    [Parameter]
    public string? Error { get; set; }

    [Parameter]
    public bool Required { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>Función de búsqueda. Recibe el texto escrito y un token de cancelación.</summary>
    [Parameter, EditorRequired]
    public Func<string, CancellationToken, Task<IEnumerable<TItem>>> SearchFunc { get; set; } = null!;

    /// <summary>Texto que representa a un elemento (se usa si no hay <see cref="ItemTemplate"/>).</summary>
    [Parameter, EditorRequired]
    public Func<TItem, string> ItemText { get; set; } = null!;

    /// <summary>Plantilla para pintar cada sugerencia y el elemento seleccionado.</summary>
    [Parameter]
    public RenderFragment<TItem>? ItemTemplate { get; set; }

    [Parameter]
    public TItem? SelectedItem { get; set; }

    [Parameter]
    public EventCallback<TItem?> SelectedItemChanged { get; set; }

    /// <summary>
    /// Si es true, el campo se limpia tras elegir (útil para agregar varios elementos seguidos).
    /// Si es false, el elemento elegido queda visible con un botón para quitarlo.
    /// </summary>
    [Parameter]
    public bool ClearOnSelect { get; set; }

    /// <summary>Caracteres mínimos antes de buscar.</summary>
    [Parameter]
    public int MinChars { get; set; } = 2;

    /// <summary>Espera en milisegundos tras la última tecla antes de buscar.</summary>
    [Parameter]
    public int DebounceMs { get; set; } = 300;

    [Parameter]
    public string NoResultsText { get; set; } = "Sin resultados";

    [Parameter]
    public string SearchingText { get; set; } = "Buscando…";

    [Parameter]
    public string ClearText { get; set; } = "Quitar selección";

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private bool HasError => !string.IsNullOrEmpty(Error);

    private string ListId => $"{Id}-list";

    private bool IsOpen => _hasFocus && _query.Trim().Length >= MinChars && (_hasSearched || _isSearching);

    private string GetOptionId(int index) => $"{Id}-option-{index}";

    private async Task OnInputAsync(ChangeEventArgs e)
    {
        _query = e.Value?.ToString() ?? string.Empty;
        _hasFocus = true;
        _activeIndex = -1;

        _searchCts?.Cancel();
        _searchCts?.Dispose();
        _searchCts = null;

        var term = _query.Trim();
        if (term.Length < MinChars)
        {
            _results = [];
            _hasSearched = false;
            _isSearching = false;
            return;
        }

        var cts = new CancellationTokenSource();
        _searchCts = cts;
        _isSearching = true;

        try
        {
            await Task.Delay(DebounceMs, cts.Token);
            var results = await SearchFunc(term, cts.Token);

            if (cts.IsCancellationRequested)
            {
                return;
            }

            _results = results.ToList();
            _activeIndex = _results.Count > 0 ? 0 : -1;
            _hasSearched = true;
        }
        catch (OperationCanceledException)
        {
            // Una búsqueda más reciente reemplazó a esta.
        }
        catch (Exception)
        {
            _results = [];
            _hasSearched = true;
        }
        finally
        {
            if (_searchCts == cts)
            {
                _isSearching = false;
            }
        }
    }

    private async Task OnKeyDownAsync(KeyboardEventArgs e)
    {
        if (!IsOpen || _results.Count == 0)
        {
            if (e.Key == "Escape")
            {
                ResetQuery();
            }
            return;
        }

        switch (e.Key)
        {
            case "ArrowDown":
                _activeIndex = (_activeIndex + 1) % _results.Count;
                break;
            case "ArrowUp":
                _activeIndex = _activeIndex <= 0 ? _results.Count - 1 : _activeIndex - 1;
                break;
            case "Enter":
                if (_activeIndex >= 0 && _activeIndex < _results.Count)
                {
                    await SelectAsync(_results[_activeIndex]);
                }
                break;
            case "Escape":
                ResetQuery();
                break;
        }
    }

    private void OnFocus() => _hasFocus = true;

    private void OnBlur() => _hasFocus = false;

    private async Task SelectAsync(TItem item)
    {
        ResetQuery();

        if (!ClearOnSelect)
        {
            SelectedItem = item;
        }

        await SelectedItemChanged.InvokeAsync(item);
    }

    private async Task ClearSelectionAsync()
    {
        SelectedItem = default;
        await SelectedItemChanged.InvokeAsync(default);
    }

    private void ResetQuery()
    {
        _searchCts?.Cancel();
        _query = string.Empty;
        _results = [];
        _hasSearched = false;
        _isSearching = false;
        _activeIndex = -1;
    }

    public void Dispose()
    {
        _searchCts?.Cancel();
        _searchCts?.Dispose();
    }
}

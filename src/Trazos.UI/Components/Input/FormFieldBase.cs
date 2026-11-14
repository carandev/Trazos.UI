using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace Trazos.UI.Components;

/// <summary>
/// Shared behavior of every Trazos form field.
/// <para>
/// Outside an <see cref="EditForm"/> a field is a plain controlled component:
/// <c>Value</c> in, <c>ValueChanged</c> out, and <c>Error</c> passed by hand.
/// Inside an <see cref="EditForm"/> bound with <c>@bind-Value</c>, the field
/// also notifies the <see cref="EditContext"/> of changes, shows the first
/// validation message for its field, and carries the context's CSS state
/// classes (<c>modified</c>, <c>valid</c>, <c>invalid</c>) on its root.
/// An explicit <c>Error</c> always wins over the validation message.
/// </para>
/// </summary>
/// <typeparam name="TValue">Type of the bound value.</typeparam>
public abstract class FormFieldBase<TValue> : ComponentBase, IDisposable
{
    private EditContext? _subscribedContext;
    private ValidationMessageStore? _parseErrorStore;
    private Expression<Func<TValue>>? _fieldExpression;
    private string? _parseError;
    private bool _disposed;

    /// <summary>Creates a field whose default id starts with <paramref name="idPrefix"/>.</summary>
    protected FormFieldBase(string idPrefix)
    {
        Id = $"{idPrefix}-{Guid.NewGuid():N}";
    }

    [CascadingParameter]
    private EditContext? CascadedEditContext { get; set; }

    /// <summary>Id of the native control. Generated when not set.</summary>
    [Parameter]
    public string Id { get; set; }

    /// <summary>Current value. Supports <c>@bind-Value</c>.</summary>
    [Parameter]
    public TValue Value { get; set; } = default!;

    /// <summary>Raised when the user changes the value.</summary>
    [Parameter]
    public EventCallback<TValue> ValueChanged { get; set; }

    /// <summary>
    /// Identifies the bound field. Set automatically by <c>@bind-Value</c>; it is
    /// what links the field to the <see cref="EditContext"/> of an <see cref="EditForm"/>.
    /// </summary>
    [Parameter]
    public Expression<Func<TValue>>? ValueExpression { get; set; }

    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public string? HelperText { get; set; }

    /// <summary>Error message. When set, it replaces the validation message of the form.</summary>
    [Parameter]
    public string? Error { get; set; }

    /// <summary>Message shown when the typed text cannot be converted to <typeparamref name="TValue"/>.</summary>
    [Parameter]
    public string ParseErrorMessage { get; set; } = "Enter a valid value.";

    [Parameter]
    public bool Required { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>The cascaded edit context, when the field is bound inside an <see cref="EditForm"/>.</summary>
    protected EditContext? EditContext => FieldIdentifier is null ? null : CascadedEditContext;

    /// <summary>The bound field, when <see cref="ValueExpression"/> is known.</summary>
    protected FieldIdentifier? FieldIdentifier { get; private set; }

    /// <summary>Culture used to format and parse the value.</summary>
    protected virtual CultureInfo FormatCulture => CultureInfo.CurrentCulture;

    /// <summary>The message to show: <c>Error</c>, a conversion error, or the first validation message.</summary>
    protected string? ErrorMessage
    {
        get
        {
            if (!string.IsNullOrEmpty(Error))
            {
                return Error;
            }

            // Text that could not be converted is the most recent problem, so it
            // wins over messages from an earlier validation.
            if (_parseError is not null)
            {
                return _parseError;
            }

            if (EditContext is { } context && FieldIdentifier is { } fieldId)
            {
                return context.GetValidationMessages(fieldId).FirstOrDefault();
            }

            return null;
        }
    }

    protected bool HasError => !string.IsNullOrEmpty(ErrorMessage);

    protected bool HasHelperText => !string.IsNullOrEmpty(HelperText) && !HasError;

    protected string HelperId => $"{Id}-hint";

    protected string ErrorId => $"{Id}-error";

    /// <summary>Value for the control's <c>aria-describedby</c>, or <c>null</c>.</summary>
    protected string? DescribedBy => HasError ? ErrorId : HasHelperText ? HelperId : null;

    /// <summary>Value for the control's <c>aria-invalid</c>, or <c>null</c>.</summary>
    protected string? AriaInvalid => HasError ? "true" : null;

    /// <summary>CSS state classes from the edit context (for example <c>modified valid</c>).</summary>
    protected string FieldStateClass =>
        EditContext is { } context && FieldIdentifier is { } fieldId ? context.FieldCssClass(fieldId) : string.Empty;

    /// <summary>The current value formatted for an HTML control.</summary>
    protected string? CurrentValueAsString => FormatValueAsString(Value);

    protected override void OnParametersSet()
    {
        if (ValueExpression is not null && !ReferenceEquals(ValueExpression, _fieldExpression))
        {
            FieldIdentifier = Microsoft.AspNetCore.Components.Forms.FieldIdentifier.Create(ValueExpression);
            _fieldExpression = ValueExpression;
        }
        else if (ValueExpression is null)
        {
            FieldIdentifier = null;
            _fieldExpression = null;
        }

        var context = EditContext;
        if (!ReferenceEquals(context, _subscribedContext))
        {
            DetachContext();
            if (context is not null)
            {
                context.OnValidationStateChanged += HandleValidationStateChanged;
                _parseErrorStore = new ValidationMessageStore(context);
            }
            _subscribedContext = context;
        }
    }

    /// <summary>Sets the value, raises <c>ValueChanged</c> and notifies the edit context.</summary>
    protected async Task SetValueAsync(TValue value)
    {
        ClearParseError();
        Value = value;
        await ValueChanged.InvokeAsync(value);
        if (EditContext is { } context && FieldIdentifier is { } fieldId)
        {
            context.NotifyFieldChanged(fieldId);
        }
    }

    /// <summary>Converts text typed by the user and sets the value, or records a conversion error.</summary>
    protected async Task SetValueFromStringAsync(string? text)
    {
        if (TryParseValueFromString(text, out var value))
        {
            await SetValueAsync(value);
            return;
        }

        _parseError = ParseErrorMessage;
        if (EditContext is { } context && FieldIdentifier is { } fieldId && _parseErrorStore is not null)
        {
            _parseErrorStore.Clear(fieldId);
            _parseErrorStore.Add(fieldId, ParseErrorMessage);
            context.NotifyValidationStateChanged();
        }
    }

    /// <summary>Formats a value for an HTML control.</summary>
    protected virtual string? FormatValueAsString(TValue value) =>
        BindConverter.FormatValue(value, FormatCulture)?.ToString();

    /// <summary>Converts text from an HTML control. Strings pass through; empty text becomes <c>default</c> for other nullable types.</summary>
    protected virtual bool TryParseValueFromString(string? text, out TValue value)
    {
        // Text binds as typed, so an empty option stays "" as it always did.
        if (typeof(TValue) == typeof(string))
        {
            value = (TValue)(object)text!;
            return true;
        }

        if (string.IsNullOrWhiteSpace(text) && default(TValue) is null)
        {
            value = default!;
            return true;
        }

        return BindConverter.TryConvertTo(text, FormatCulture, out value!);
    }

    private void ClearParseError()
    {
        if (_parseError is null)
        {
            return;
        }

        _parseError = null;
        if (EditContext is { } context && FieldIdentifier is { } fieldId && _parseErrorStore is not null)
        {
            _parseErrorStore.Clear(fieldId);
            context.NotifyValidationStateChanged();
        }
    }

    private void HandleValidationStateChanged(object? sender, ValidationStateChangedEventArgs e) =>
        _ = InvokeAsync(StateHasChanged);

    private void DetachContext()
    {
        if (_subscribedContext is not null)
        {
            _subscribedContext.OnValidationStateChanged -= HandleValidationStateChanged;
            _parseErrorStore?.Clear();
            _parseErrorStore = null;
        }
    }

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    /// <summary>Releases the edit context subscription. Override to release a field's own resources.</summary>
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        if (disposing)
        {
            DetachContext();
            _subscribedContext = null;
        }
    }
}

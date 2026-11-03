using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trazos.UI.Components;

public partial class Toast : IDisposable
{
    private readonly List<ToastItem> _toasts = [];
    private static Toast? _instance;

    protected override void OnInitialized()
    {
        _instance = this;
    }

    public void Dispose()
    {
        if (_instance == this)
        {
            _instance = null;
        }
    }

    public static void ShowSuccess(string message, string? title = null)
        => Show(message, ToastType.Success, title);

    public static void ShowError(string message, string? title = null)
        => Show(message, ToastType.Error, title);

    public static void ShowWarning(string message, string? title = null)
        => Show(message, ToastType.Warning, title);

    public static void ShowInfo(string message, string? title = null)
        => Show(message, ToastType.Info, title);

    private static void Show(string message, ToastType type, string? title = null)
    {
        _instance?.AddToast(message, type, title);
    }

    private void AddToast(string message, ToastType type, string? title)
    {
        var toast = new ToastItem
        {
            Id = Guid.NewGuid(),
            Message = message,
            Type = type,
            Title = title
        };

        _toasts.Add(toast);
        StateHasChanged();

        _ = Task.Delay(5000).ContinueWith(_ =>
        {
            InvokeAsync(() => RemoveToast(toast.Id));
        });
    }

    private void RemoveToast(Guid id)
    {
        var toast = _toasts.FirstOrDefault(t => t.Id == id);
        if (toast != null)
        {
            toast.IsExiting = true;
            StateHasChanged();

            _ = Task.Delay(300).ContinueWith(_ =>
            {
                InvokeAsync(() =>
                {
                    _toasts.Remove(toast);
                    StateHasChanged();
                });
            });
        }
    }

    public class ToastItem
    {
        public Guid Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Title { get; set; }
        public ToastType Type { get; set; }
        public bool IsExiting { get; set; }
    }

    public enum ToastType
    {
        Success,
        Error,
        Warning,
        Info
    }
}

namespace Trazos.UI.Components;

/// <summary>One step of a <see cref="Stepper"/>.</summary>
public sealed record StepperStep(string Title, string? Description = null);

using System.ComponentModel.DataAnnotations;

namespace Trazos.UI.Tests.Fixtures;

public sealed class ProfileModel
{
    [Required(ErrorMessage = "Name is required.")]
    public string? Name { get; set; }

    [Required(ErrorMessage = "Notes are required.")]
    public string? Notes { get; set; }

    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms.")]
    public bool Accept { get; set; }
}

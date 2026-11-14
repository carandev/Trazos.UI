using System.ComponentModel.DataAnnotations;

namespace Trazos.UI.Tests.Fixtures;

public sealed class PayrollModel
{
    [Range(1, 1_000_000_000, ErrorMessage = "Enter the base salary.")]
    public decimal Salary { get; set; }

    [Required(ErrorMessage = "Enter the start date.")]
    public DateOnly? StartDate { get; set; }
}

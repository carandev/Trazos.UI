using System.ComponentModel.DataAnnotations;

namespace Trazos.UI.Tests.Fixtures;

public enum PayFrequency
{
    Weekly,
    Biweekly,
    Monthly,
}

public sealed class AssignmentModel
{
    [Required(ErrorMessage = "Choose a frequency.")]
    public PayFrequency? Frequency { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Choose a company.")]
    public int CompanyId { get; set; }

    public Guid? ManagerId { get; set; }

    [Required(ErrorMessage = "Choose a contract.")]
    public string? Contract { get; set; }
}

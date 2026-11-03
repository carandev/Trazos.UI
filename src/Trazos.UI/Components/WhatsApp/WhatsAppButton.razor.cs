using System.Linq;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class WhatsAppButton
{
    [Parameter]
    public required string PhoneNumber { get; set; }

    [Parameter]
    public string DefaultCountryCode { get; set; } = "57";

    [Parameter]
    public bool ShowPhone { get; set; }

    private string WhatsAppUrl
    {
        get
        {
            var number = new string(PhoneNumber.Where(char.IsDigit).ToArray());
            if (number.StartsWith("0"))
            {
                number = number[1..];
            }
            if (!number.StartsWith(DefaultCountryCode) && !number.StartsWith($"+{DefaultCountryCode}"))
            {
                number = DefaultCountryCode + number;
            }
            return $"https://wa.me/{number}";
        }
    }
}

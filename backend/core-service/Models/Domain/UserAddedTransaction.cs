using System.ComponentModel.DataAnnotations;

namespace BudgetlyAI.Models;

public class UserAddedTransaction
{
    public Guid Id { get; set; }

    [MaxLength(64)]
    public string? UserId { get; set; }

    [Required]
    [MaxLength(96)]
    public string DashboardName { get; set; } = null!;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [MaxLength(256)]
    public string Description { get; set; } = null!;

    public decimal Amount { get; set; }
}

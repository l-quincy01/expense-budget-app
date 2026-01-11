using System.ComponentModel.DataAnnotations;

namespace BudgetlyAI.Models;

public class UserAddedBudget
{
    public Guid Id { get; set; }

    [MaxLength(64)]
    public string? UserId { get; set; }

    [Required]
    [MaxLength(96)]
    public string DashboardName { get; set; } = null!;

    [Required]
    [MaxLength(64)]
    public string Category { get; set; } = null!;

    [Range(0, double.MaxValue)]
    public decimal BudgetAmount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal SpentAmount { get; set; }
}

using BudgetlyAI.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetlyAI.Data;

public class BudgetsDbContext : DbContext
{
    public BudgetsDbContext(DbContextOptions<BudgetsDbContext> options) : base(options)
    {
    }

    public DbSet<UserAddedBudget> UserAddedBudgets => Set<UserAddedBudget>();
    public DbSet<UserAddedTransaction> UserAddedTransactions => Set<UserAddedTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var budgets = modelBuilder.Entity<UserAddedBudget>();
        budgets.ToTable("UserAddedBudgets");
        budgets.HasKey(b => b.Id);
        budgets.Property(b => b.Id).ValueGeneratedOnAdd();
        budgets.Property(b => b.UserId).HasMaxLength(64).IsRequired();
        budgets.Property(b => b.DashboardName).HasMaxLength(96).IsRequired();
        budgets.Property(b => b.Category).HasMaxLength(64).IsRequired();
        budgets.Property(b => b.BudgetAmount).HasColumnType("numeric(14,2)");
        budgets.Property(b => b.SpentAmount).HasColumnType("numeric(14,2)");
        budgets.HasIndex(b => new { b.UserId, b.DashboardName, b.Category })
               .HasDatabaseName("IX_UserBudget_Composite");

        var transactions = modelBuilder.Entity<UserAddedTransaction>();
        transactions.ToTable("UserAddedTransactions");
        transactions.HasKey(t => t.Id);
        transactions.Property(t => t.Id).ValueGeneratedOnAdd();
        transactions.Property(t => t.UserId).HasMaxLength(64).IsRequired();
        transactions.Property(t => t.DashboardName).HasMaxLength(96).IsRequired();
        transactions.Property(t => t.Date).HasColumnType("date");
        transactions.Property(t => t.Description).HasMaxLength(256).IsRequired();
        transactions.Property(t => t.Amount).HasColumnType("numeric(14,2)");
        transactions.HasIndex(t => new { t.UserId, t.DashboardName, t.Date })
                    .HasDatabaseName("IX_UserTransactions_Lookup");
    }
}

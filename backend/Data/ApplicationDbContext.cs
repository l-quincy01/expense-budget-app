
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
  : DbContext(options)
{
  public DbSet<Budget> Budgets => Set<Budget>();
  public DbSet<Transaction> Transactions => Set<Transaction>();

  protected override void OnModelCreating(ModelBuilder b)
  {
    b.Entity<Budget>()
      .HasIndex(x => new { x.UserId, x.Category, x.Month })
      .IsUnique();
    b.Entity<Transaction>()
      .HasIndex(x => new { x.UserId, x.TransactionDate });
  }
}
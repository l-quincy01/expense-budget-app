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
    public DbSet<StatementUpload> StatementUploads => Set<StatementUpload>();
    public DbSet<ExtractedTransaction> ExtractedTransactions => Set<ExtractedTransaction>();

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

        var statementUploads = modelBuilder.Entity<StatementUpload>();
        statementUploads.ToTable("StatementUploads");
        statementUploads.HasKey(s => s.Id);
        statementUploads.Property(s => s.Id).ValueGeneratedNever();
        statementUploads.Property(s => s.UserId).HasMaxLength(64).IsRequired();
        statementUploads.Property(s => s.DashboardName).HasMaxLength(96).IsRequired();
        statementUploads.Property(s => s.FileName).HasMaxLength(256).IsRequired();
        statementUploads.Property(s => s.StoredFilePath).HasMaxLength(1024).IsRequired();
        statementUploads.Property(s => s.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        statementUploads.Property(s => s.ErrorMessage).HasMaxLength(2048);
        statementUploads.Property(s => s.UploadedAt).IsRequired();
        statementUploads.HasIndex(s => new { s.UserId, s.UploadedAt })
                        .HasDatabaseName("IX_StatementUploads_User_UploadedAt");
        statementUploads.HasIndex(s => new { s.UserId, s.Status })
                        .HasDatabaseName("IX_StatementUploads_User_Status");

        var extractedTransactions = modelBuilder.Entity<ExtractedTransaction>();
        extractedTransactions.ToTable("ExtractedTransactions");
        extractedTransactions.HasKey(t => t.Id);
        extractedTransactions.Property(t => t.Id).ValueGeneratedNever();
        extractedTransactions.Property(t => t.UserId).HasMaxLength(64).IsRequired();
        extractedTransactions.Property(t => t.DashboardName).HasMaxLength(96).IsRequired();
        extractedTransactions.Property(t => t.Description).HasMaxLength(256).IsRequired();
        extractedTransactions.Property(t => t.Merchant).HasMaxLength(128);
        extractedTransactions.Property(t => t.Category).HasMaxLength(64);
        extractedTransactions.Property(t => t.Amount).HasColumnType("numeric(14,2)");
        extractedTransactions.Property(t => t.Date).HasColumnType("date");
        extractedTransactions.Property(t => t.TransactionType).HasMaxLength(32);
        extractedTransactions.HasIndex(t => new { t.UserId, t.DashboardName, t.Date })
                             .HasDatabaseName("IX_ExtractedTransactions_User_Dashboard_Date");
        extractedTransactions.HasIndex(t => t.StatementUploadId)
                             .HasDatabaseName("IX_ExtractedTransactions_StatementUploadId");
        extractedTransactions.HasOne(t => t.StatementUpload)
                             .WithMany(s => s.ExtractedTransactions)
                             .HasForeignKey(t => t.StatementUploadId)
                             .OnDelete(DeleteBehavior.Cascade);
    }
}

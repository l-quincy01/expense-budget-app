using Microsoft.EntityFrameworkCore;

namespace StatementWorker.Data;

public sealed class StatementWorkerDbContext : DbContext
{
    public StatementWorkerDbContext(DbContextOptions<StatementWorkerDbContext> options)
        : base(options)
    {
    }

    public DbSet<StatementUploadRecord> StatementUploads => Set<StatementUploadRecord>();
    public DbSet<ExtractedTransactionRecord> ExtractedTransactions => Set<ExtractedTransactionRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var statementUploads = modelBuilder.Entity<StatementUploadRecord>();
        statementUploads.ToTable("StatementUploads");
        statementUploads.HasKey(s => s.Id);
        statementUploads.Property(s => s.Id).ValueGeneratedNever();
        statementUploads.Property(s => s.UserId).HasMaxLength(64).IsRequired();
        statementUploads.Property(s => s.DashboardName).HasMaxLength(96).IsRequired();
        statementUploads.Property(s => s.FileName).HasMaxLength(256).IsRequired();
        statementUploads.Property(s => s.StoredFilePath).HasMaxLength(1024).IsRequired();
        statementUploads.Property(s => s.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        statementUploads.Property(s => s.ErrorMessage).HasMaxLength(2048);

        var extractedTransactions = modelBuilder.Entity<ExtractedTransactionRecord>();
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
        extractedTransactions.HasIndex(t => t.StatementUploadId)
                             .HasDatabaseName("IX_ExtractedTransactions_StatementUploadId");
        extractedTransactions.HasIndex(t => new { t.UserId, t.DashboardName, t.Date })
                             .HasDatabaseName("IX_ExtractedTransactions_User_Dashboard_Date");
    }
}

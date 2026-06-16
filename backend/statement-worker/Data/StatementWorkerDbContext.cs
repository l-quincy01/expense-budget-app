using Microsoft.EntityFrameworkCore;

namespace StatementWorker.Data;

public sealed class StatementWorkerDbContext : DbContext
{
    public StatementWorkerDbContext(DbContextOptions<StatementWorkerDbContext> options)
        : base(options)
    {
    }

    public DbSet<StatementUploadRecord> StatementUploads => Set<StatementUploadRecord>();

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
    }
}

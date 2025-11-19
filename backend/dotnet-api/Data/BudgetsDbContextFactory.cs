using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace BudgetlyAI.Data;

public class BudgetsDbContextFactory : IDesignTimeDbContextFactory<BudgetsDbContext>
{
    public BudgetsDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("BudgetsDb");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'BudgetsDb' not found.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<BudgetsDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new BudgetsDbContext(optionsBuilder.Options);
    }
}

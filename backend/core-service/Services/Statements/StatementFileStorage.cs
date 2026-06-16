using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BudgetlyAI.Services.Statements;

public sealed partial class StatementFileStorage : IStatementFileStorage
{
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<StatementFileStorage> _logger;

    public StatementFileStorage(
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<StatementFileStorage> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public async Task<string> SaveAsync(
        string userId,
        Guid statementId,
        IFormFile file,
        CancellationToken ct = default)
    {
        ValidatePdf(file);

        var basePath = _configuration["StatementStorage:BasePath"];
        if (string.IsNullOrWhiteSpace(basePath))
        {
            basePath = Path.Combine(_environment.ContentRootPath, "storage", "statements");
        }

        var safeUserId = SafePathSegment(userId);
        var directory = Path.Combine(basePath, safeUserId, statementId.ToString("N"));
        Directory.CreateDirectory(directory);

        var safeFileName = SafeFileName(file.FileName);
        var storedPath = Path.Combine(directory, safeFileName);

        await using var stream = File.Create(storedPath);
        await file.CopyToAsync(stream, ct);

        _logger.LogInformation(
            "[StatementFileStorage] Saved statement file. statementId={StatementId}, path={Path}",
            statementId,
            storedPath);

        return storedPath;
    }

    public Task DeleteIfExistsAsync(string storedFilePath, CancellationToken ct = default)
    {
        if (File.Exists(storedFilePath))
        {
            File.Delete(storedFilePath);
        }

        var directory = Path.GetDirectoryName(storedFilePath);
        if (!string.IsNullOrWhiteSpace(directory) &&
            Directory.Exists(directory) &&
            !Directory.EnumerateFileSystemEntries(directory).Any())
        {
            Directory.Delete(directory);
        }

        return Task.CompletedTask;
    }

    public static void ValidatePdf(IFormFile file)
    {
        if (file.Length <= 0)
        {
            throw new InvalidDataException("Statement PDF cannot be empty.");
        }

        var hasPdfExtension = Path.GetExtension(file.FileName)
            .Equals(".pdf", StringComparison.OrdinalIgnoreCase);
        var hasPdfContentType = file.ContentType.Equals(
            "application/pdf",
            StringComparison.OrdinalIgnoreCase);

        if (!hasPdfExtension && !hasPdfContentType)
        {
            throw new InvalidDataException("Only PDF statement files are supported.");
        }
    }

    public static string SafeFileName(string fileName)
    {
        var name = Path.GetFileName(fileName);
        return UnsafeFileNameChars().Replace(name, "_");
    }

    private static string SafePathSegment(string value)
    {
        return UnsafeFileNameChars().Replace(value, "_");
    }

    [GeneratedRegex(@"[^a-zA-Z0-9_.-]")]
    private static partial Regex UnsafeFileNameChars();
}

using BudgetlyAI.Services.Statements;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CoreService.Tests.Services.Statements;

public class StatementFileStorageTests
{
    [Fact]
    public void ValidatePdf_RejectsEmptyFiles()
    {
        var file = CreateFormFile("statement.pdf", "application/pdf", Array.Empty<byte>());

        var act = () => StatementFileStorage.ValidatePdf(file);

        act.Should().Throw<InvalidDataException>()
            .WithMessage("Statement PDF cannot be empty.");
    }

    [Fact]
    public void ValidatePdf_RejectsNonPdfFiles()
    {
        var file = CreateFormFile("statement.txt", "text/plain", [1, 2, 3]);

        var act = () => StatementFileStorage.ValidatePdf(file);

        act.Should().Throw<InvalidDataException>()
            .WithMessage("Only PDF statement files are supported.");
    }

    [Fact]
    public async Task SaveAsync_StoresFileUnderUserAndStatementPathWithSafeName()
    {
        var basePath = Path.Combine(Path.GetTempPath(), "budgetly-test-statements", Guid.NewGuid().ToString("N"));
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["StatementStorage:BasePath"] = basePath
            })
            .Build();

        var environment = Mock.Of<IHostEnvironment>(e =>
            e.ContentRootPath == AppContext.BaseDirectory);
        var storage = new StatementFileStorage(
            configuration,
            environment,
            Mock.Of<ILogger<StatementFileStorage>>());
        var statementId = Guid.NewGuid();
        var file = CreateFormFile("../my statement.pdf", "application/pdf", [1, 2, 3]);

        var path = await storage.SaveAsync("user/123", statementId, file);

        File.Exists(path).Should().BeTrue();
        path.Should().Contain(statementId.ToString("N"));
        Path.GetFileName(path).Should().Be("my_statement.pdf");

        await storage.DeleteIfExistsAsync(path);
    }

    private static IFormFile CreateFormFile(string fileName, string contentType, byte[] bytes)
    {
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "pdfs", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }
}

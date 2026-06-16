using System.Net.Http.Headers;
using System.Text.Json;
using StatementWorker.Data;

namespace StatementWorker.Extraction;

public sealed class AiStatementExtractionClient : IAiStatementExtractionClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiStatementExtractionClient> _logger;

    public AiStatementExtractionClient(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AiStatementExtractionClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ExtractAllResultDto> ExtractAsync(
        StatementUploadRecord upload,
        CancellationToken ct = default)
    {
        if (!File.Exists(upload.StoredFilePath))
        {
            throw new FileNotFoundException("Stored statement PDF was not found.", upload.StoredFilePath);
        }

        var url = _configuration["AiService:StatementExtractUrl"] ??
                  "http://localhost:4010/api/statements/extract";

        await using var stream = File.OpenRead(upload.StoredFilePath);
        using var content = new MultipartFormDataContent();
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        content.Add(fileContent, "pdfs", upload.FileName);

        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = content
        };
        request.Headers.Add("x-user-id", upload.UserId);

        _logger.LogInformation(
            "[AiStatementExtractionClient] Sending extraction request. statementId={StatementId}, url={Url}",
            upload.Id,
            url);

        using var response = await _httpClient.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"AI extraction failed with status {(int)response.StatusCode}: {body}");
        }

        var result = JsonSerializer.Deserialize<ExtractAllResultDto>(body, JsonOptions);
        return result ?? throw new InvalidOperationException("AI extraction returned an empty response.");
    }
}

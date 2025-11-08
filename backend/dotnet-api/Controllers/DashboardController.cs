using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Clerk.BackendAPI;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ClerkBackendApi _clerk;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public DashboardController(ClerkBackendApi clerk, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _clerk = clerk;
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    [HttpPost("create")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> CreateDashboard(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {

        var bearerToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        var claims = new JwtSecurityTokenHandler().ReadJwtToken(bearerToken);
        var userId = claims.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("Invalid Clerk token");


        if (string.IsNullOrWhiteSpace(dashboardName))
            return BadRequest("dashboardName is required");

        if (pdfs is null || pdfs.Length == 0)
            return BadRequest("At least one PDF is required");



        var client = _httpClientFactory.CreateClient("AiIngest");
        var nodeApiUrl = _config["NodeIngest:BaseUrl"] ?? "http://localhost:4010/api/ingest";

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(dashboardName), "dashboardName");

        foreach (var pdf in pdfs)
        {
            var stream = pdf.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            form.Add(fileContent, "pdfs", pdf.FileName);
        }


        var req = new HttpRequestMessage(HttpMethod.Post, nodeApiUrl);
        req.Content = form;
        req.Headers.Add("x-user-id", userId);


        var resp = await client.SendAsync(req, ct);
        var body = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
            return StatusCode((int)resp.StatusCode, new { error = body });

        return Ok(new { message = "Dashboard created & ingested", nodeResponse = body });
    }
}

using BudgetlyAI.Services.Auth;
using BudgetlyAI.Services.Statements;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetlyAI.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatementsController : ControllerBase
{
    private readonly IStatementService _statementService;
    private readonly ClerkAuthService _clerkAuth;
    private readonly ILogger<StatementsController> _logger;

    public StatementsController(
        IStatementService statementService,
        ClerkAuthService clerkAuth,
        ILogger<StatementsController> logger)
    {
        _statementService = statementService;
        _clerkAuth = clerkAuth;
        _logger = logger;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        [FromForm] string dashboardName,
        [FromForm] IFormFile[] pdfs,
        CancellationToken ct)
    {
        var userId = await GetAuthenticatedUserIdAsync();
        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var response = await _statementService.UploadAsync(
                userId,
                dashboardName,
                pdfs,
                ct);

            return Accepted(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidDataException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (MassTransitException ex)
        {
            _logger.LogError(ex, "[UploadStatement] Failed to publish statement event");
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Statement queue is unavailable. Please try again later.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[UploadStatement] Statement upload failed");
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                "Statement upload could not be queued. Please try again later.");
        }
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var userId = await GetAuthenticatedUserIdAsync();
        if (userId is null)
        {
            return Unauthorized();
        }

        var statements = await _statementService.ListAsync(userId, ct);
        return Ok(statements);
    }

    [HttpGet("{id:guid}/status")]
    public async Task<IActionResult> GetStatus(Guid id, CancellationToken ct)
    {
        var userId = await GetAuthenticatedUserIdAsync();
        if (userId is null)
        {
            return Unauthorized();
        }

        var status = await _statementService.GetStatusAsync(userId, id, ct);
        return status is null ? NotFound() : Ok(status);
    }

    private async Task<string?> GetAuthenticatedUserIdAsync()
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        return isAuth ? userId : null;
    }
}

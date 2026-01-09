
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult GetHealth()
    {
        _logger.LogInformation("[HealthCheck] Incoming health check request");
        return Ok(new { ok = true });
    }
}

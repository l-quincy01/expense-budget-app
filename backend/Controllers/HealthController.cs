using Microsoft.AspNetCore.Mvc;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHealth() => Ok(new { ok = true });
}

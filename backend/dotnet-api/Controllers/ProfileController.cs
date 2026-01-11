
using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services;
using Serilog;
using BudgetlyAI.Services.Auth;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ClerkAuthService _clerkAuth;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(ClerkAuthService clerkAuth, ILogger<ProfileController> logger)
    {
        _clerkAuth = clerkAuth;
        _logger = logger;
    }

    //get/fetch
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        _logger.LogInformation("[GetProfile] Incoming request");

        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);

        _logger.LogInformation("[GetProfile] isAuth={IsAuth}, userId={UserId}", isAuth, userId);

        if (!isAuth || userId is null)
        {
            _logger.LogWarning("[GetProfile] Unauthorized request");
            return Unauthorized();
        }

        _logger.LogInformation("[GetProfile] Fetching Clerk profile for userId={UserId}", userId);

        var profile = await _clerkAuth.GetUserProfileAsync(userId);

        _logger.LogInformation("[GetProfile] Profile retrieved successfully");

        return Ok(profile);
    }
}

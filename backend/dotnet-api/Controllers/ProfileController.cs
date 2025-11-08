using Microsoft.AspNetCore.Mvc;
using BudgetlyAI.Services;

namespace BudgetlyAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ClerkAuthService _clerkAuth;

    public ProfileController(ClerkAuthService clerkAuth)
    {
        _clerkAuth = clerkAuth;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var (isAuth, userId) = await _clerkAuth.AuthenticateAsync(Request);
        if (!isAuth || userId is null)
            return Unauthorized();

        var profile = await _clerkAuth.GetUserProfileAsync(userId);
        return Ok(profile);
    }
}

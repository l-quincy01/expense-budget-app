using System.Security.Claims;

namespace BudgetlyAI.Infrastructure.Auth;

public static class ClaimsPrincipalExtensions
{
    public static string GetUserId(this ClaimsPrincipal user)
    {
        return user.FindFirst("sub")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? user.FindFirst("user_id")?.Value
            ?? throw new UnauthorizedAccessException(
                "User identifier claim missing");
    }
}

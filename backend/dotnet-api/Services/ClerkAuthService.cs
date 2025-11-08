using Clerk.BackendAPI;
using Clerk.BackendAPI.Helpers.Jwks;
using Microsoft.IdentityModel.JsonWebTokens;

namespace BudgetlyAI.Services;

public class ClerkAuthService
{
    private readonly IConfiguration _config;
    private readonly ClerkBackendApi _clerk;

    public ClerkAuthService(IConfiguration config, ClerkBackendApi clerk)
    {
        _config = config;
        _clerk = clerk;
    }

    public async Task<(bool IsAuthenticated, string? UserId)> AuthenticateAsync(HttpRequest request)
    {
        var options = new AuthenticateRequestOptions(
            secretKey: _config["Clerk:SecretKey"]!,
            authorizedParties: new[] { _config["Clerk:AuthorizedParty"]! });

        var state = await AuthenticateRequest.AuthenticateRequestAsync(request, options);
        if (!state.IsAuthenticated) return (false, null);

        var authHeader = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return (false, null);

        var token = authHeader["Bearer ".Length..];
        var jwt = new JsonWebToken(token);
        return (true, jwt.Subject);
    }

    public async Task<object?> GetUserProfileAsync(string userId)
    {
        var user = await _clerk.Users.GetAsync(userId: userId);

        var primaryEmailId = user.User.PrimaryEmailAddressId;
        var email = user.User.EmailAddresses?.FirstOrDefault(e => e.Id == primaryEmailId)?.EmailAddressValue
                    ?? user.User.EmailAddresses?.FirstOrDefault()?.EmailAddressValue
                    ?? "unknown";

        return new
        {
            userId,
            email,
            firstName = user.User.FirstName ?? "User",
            lastName = user.User.LastName ?? ""
        };
    }
}

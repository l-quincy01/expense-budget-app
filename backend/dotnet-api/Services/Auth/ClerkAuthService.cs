
using Clerk.BackendAPI;
using Clerk.BackendAPI.Helpers.Jwks;
using Microsoft.IdentityModel.JsonWebTokens;
using Serilog;

namespace BudgetlyAI.Services.Auth;

public class ClerkAuthService
{
    private readonly IConfiguration _config;
    private readonly ClerkBackendApi _clerk;
    private readonly ILogger<ClerkAuthService> _logger;

    public ClerkAuthService(IConfiguration config, ClerkBackendApi clerk, ILogger<ClerkAuthService> logger)
    {
        _config = config;
        _clerk = clerk;
        _logger = logger;
    }

    public async Task<(bool IsAuthenticated, string? UserId)> AuthenticateAsync(HttpRequest request)
    {
        _logger.LogInformation("[AuthenticateAsync] Incoming authentication request");

        var options = new AuthenticateRequestOptions(
            secretKey: _config["Clerk:SecretKey"]!,
            authorizedParties: new[] { _config["Clerk:AuthorizedParty"]! });

        _logger.LogInformation("[AuthenticateAsync] Starting Clerk AuthenticateRequest");

        var state = await AuthenticateRequest.AuthenticateRequestAsync(request, options);

        _logger.LogInformation("[AuthenticateAsync] Clerk state IsAuthenticated={IsAuthenticated}", state.IsAuthenticated);

        if (!state.IsAuthenticated)
        {
            _logger.LogWarning("[AuthenticateAsync] Authentication failed: Clerk state rejected request");
            return (false, null);
        }

        var authHeader = request.Headers.Authorization.ToString();
        _logger.LogInformation("[AuthenticateAsync] Authorization header found={HasHeader}", !string.IsNullOrWhiteSpace(authHeader));

        if (string.IsNullOrWhiteSpace(authHeader) ||
            !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("[AuthenticateAsync] Invalid or missing Bearer token");
            return (false, null);
        }

        var token = authHeader["Bearer ".Length..];

        JsonWebToken jwt;
        try
        {
            jwt = new JsonWebToken(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[AuthenticateAsync] Failed to parse JWT token");
            return (false, null);
        }

        _logger.LogInformation("[AuthenticateAsync] Successfully authenticated userId={UserId}", jwt.Subject);

        return (true, jwt.Subject);
    }

    public async Task<object?> GetUserProfileAsync(string userId)
    {
        _logger.LogInformation("[GetUserProfileAsync] Fetching Clerk profile for userId={UserId}", userId);

        var user = await _clerk.Users.GetAsync(userId: userId);

        var primaryEmailId = user.User.PrimaryEmailAddressId;
        var email = user.User.EmailAddresses?.FirstOrDefault(e => e.Id == primaryEmailId)?.EmailAddressValue
                    ?? user.User.EmailAddresses?.FirstOrDefault()?.EmailAddressValue
                    ?? "unknown";

        _logger.LogInformation("[GetUserProfileAsync] Profile data resolved for userId={UserId}, email={Email}", userId, email);

        return new
        {
            userId,
            email,
            firstName = user.User.FirstName ?? "User",
            lastName = user.User.LastName ?? ""
        };
    }
}

using System.Net.Http;
using System.Net.Http.Headers;
using Clerk.BackendAPI;
using Clerk.BackendAPI.Helpers.Jwks;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.IdentityModel.JsonWebTokens;

var builder = WebApplication.CreateBuilder(args);

// CORS 
builder.Services.AddCors(opts =>
{
  opts.AddPolicy("frontend", p =>
      p.WithOrigins("http://localhost:3000")
       .AllowAnyHeader()
       .AllowAnyMethod()
       .AllowCredentials());
});

//   Clerk Backend with Secret Key
builder.Services.AddSingleton(_ =>
    new ClerkBackendApi(bearerAuth: builder.Configuration["Clerk:SecretKey"]!));

var app = builder.Build();

app.UseCors("frontend");


app.MapGet("/api/health", () => new { ok = true });

// Helper to convert HttpContext -> HttpRequestMessage for Clerk's authenticate helper
static HttpRequestMessage ToHttpRequestMessage(HttpContext ctx)
{
  var req = new HttpRequestMessage(new HttpMethod(ctx.Request.Method), ctx.Request.GetDisplayUrl());

  foreach (var (key, value) in ctx.Request.Headers)
  {

    if (!req.Headers.TryAddWithoutValidation(key, (IEnumerable<string>)value))
    {

      if (ctx.Request.ContentLength is > 0)
      {
        req.Content ??= new StreamContent(ctx.Request.Body);
        req.Content.Headers.TryAddWithoutValidation(key, value.ToArray());
      }
    }
  }

  return req;
}

// Profile for user info from clerk
app.MapGet("/api/profile", async (HttpContext ctx, ClerkBackendApi clerk) =>
{
  var cfg = ctx.RequestServices.GetRequiredService<IConfiguration>();
  var options = new AuthenticateRequestOptions(
      secretKey: cfg["Clerk:SecretKey"]!,
      authorizedParties: new[] { cfg["Clerk:AuthorizedParty"]! }
  );


  var state = await AuthenticateRequest.AuthenticateRequestAsync(ctx.Request, options);
  if (!state.IsAuthenticated) return Results.Unauthorized();




  var authHeader = ctx.Request.Headers.Authorization.ToString();
  if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    return Results.Unauthorized();

  var token = authHeader["Bearer ".Length..];
  var jwt = new JsonWebToken(token);
  var userId = jwt.Subject;

  var user = await clerk.Users.GetAsync(userId: userId);

  var primaryEmailId = user.User.PrimaryEmailAddressId;
  var email = user.User.EmailAddresses?.FirstOrDefault(e => e.Id == primaryEmailId)?.EmailAddressValue
              ?? user.User.EmailAddresses?.FirstOrDefault()?.EmailAddressValue
              ?? "unknown";

  return Results.Ok(new
  {
    userId,
    email,
    firstName = user.User.FirstName ?? "User",
    lastName = user.User.LastName ?? ""
  });
});

app.Run();

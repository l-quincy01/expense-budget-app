using Microsoft.AspNetCore.Authorization;
using Clerk.Net.AspNetCore.Security;

var builder = WebApplication.CreateBuilder(args);

// origin:
builder.Services.AddCors(opts =>
{
  opts.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:3000")
     .AllowAnyHeader()
     .AllowAnyMethod());
});

//  Clerk authentication:
builder.Services.AddAuthentication(ClerkAuthenticationDefaults.AuthenticationScheme)
  .AddClerkAuthentication(x =>
  {

    x.Authority = builder.Configuration["Clerk:Authority"]!;

    x.AuthorizedParty = builder.Configuration["Clerk:AuthorizedParty"]!;
  });

builder.Services.AddAuthorizationBuilder()
  .SetFallbackPolicy(new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .Build());

var app = builder.Build();

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => new { ok = true });

app.MapGet("/api/profile", (HttpContext ctx) =>
{
  var userId = ctx.User.FindFirst("sub")?.Value
           ?? ctx.User.FindFirst("user_id")?.Value;
  return Results.Ok(new { userId, hello = "secured world" });
});

app.Run();

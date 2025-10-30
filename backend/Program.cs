using Microsoft.AspNetCore.Authorization;
using Clerk.Net.AspNetCore.Security;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(opt =>
  opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();

// origin
builder.Services.AddCors(opts =>
{
  opts.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:3000")
     .AllowAnyHeader()
     .AllowAnyMethod());
});

//  Clerk authentication
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


/*postgresql://postgres:admin@localhost:5432/BudgetAppDB*/
using Clerk.BackendAPI;
using BudgetlyAI.Services;
using Microsoft.AspNetCore.Http.Features;


using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BudgetlyAI.Data;
using Microsoft.EntityFrameworkCore;


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


builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 200 * 1024 * 1024;
});


// Controllers
builder.Services.AddControllers();

// Postgres
builder.Services.AddDbContext<BudgetsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("BudgetsDb")));

// mongoDB
builder.Services.AddSingleton<MongoDbService>();

// ---
builder.Services.AddAuthorization();
builder.Services.AddHttpClient("AiIngest")
    .ConfigureHttpClient(c => { c.Timeout = TimeSpan.FromMinutes(20); });

builder.Services.AddHttpClient();

// Clerk
builder.Services.AddSingleton(_ =>
    new ClerkBackendApi(bearerAuth: builder.Configuration["Clerk:SecretKey"]!));
builder.Services.AddScoped<ClerkAuthService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var cfg = builder.Configuration.GetSection("Clerk");
        var issuer = cfg["Issuer"] ?? throw new InvalidOperationException("Clerk:Issuer missing");
        var jwksUrl = cfg["JwksUrl"] ?? throw new InvalidOperationException("Clerk:JwksUrl missing");
        var allowedAzp = cfg.GetSection("AuthorizedParties").Get<string[]>() ?? Array.Empty<string>();


        var http = new HttpClient();
        JsonWebKeySet? jwks = null;
        DateTimeOffset jwksFetched = DateTimeOffset.MinValue;

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {

                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {

                var azp = ctx.Principal?.FindFirst("azp")?.Value;
                if (!string.IsNullOrEmpty(azp) && allowedAzp.Length > 0 && !allowedAzp.Contains(azp))
                {
                    ctx.Fail("Invalid 'azp' claim");
                }
                return Task.CompletedTask;
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
            {

                if (jwks is null || (DateTimeOffset.UtcNow - jwksFetched).TotalMinutes > 10)
                {
                    var json = http.GetStringAsync(jwksUrl).GetAwaiter().GetResult();
                    jwks = new JsonWebKeySet(json);
                    jwksFetched = DateTimeOffset.UtcNow;
                }
                return jwks.Keys;
            }
        };
    });


builder.Configuration.AddEnvironmentVariables();


var app = builder.Build();

// Middleware

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

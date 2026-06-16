using Clerk.BackendAPI;

using Microsoft.AspNetCore.Http.Features;


using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BudgetlyAI.Data;
using Microsoft.EntityFrameworkCore;

using Serilog;
using BudgetlyAI.Services.Persistence;
using BudgetlyAI.Services.Auth;
using BudgetlyAI.Services.Transactions;
using BudgetlyAI.Services.Budgets;
using BudgetlyAI.Services.Dashboards;
using BudgetlyAI.Services.Ingest;
using BudgetlyAI.Services.Statements;
using MassTransit;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/budgetly_backend.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 14,
        shared: true)
    .CreateLogger();



var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();

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

//Services
builder.Services.AddScoped<IBudgetService, BudgetService>();

builder.Services.AddScoped<ITransactionService, TransactionService>();

builder.Services.AddScoped<IDashboardService, DashboardService>();

builder.Services.AddScoped<IDashboardQueryService, DashboardQueryService>();

builder.Services.AddScoped<INodeIngestClient, NodeIngestClient>();

builder.Services.AddScoped<IStatementFileStorage, StatementFileStorage>();
builder.Services.AddScoped<IStatementEventPublisher, MassTransitStatementEventPublisher>();
builder.Services.AddScoped<IStatementService, StatementService>();



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

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbitHost = builder.Configuration["RabbitMq:Host"] ?? "localhost";
        var rabbitUser = builder.Configuration["RabbitMq:Username"] ?? "guest";
        var rabbitPassword = builder.Configuration["RabbitMq:Password"] ?? "guest";

        cfg.Host(rabbitHost, "/", h =>
        {
            h.Username(rabbitUser);
            h.Password(rabbitPassword);
        });
    });
});

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

app.UseSerilogRequestLogging();

// Middleware
app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

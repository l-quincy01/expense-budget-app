using Clerk.BackendAPI;
using BudgetlyAI.Services;

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

// Controllers
builder.Services.AddControllers();

// Clerk SDK
builder.Services.AddSingleton(_ =>
    new ClerkBackendApi(bearerAuth: builder.Configuration["Clerk:SecretKey"]!));

// MongoDB
builder.Services.AddSingleton<MongoDbService>();

// Clerk auth helper
builder.Services.AddScoped<ClerkAuthService>();

var app = builder.Build();

// Middleware

app.UseCors("frontend");
app.MapControllers();

app.Run();

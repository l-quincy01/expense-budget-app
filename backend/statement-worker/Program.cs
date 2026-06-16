using MassTransit;
using Microsoft.EntityFrameworkCore;
using StatementWorker.Consumers;
using StatementWorker.Data;
using StatementWorker.Extraction;
using StatementWorker.Processing;
using StatementWorker.Retry;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<StatementWorkerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("BudgetsDb")));
builder.Services.AddHttpClient<IAiStatementExtractionClient, AiStatementExtractionClient>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(20);
});
builder.Services.AddSingleton<IDashboardReadModelWriter, MongoDashboardReadModelWriter>();
builder.Services.AddSingleton<IMessageRetryStatus, MassTransitMessageRetryStatus>();
builder.Services.AddSingleton<IDashboardCacheInvalidator, RedisDashboardCacheInvalidator>();
builder.Services.AddHttpClient<ITransactionSearchIndexer, ElasticsearchTransactionSearchIndexer>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<StatementUploadedConsumer>();

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

        cfg.ReceiveEndpoint("statement-uploaded", e =>
        {
            e.UseMessageRetry(r =>
                r.Interval(3, TimeSpan.FromSeconds(5)));
            e.ConfigureConsumer<StatementUploadedConsumer>(context);
        });
    });
});

var host = builder.Build();
host.Run();

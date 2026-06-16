using MassTransit;
using Microsoft.EntityFrameworkCore;
using StatementWorker.Consumers;
using StatementWorker.Data;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddDbContext<StatementWorkerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("BudgetsDb")));

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
            e.ConfigureConsumer<StatementUploadedConsumer>(context);
        });
    });
});

var host = builder.Build();
host.Run();

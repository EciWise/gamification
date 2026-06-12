using Microsoft.EntityFrameworkCore;
using Gamification.Infrastructure.Persistence;
using Gamification.Infrastructure.Persistence.Repositories;
using Gamification.Domain.Repositories;
using Gamification.Domain.Services;
using Gamification.Infrastructure.Messaging;
using Gamification.Infrastructure.Cache;
using StackExchange.Redis;
using System.Reflection;
using Microsoft.OpenApi.Models;

namespace Gamification.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Gamification Service API",
                Version = "v1",
                Description = "Microservice for managing gamification elements like points, achievements, and rankings.",
                Contact = new OpenApiContact
                {
                    Name = "Education Platform Team",
                    Email = "support@educationplatform.com"
                }
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                c.IncludeXmlComments(xmlPath);
            }
        });

        // Database
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        builder.Services.AddScoped<IUserGamificationRepository, UserGamificationRepository>();
        builder.Services.AddScoped<IAchievementDefinitionRepository, AchievementDefinitionRepository>();
        builder.Services.AddScoped<IGamificationRuleRepository, GamificationRuleRepository>();
        builder.Services.AddScoped<IRankingRepository, RankingRepository>();

        // Domain Services
        builder.Services.AddScoped<GamificationDomainService>();
        builder.Services.AddSingleton<IAchievementStrategyFactory, AchievementStrategyFactory>();

        // MediatR
        builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Gamification.Application.Handlers.AssignPointsCommandHandler).Assembly));

        // Redis
        builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
        {
            var connectionString = builder.Configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost";
            return ConnectionMultiplexer.Connect(connectionString);
        });
        builder.Services.AddScoped<IRankingCache, RedisRankingCache>();

        // Background Services
        builder.Services.AddHostedService<RabbitMqConsumer>();
        builder.Services.AddHostedService<OutboxWorker>();
builder.Services.AddHostedService<RankingJob>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }
}

// Inner class for strategy factory (could be moved to Domain/Services)
public class AchievementStrategyFactory : IAchievementStrategyFactory
{
    private readonly IEnumerable<IAchievementStrategy> _strategies;

    public AchievementStrategyFactory()
    {
        _strategies = new List<IAchievementStrategy>
        {
            new FirstTutoringStrategy(),
            new ActiveCollaboratorStrategy(),
            new OutstandingTutorStrategy(),
            new MentorOfMonthStrategy()
        };
    }

    public IAchievementStrategy GetStrategy(string strategyKey)
    {
        return _strategies.FirstOrDefault(s => s.StrategyKey == strategyKey)
               ?? throw new Exception($"Strategy {strategyKey} not found");
    }
}

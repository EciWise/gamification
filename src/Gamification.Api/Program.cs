using Microsoft.EntityFrameworkCore;
using Gamification.Infrastructure.Persistence;
using Gamification.Infrastructure.Persistence.Repositories;
using Gamification.Domain.Repositories;
using Gamification.Domain.Services;
using Gamification.Infrastructure.Messaging;
using Gamification.Infrastructure.Cache;
using Gamification.Infrastructure.Security;
using StackExchange.Redis;
using System.Reflection;
using Microsoft.OpenApi.Models;

namespace Gamification.Api;

public class Program
{
    public static void Main(string[] args)
    {
        // Load .env file if it exists, traversing upwards to find it
        var currentDirectory = Directory.GetCurrentDirectory();
        var directory = new DirectoryInfo(currentDirectory);
        while (directory != null && !File.Exists(Path.Combine(directory.FullName, ".env")))
        {
            directory = directory.Parent;
        }

        if (directory != null)
        {
            var dotenvPath = Path.Combine(directory.FullName, ".env");
            foreach (var line in File.ReadAllLines(dotenvPath))
            {
                var parts = line.Split('=', 2, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 && !line.TrimStart().StartsWith("#"))
                {
                    Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
                }
            }
        }

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

        // Resolve Connection String
        var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION");
        if (string.IsNullOrEmpty(connectionString))
        {
            var dbHost = Environment.GetEnvironmentVariable("POSTGRES_HOST");
            var dbPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
            var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB");
            var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
            var dbPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");

            if (!string.IsNullOrEmpty(dbHost) && !string.IsNullOrEmpty(dbName) && !string.IsNullOrEmpty(dbUser))
            {
                connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass};";
            }
            else
            {
                connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            }
        }

        // Database
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        builder.Services.AddScoped<IUserGamificationRepository, UserGamificationRepository>();
        builder.Services.AddScoped<IAchievementDefinitionRepository, AchievementDefinitionRepository>();
        builder.Services.AddScoped<IGamificationRuleRepository, GamificationRuleRepository>();
        builder.Services.AddScoped<IRankingRepository, RankingRepository>();

        // JWT Validation (Security)
        var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                        ?? builder.Configuration.GetValue<string>("Jwt:SecretKey")
                        ?? "your-super-secret-key-min-32-characters-long!!!";
        var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                     ?? builder.Configuration.GetValue<string>("Jwt:Issuer");
        var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                       ?? builder.Configuration.GetValue<string>("Jwt:Audience");

        builder.Services.AddSingleton<IJwtValidator>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<JwtValidator>>();
            return new JwtValidator(jwtSecretKey, jwtIssuer, jwtAudience, logger);
        });

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

        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            try
            {
                dbContext.Database.EnsureCreated();
            }
            catch (Exception ex)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while creating/initializing the database.");
            }
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

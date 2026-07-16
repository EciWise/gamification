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
    protected Program() { }

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
                if (parts.Length == 2 && !line.TrimStart().StartsWith('#'))
                {
                    Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
                }
            }
        }

        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        // Orígenes permitidos para CORS: configurables por entorno para no exponer
        // el API a cualquier origen. Por defecto, el front local.
        var corsOrigins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
                           ?? Environment.GetEnvironmentVariable("FRONTEND_URL")
                           ?? "http://localhost:4200")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod());
        });
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
        var connectionString = Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
                            ?? builder.Configuration.GetConnectionString("DefaultConnection");

        // Database
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        builder.Services.AddScoped<IUserGamificationRepository, UserGamificationRepository>();
        builder.Services.AddScoped<IAchievementDefinitionRepository, AchievementDefinitionRepository>();
        builder.Services.AddScoped<IGamificationRuleRepository, GamificationRuleRepository>();
        builder.Services.AddScoped<IRankingRepository, RankingRepository>();
        builder.Services.AddScoped<IUserAchievementRepository, UserAchievementRepository>();

        // Secreto para validar los JWT: se toma de configuración o entorno, sin un
        // valor por defecto embebido, para no dejar credenciales en el código.
        var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                        ?? builder.Configuration.GetValue<string>("Jwt:SecretKey")
                        ?? throw new InvalidOperationException(
                            "JWT secret no configurado. Define JWT_SECRET_KEY.");
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
            var redisConnStr = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")
                            ?? builder.Configuration.GetValue<string>("Redis:ConnectionString") 
                            ?? "localhost";
            return ConnectionMultiplexer.Connect(redisConnStr);
        });
        builder.Services.AddScoped<IRankingCache, RedisRankingCache>();

        // RabbitMQ producer (publica notificaciones hacia el servicio notifications)
        builder.Services.AddSingleton<IRabbitMqConnectionProvider, RabbitMqConnectionProvider>();
        builder.Services.AddSingleton<IRabbitMqProducer, RabbitMqProducer>();

        // Background Services
        builder.Services.AddHostedService<RabbitMqConsumer>();
        builder.Services.AddHostedService<OutboxWorker>();
        builder.Services.AddHostedService<RankingJob>();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gamification Service API v1");
            c.RoutePrefix = "swagger";
        });

        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            try
            {
                dbContext.Database.EnsureCreated();
                SeedLevels(dbContext);
                SeedAchievements(dbContext);
            }
            catch (Exception ex)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while creating/initializing the database.");
            }
        }

        app.UseHttpsRedirection();
        app.UseCors();
        app.UseAuthorization();
        app.MapControllers();

        app.Run();
    }

    /// <summary>
    /// Siembra una escalera mínima de niveles si la tabla está vacía, para que la
    /// detección de subida de nivel y la provisión de usuarios funcionen sin
    /// configuración manual. Att Daniel
    /// </summary>
    private static void SeedLevels(AppDbContext dbContext)
    {
        if (dbContext.LevelDefinitions.Any())
        {
            return;
        }

        dbContext.LevelDefinitions.AddRange(
            new Gamification.Domain.Entities.LevelDefinition(Guid.NewGuid(), "Inicial", new Gamification.Domain.ValueObjects.Points(0)),
            new Gamification.Domain.Entities.LevelDefinition(Guid.NewGuid(), "Aprendiz", new Gamification.Domain.ValueObjects.Points(50)),
            new Gamification.Domain.Entities.LevelDefinition(Guid.NewGuid(), "Colaborador", new Gamification.Domain.ValueObjects.Points(150)),
            new Gamification.Domain.Entities.LevelDefinition(Guid.NewGuid(), "Experto", new Gamification.Domain.ValueObjects.Points(400))
        );
        dbContext.SaveChanges();
    }

    /// <summary>
    /// Siembra las definiciones de logros si la tabla está vacía. El StrategyKey de
    /// cada una debe coincidir con una estrategia registrada en
    /// AchievementStrategyFactory.
    /// </summary>
    private static void SeedAchievements(AppDbContext dbContext)
    {
        Gamification.Domain.Aggregates.AchievementDefinition Def(string name, string desc, string strategyKey) =>
            new Gamification.Domain.Aggregates.AchievementDefinition(
                Guid.NewGuid(), name, desc, string.Empty, strategyKey,
                new Gamification.Domain.ValueObjects.CriteriaConfig("{}"), true);

        // Idempotente por StrategyKey: solo inserta las definiciones que aún no
        // existan, para que bases de datos ya creadas reciban los logros nuevos.
        var seeds = new[]
        {
            // Estudiante — tutorías
            Def("Primera clase", "Asiste a tu primera tutoría", "FIRST_LESSON_ATTENDED"),
            Def("Aprendiz dedicado", "Asiste a 10 tutorías", "DEDICATED_LEARNER"),
            // Estudiante — materiales
            Def("Primer aporte", "Sube tu primer material", "FIRST_MATERIAL"),
            Def("Colaborador activo", "Aprueba 5 materiales", "ACTIVE_COLLABORATOR"),
            // Estudiante — juegos
            Def("Buscador de aventuras", "Juega tu primer mini-juego del Centro de Juegos", "FIRST_GAME"),
            // Práctica (quizzes)
            Def("Mente inquieta", "Completa tu primer quiz de práctica", "FIRST_QUIZ"),
            Def("Maestro del quiz", "Completa 10 quizzes de práctica", "QUIZ_MASTER"),
            // Aprendizaje (sesiones de estudio)
            Def("Primer repaso", "Completa tu primera sesión de estudio", "FIRST_STUDY"),
            Def("Estudiante constante", "Completa 10 sesiones de estudio", "CONSISTENT_STUDENT"),
            // Tutor — tutorías dictadas y calificaciones
            Def("Primera tutoría", "Dicta tu primera tutoría", "FIRST_TUTORING"),
            Def("Tutor experimentado", "Dicta 10 tutorías", "EXPERIENCED_TUTOR"),
            Def("Primera reseña", "Recibe tu primera calificación como tutor", "FIRST_RATING"),
            Def("Tutor destacado", "Recibe 10 tutorías calificadas", "OUTSTANDING_TUTOR"),
            // Ambos roles — hitos por puntos
            Def("Centurión", "Acumula 100 puntos", "POINTS_100"),
            Def("Imparable", "Acumula 500 puntos", "POINTS_500"),
            // Perfil — completar el perfil de IA
            Def("La IA ya sabe dónde vives", "Completa tu perfil de IA; ahora el algoritmo te conoce mejor que tu propia madre", "AI_PROFILE_COMPLETED"),
            // Ayuda — abrir una pregunta del Centro de Ayuda
            Def("Perdidasss, andamos perdidasss!", "Abriste tu primera pregunta del Centro de Ayuda. Tranqui: aquí siempre encuentras el camino de vuelta", "HELP_QUESTION_OPENED"),
            // Perfil — completar la información de carrera (para estudiantes)
            Def("Hasta que la muerte los separe","Completaste la información de tu carrera", "CAREER_INFO_COMPLETED")
        };

        var existingKeys = dbContext.AchievementDefinitions
            .Select(a => a.StrategyKey)
            .ToHashSet();

        var missing = seeds.Where(s => !existingKeys.Contains(s.StrategyKey)).ToList();
        if (missing.Count == 0)
        {
            return;
        }

        dbContext.AchievementDefinitions.AddRange(missing);
        dbContext.SaveChanges();
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
            // Estudiante
            new FirstLessonAttendedStrategy(),
            new DedicatedLearnerStrategy(),
            new FirstMaterialStrategy(),
            new ActiveCollaboratorStrategy(),
            new FirstGameStrategy(),
            // Práctica y aprendizaje
            new FirstQuizStrategy(),
            new QuizMasterStrategy(),
            new FirstStudyStrategy(),
            new ConsistentStudentStrategy(),
            // Tutor
            new FirstTutoringStrategy(),
            new ExperiencedTutorStrategy(),
            new FirstRatingStrategy(),
            new OutstandingTutorStrategy(),
            // Ambos
            new Points100Strategy(),
            new Points500Strategy(),
            new MentorOfMonthStrategy(),
            // Perfil
            new AiProfileCompletedStrategy(),
            // Ayuda
            new HelpQuestionOpenedStrategy()
        };
    }

    public IAchievementStrategy GetStrategy(string strategyKey)
    {
        return _strategies.FirstOrDefault(s => s.StrategyKey == strategyKey)
               ?? throw new InvalidOperationException($"Strategy {strategyKey} not found");
    }
}

using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;
using Gamification.Infrastructure.Persistence;
using Gamification.Infrastructure.Security;

namespace Gamification.Infrastructure.Messaging
{
    public class RabbitMqConsumer : BackgroundService
    {
        private readonly ILogger<RabbitMqConsumer> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IJwtValidator _jwtValidator;
        private IConnection? _connection;
        private IChannel? _channel;

        /// <summary>Exchange interno de eventos de dominio (tutoring/materials).</summary>
        private const string InternalEventsExchange = "eciwise.events";

        /// <summary>Routing keys de eventos de dominio que premia gamificación.</summary>
        private static readonly string[] InternalRoutingKeys =
        {
            "tutoria.realizada",
            "tutoria.dictada",
            "tutoria.calificada",
            "material.aprobado"
        };

        public RabbitMqConsumer(ILogger<RabbitMqConsumer> logger, IServiceProvider serviceProvider, IJwtValidator jwtValidator)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _jwtValidator = jwtValidator;
        }

        private async Task InitializeRabbitMqListenerAsync(CancellationToken stoppingToken)
        {
            var host = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
            var user = Environment.GetEnvironmentVariable("RABBITMQ_USER") ?? "guest";
            var pass = Environment.GetEnvironmentVariable("RABBITMQ_PASS") ?? "guest";

            var factory = new ConnectionFactory 
            { 
                HostName = host,
                UserName = user,
                Password = pass
            };

            int retryCount = 0;
            int maxRetries = 10;
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Connecting to RabbitMQ at {Host}...", host);
                    _connection = await factory.CreateConnectionAsync(stoppingToken);
                    _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);
                    await _channel.QueueDeclareAsync(queue: "gamification_events_queue", durable: true, exclusive: false, autoDelete: false, arguments: null, cancellationToken: stoppingToken);

                    // Bus de eventos de dominio interno (tutoring/materials). Estos
                    // eventos llegan por un exchange topic dedicado y se consideran de
                    // confianza (no requieren JWT, ver ExecuteAsync).
                    await _channel.ExchangeDeclareAsync(InternalEventsExchange, ExchangeType.Topic, durable: true, autoDelete: false, cancellationToken: stoppingToken);
                    foreach (var routingKey in InternalRoutingKeys)
                    {
                        await _channel.QueueBindAsync("gamification_events_queue", InternalEventsExchange, routingKey, cancellationToken: stoppingToken);
                    }

                    _logger.LogInformation("Successfully connected to RabbitMQ.");
                    return;
                }
                catch (Exception ex)
                {
                    retryCount++;
                    if (retryCount >= maxRetries)
                    {
                        _logger.LogError(ex, "Failed to connect to RabbitMQ after {MaxRetries} attempts.", maxRetries);
                        throw;
                    }
                    _logger.LogWarning("RabbitMQ connection failed. Retrying in 5 seconds... ({RetryCount}/{MaxRetries})", retryCount, maxRetries);
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await InitializeRabbitMqListenerAsync(stoppingToken);

            var channel = _channel;
            if (channel == null)
            {
                _logger.LogError("RabbitMQ channel is null after initialization.");
                return;
            }

            var consumer = new AsyncEventingBasicConsumer(channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                _logger.LogInformation("Received external event: {Message}", message);

                try
                {
                    // Los eventos de dominio internos llegan por el exchange de confianza
                    // `eciwise.events` (publicados por otros microservicios, sin JWT de
                    // usuario). El resto de mensajes sí requiere un JWT válido.
                    var isInternalEvent = ea.Exchange == InternalEventsExchange;
                    if (!isInternalEvent)
                    {
                        var jwtToken = ExtractJwtFromHeaders(ea.BasicProperties);
                        if (string.IsNullOrWhiteSpace(jwtToken))
                        {
                            _logger.LogWarning("Rejecting message: JWT token not found in message headers.");
                            await channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false, cancellationToken: stoppingToken);
                            return;
                        }

                        if (!_jwtValidator.ValidateToken(jwtToken, out _))
                        {
                            _logger.LogWarning("Rejecting message: JWT token validation failed.");
                            await channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false, cancellationToken: stoppingToken);
                            return;
                        }
                    }

                    var eventPayload = JsonDocument.Parse(message).RootElement;
                    var eventType = eventPayload.GetProperty("eventType").GetString();
                    var eventIdRaw = eventPayload.GetProperty("eventId").GetString();

                    if (string.IsNullOrWhiteSpace(eventType) || !Guid.TryParse(eventIdRaw, out var eventId))
                    {
                        _logger.LogWarning("Rejecting malformed message: missing eventType or eventId.");
                        await channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false, cancellationToken: stoppingToken);
                        return;
                    }

                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    if (await dbContext.ProcessedEvents.AnyAsync(e => e.EventId == eventId, cancellationToken: stoppingToken))
                    {
                        _logger.LogWarning("Event {EventId} already processed. Skipping.", eventId);
                        await channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
                        return;
                    }

                    // Route event to appropriate command handler
                    switch (eventType)
                    {
                        case "LessonCompleted":
                            await HandleLessonCompletedAsync(eventPayload, mediator, stoppingToken);
                            break;

                        case "TutorshipDictated":
                            await HandleTutorshipDictatedAsync(eventPayload, mediator, stoppingToken);
                            break;

                        case "QuizPassed":
                            await HandleQuizPassedAsync(eventPayload, mediator, stoppingToken);
                            break;

                        case "TutorshipRated":
                            await HandleTutorshipRatedAsync(eventPayload, mediator, stoppingToken);
                            break;

                        case "ForumPostCreated":
                            await HandleForumPostCreatedAsync(eventPayload, mediator, stoppingToken);
                            break;

                        // Eventos de dominio internos (exchange eciwise.events).
                        case "tutoria.realizada":
                            await HandleDomainPointsAsync(eventPayload, mediator, ActionType.TutoriaCompletada, 10, "Tutoría completada", stoppingToken);
                            break;

                        case "tutoria.dictada":
                            await HandleDomainPointsAsync(eventPayload, mediator, ActionType.TutoriaDictada, 15, "Tutoría dictada", stoppingToken);
                            break;

                        case "tutoria.calificada":
                            await HandleDomainPointsAsync(eventPayload, mediator, ActionType.TutoriaCalificada, 25, "Tutoría calificada", stoppingToken);
                            break;

                        case "material.aprobado":
                            await HandleDomainPointsAsync(eventPayload, mediator, ActionType.MaterialAprobado, 20, "Material aprobado", stoppingToken);
                            break;

                        default:
                            _logger.LogWarning("Unknown event type: {EventType}. Skipping.", eventType);
                            break;
                    }

                    dbContext.ProcessedEvents.Add(new Persistence.ProcessedEvent
                    {
                        EventId = eventId,
                        EventType = eventType,
                        ProcessedAt = DateTime.UtcNow
                    });
                    await dbContext.SaveChangesAsync(stoppingToken);
                    
                    await channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing RabbitMQ message.");
                    await channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false, cancellationToken: stoppingToken);
                }
            };

            await channel.BasicConsumeAsync(queue: "gamification_events_queue", autoAck: false, consumer: consumer, cancellationToken: stoppingToken);
        }

        private async Task HandleLessonCompletedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            // Event structure from Study Service:
            // { eventId, userId, eventType: "LessonCompleted", lessonId, subject, score, completedAt }

            var userId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var lessonId = eventPayload.TryGetProperty("lessonId", out var lesson) ? lesson.GetString() : "unknown";
            var score = eventPayload.TryGetProperty("score", out var s) ? s.GetDouble() : 0;

            var description = $"Lección completada: {lessonId} (Calificación: {score:F1})";

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = 10,
                ActionType = ActionType.TutoriaCompletada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleTutorshipDictatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            // Event structure from Tutoring Service:
            // { eventId, userId (tutorId), eventType: "TutorshipDictated", studentId, duration, subject, startedAt }

            var tutorId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var studentId = eventPayload.TryGetProperty("studentId", out var student) ? student.GetString() : "unknown";
            var duration = eventPayload.TryGetProperty("duration", out var dur) ? dur.GetInt32() : 0;

            var description = $"Tutoría dictada a {studentId} ({duration} minutos)";

            var command = new AssignPointsCommand
            {
                UserId = tutorId,
                Points = 15,
                ActionType = ActionType.TutoriaDictada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleQuizPassedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            // Event structure from Assessment Service:
            // { eventId, userId, eventType: "QuizPassed", quizId, score, passingScore, subject, completedAt }

            var userId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var quizId = eventPayload.TryGetProperty("quizId", out var quiz) ? quiz.GetString() : "unknown";
            var score = eventPayload.TryGetProperty("score", out var s) ? s.GetDouble() : 0;

            var description = $"Quiz aprobado: {quizId} (Puntuación: {score:F1})";

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = 20,
                ActionType = ActionType.MaterialAprobado,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleTutorshipRatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            // Event structure from Tutoring Service:
            // { eventId, userId (tutorId), eventType: "TutorshipRated", studentId, rating (1-5), comment, ratedAt }

            var tutorId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var ratingValue = eventPayload.TryGetProperty("rating", out var rating) ? rating.GetInt32() : 3;
            var studentId = eventPayload.TryGetProperty("studentId", out var student) ? student.GetString() : "unknown";
            var points = ratingValue >= 4 ? 25 : 10;

            var description = $"Tutoría calificada por {studentId}: {ratingValue}⭐";

            var command = new AssignPointsCommand
            {
                UserId = tutorId,
                Points = points,
                ActionType = ActionType.TutoriaCalificada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleForumPostCreatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            // Event structure from Forum Service:
            // { eventId, userId, eventType: "ForumPostCreated", postId, title, categoryId, createdAt, isReply }

            var userId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var postId = eventPayload.TryGetProperty("postId", out var post) ? post.GetString() : "unknown";
            var title = eventPayload.TryGetProperty("title", out var t) ? t.GetString() : "Sin título";
            var isReply = eventPayload.TryGetProperty("isReply", out var reply) ? reply.GetBoolean() : false;

            var description = isReply ? $"Respuesta en foro: {title}" : $"Post en foro: {title}";

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = 5,
                ActionType = ActionType.ForoPublicado,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        /// <summary>
        /// Asigna puntos por un evento de dominio interno. Si existe una
        /// `GamificationRule` activa para el ActionType usa sus puntos; si no, usa
        /// el valor por defecto recibido.
        /// </summary>
        private async Task HandleDomainPointsAsync(
            JsonElement eventPayload,
            IMediator mediator,
            ActionType actionType,
            int defaultPoints,
            string description,
            CancellationToken cancellationToken)
        {
            var userId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!);
            var sourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!);

            var command = new AssignPointsCommand
            {
                UserId = userId,
                Points = defaultPoints,
                ActionType = actionType,
                SourceEventId = sourceEventId,
                Description = description
            };
            await mediator.Send(command, cancellationToken);
        }

        /// <summary>
        /// Extrae el JWT del header "x-jwt-token" del mensaje de RabbitMQ.
        /// </summary>
        private static string? ExtractJwtFromHeaders(IReadOnlyBasicProperties? basicProperties)
        {
            if (basicProperties?.Headers == null || !basicProperties.Headers.ContainsKey("x-jwt-token"))
                return null;

            var headerValue = basicProperties.Headers["x-jwt-token"];
            if (headerValue is byte[] jwtBytes)
                return Encoding.UTF8.GetString(jwtBytes);

            return headerValue?.ToString();
        }

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
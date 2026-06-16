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
                    // Validar JWT desde los headers del mensaje
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

                    var eventPayload = JsonDocument.Parse(message).RootElement;
                    var eventType = eventPayload.GetProperty("eventType").GetString();

                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    
                    var eventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString());
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
            var command = new AssignPointsCommand
            {
                UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!),
                Points = 10,
                ActionType = ActionType.TutoriaCompletada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = "Puntos por completar lección"
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleTutorshipDictatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            var command = new AssignPointsCommand
            {
                UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!),
                Points = 15,
                ActionType = ActionType.TutoriaDictada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = "Puntos por dictar tutoría"
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleQuizPassedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            var command = new AssignPointsCommand
            {
                UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!),
                Points = 20,
                ActionType = ActionType.MaterialAprobado,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = "Puntos por aprobar quiz"
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleTutorshipRatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            var ratingValue = eventPayload.GetProperty("rating").GetInt32();
            var points = ratingValue >= 4 ? 25 : 10;

            var command = new AssignPointsCommand
            {
                UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!),
                Points = points,
                ActionType = ActionType.TutoriaCalificada,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = $"Puntos por tutoría calificada con {ratingValue} estrellas"
            };
            await mediator.Send(command, cancellationToken);
        }

        private async Task HandleForumPostCreatedAsync(JsonElement eventPayload, IMediator mediator, CancellationToken cancellationToken)
        {
            var command = new AssignPointsCommand
            {
                UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()!),
                Points = 5,
                ActionType = ActionType.ForoPublicado,
                SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()!),
                Description = "Puntos por publicar en el foro"
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
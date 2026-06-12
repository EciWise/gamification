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

namespace Gamification.Infrastructure.Messaging
{
    public class RabbitMqConsumer : BackgroundService
    {
        private readonly ILogger<RabbitMqConsumer> _logger;
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMqConsumer(ILogger<RabbitMqConsumer> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
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

                    if (eventType == "LessonCompleted")
                    {
                        var command = new AssignPointsCommand
                        {
                            UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()),
                            Points = 10,
                            ActionType = ActionType.TutoriaCompletada,
                            SourceEventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString()),
                            Description = "Puntos por completar lección"
                        };

                        await mediator.Send(command, stoppingToken);
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

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
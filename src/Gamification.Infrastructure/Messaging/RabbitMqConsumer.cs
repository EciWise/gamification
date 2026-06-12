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
        private IConnection _connection;
        private IChannel _channel;

        public RabbitMqConsumer(ILogger<RabbitMqConsumer> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        private async Task InitializeRabbitMqListenerAsync()
        {
            var factory = new ConnectionFactory { HostName = "localhost" }; // Configured via IOptions in real project
            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();
            await _channel.QueueDeclareAsync(queue: "gamification_events_queue", durable: true, exclusive: false, autoDelete: false, arguments: null);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await InitializeRabbitMqListenerAsync();

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                
                _logger.LogInformation("Received external event: {Message}", message);

                try
                {
                    // This is a naive deserialization for scaffolding demonstration.
                    var eventPayload = JsonDocument.Parse(message).RootElement;
                    var eventType = eventPayload.GetProperty("eventType").GetString();

                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                    
                    var eventId = Guid.Parse(eventPayload.GetProperty("eventId").GetString());
                    if (await dbContext.ProcessedEvents.AnyAsync(e => e.EventId == eventId))
                    {
                        _logger.LogWarning("Event {EventId} already processed. Skipping.", eventId);
                        await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
                        return;
                    }

                    if (eventType == "LessonCompleted")
                    {
                        var command = new AssignPointsCommand
                        {
                            UserId = Guid.Parse(eventPayload.GetProperty("userId").GetString()),
                            Points = 10, // Or query rule via repository
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
                    
                    await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing RabbitMQ message.");
                    // Manage dead letter queue or basic nack based on retries
                    await _channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                }
            };

            await _channel.BasicConsumeAsync(queue: "gamification_events_queue", autoAck: false, consumer: consumer);
        }

        public override void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
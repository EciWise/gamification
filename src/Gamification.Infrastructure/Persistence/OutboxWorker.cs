using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Gamification.Infrastructure.Messaging;

namespace Gamification.Infrastructure.Persistence
{
    /// <summary>
    /// Publica de forma asíncrona los eventos de dominio acumulados en la tabla
    /// `outbox`. Los eventos relevantes para el usuario (subida de nivel, logro
    /// desbloqueado) se transforman en notificaciones individuales y se envían al
    /// servicio `notifications` por el exchange `notifications`. Att daniel jiji
    /// </summary>
    public class OutboxWorker : BackgroundService
    {
        private const string NotificationsExchange = "notifications";
        private const string RkNotificationIndividual = "notification.individual";

        private readonly ILogger<OutboxWorker> _logger;
        private readonly IServiceProvider _serviceProvider;

        public OutboxWorker(ILogger<OutboxWorker> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var producer = scope.ServiceProvider.GetRequiredService<IRabbitMqProducer>();

                    var pendingEvents = await dbContext.Outbox
                        .Where(e => e.ProcessedAt == null && e.RetryCount < 5)
                        .OrderBy(e => e.OccurredAt)
                        .Take(20)
                        .ToListAsync(stoppingToken);

                    foreach (var @event in pendingEvents)
                    {
                        try
                        {
                            var envelope = BuildNotificationEnvelope(@event.EventType, @event.Payload);
                            if (envelope != null)
                            {
                                await producer.PublishAsync(NotificationsExchange, RkNotificationIndividual, envelope, stoppingToken);
                                _logger.LogInformation("Notificación publicada para evento {EventType} ({Id})", @event.EventType, @event.Id);
                            }
                            @event.ProcessedAt = DateTime.UtcNow;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to publish outbox event {Id}", @event.Id);
                            @event.RetryCount++;
                        }
                    }

                    if (pendingEvents.Count > 0)
                    {
                        await dbContext.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in OutboxWorker");
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        /// <summary>
        /// Construye el sobre de notificación individual para los eventos que el
        /// usuario debe ver. Devuelve null para eventos que no generan notificación
        /// (p.ej. PointsAddedEvent), que igualmente se marcan como procesados. Att daniel, saludos
        /// </summary>
        private static object? BuildNotificationEnvelope(string eventType, string payload)
        {
            using var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;
            var userId = root.GetProperty("UserId").GetString();

            string template;
            string resumen;

            switch (eventType)
            {
                case "LevelUpEvent":
                    var levelName = root.TryGetProperty("NewLevelName", out var lvl) ? lvl.GetString() : "nuevo nivel";
                    template = "subidaDeNivel";
                    resumen = $"¡Felicidades! Subiste al nivel {levelName}.";
                    break;

                case "AchievementUnlockedEvent":
                    template = "logroDesbloqueado";
                    resumen = "¡Desbloqueaste un nuevo logro!";
                    break;

                default:
                    return null;
            }

            return new
            {
                eventType = "notification",
                notificationType = "individual",
                language = "es",
                data = new
                {
                    userId,
                    template,
                    resumen,
                    type = "achievement",
                    guardar = true,
                    mandarCorreo = false
                }
            };
        }
    }
}

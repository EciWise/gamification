using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using System.Text;
using Gamification.Infrastructure.Messaging;

namespace Gamification.Infrastructure.Persistence
{
    public class OutboxWorker : BackgroundService
    {
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

                    var pendingEvents = await dbContext.Outbox
                        .Where(e => e.ProcessedAt == null && e.RetryCount < 5)
                        .OrderBy(e => e.OccurredAt)
                        .Take(20)
                        .ToListAsync(stoppingToken);

                    if (pendingEvents.Any())
                    {
                        // In a real implementation we would inject IRabbitMqProducer
                        _logger.LogInformation("Processing {Count} outbox events", pendingEvents.Count);

                        foreach (var @event in pendingEvents)
                        {
                            try
                            {
                                // Simulate publishing
                                _logger.LogInformation("Publishing event {EventType} for aggregate {AggregateId}", @event.EventType, @event.AggregateId);

                                @event.ProcessedAt = DateTime.UtcNow;
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to publish outbox event {Id}", @event.Id);
                                @event.RetryCount++;
                            }
                        }

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
    }
}

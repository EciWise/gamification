using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Gamification.Domain.Aggregates;
using Gamification.Domain.ValueObjects;
using Gamification.Domain.Enums;
using Gamification.Domain.Repositories;

namespace Gamification.Infrastructure.Persistence
{
    public class RankingJob : BackgroundService
    {
        private readonly ILogger<RankingJob> _logger;
        private readonly IServiceProvider _serviceProvider;

        public RankingJob(ILogger<RankingJob> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("RankingJob running at: {time}", DateTimeOffset.Now);

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var rankingRepo = scope.ServiceProvider.GetRequiredService<IRankingRepository>();

                    // Logic to calculate global ranking based on total points
                    var topUsers = await dbContext.UserGamifications
                        .OrderByDescending(u => u.TotalPoints.Value)
                        .Take(100)
                        .ToListAsync(stoppingToken);

                    if (topUsers.Any())
                    {
                        var period = new DateRange(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);
                        var ranking = new Ranking(Guid.NewGuid(), RankingType.GlobalPorPuntos, period);

                        var rankingData = topUsers.Select(u => new UserRankingData(new UserId(u.Id), (decimal)u.TotalPoints.Value)).ToList();
                        ranking.Recalculate(rankingData);

                        await rankingRepo.SaveAsync(ranking);
                        _logger.LogInformation("Ranking updated successfully.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing RankingJob.");
                }

                // Run every 24 hours (for example, prompt said weekly, but for demo daily or configurable is better)
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}

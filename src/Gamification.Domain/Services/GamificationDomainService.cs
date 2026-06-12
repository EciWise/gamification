using System;
using System.Collections.Generic;
using System.Linq;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.Enums;
using Gamification.Domain.Events;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Services
{
    public class GamificationDomainService
    {
        private readonly IAchievementStrategyFactory _strategyFactory;

        public GamificationDomainService(IAchievementStrategyFactory strategyFactory)
        {
            _strategyFactory = strategyFactory;
        }

        public PointTransaction AssignPoints(UserGamification user, GamificationRule rule, string idempotencyKey, Guid sourceEventId)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));
            if (rule == null) throw new ArgumentNullException(nameof(rule));

            var transaction = new PointTransaction(
                Guid.NewGuid(),
                user.UserId,
                rule.PointsAwarded,
                rule.ActionType,
                new EventDescription($"Points for {rule.ActionType}"),
                sourceEventId,
                new IdempotencyKey(idempotencyKey),
                DateTime.UtcNow);

            user.AddPoints(transaction);
            user.IncrementStat(rule.ActionType);

            return transaction;
        }

        public List<UserAchievement> EvaluateAchievements(
            UserGamification user,
            List<UserActionStat> stats,
            List<AchievementDefinition> definitions,
            AchievementContext context)
        {
            var newAchievements = new List<UserAchievement>();
            var userStats = stats.ToArray();

            foreach (var definition in definitions)
            {
                var strategy = _strategyFactory.GetStrategy(definition.StrategyKey);
                if (strategy.Evaluate(user, userStats, definition.CriteriaConfig, context))
                {
                    var achievement = user.UnlockAchievement(definition);
                    newAchievements.Add(achievement);
                }
            }

            return newAchievements;
        }

        public bool CheckLevelUp(UserGamification user, List<LevelDefinition> levels)
        {
            var nextLevel = levels
                .Where(l => l.MinPoints.Value <= user.TotalPoints.Value)
                .OrderByDescending(l => l.MinPoints.Value)
                .FirstOrDefault();

            if (nextLevel != null && nextLevel.Id != user.CurrentLevel.Id)
            {
                // In a real implementation we would have a method in UserGamification to update level
                // user.SetLevel(nextLevel);
                return true;
            }

            return false;
        }

        public bool DetectLowRating(UserGamification user, decimal averageRating, decimal threshold = 3.5m)
        {
            if (averageRating < threshold)
            {
                // user.RaiseDomainEvent(new LowRatingAlertEvent(user.Id, averageRating, threshold));
                return true;
            }
            return false;
        }
    }
}

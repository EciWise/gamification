using System;
using System.Collections.Generic;
using Gamification.Domain.Aggregates;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Services
{
    public interface IAchievementStrategy
    {
        string StrategyKey { get; }
        bool Evaluate(UserGamification user, UserActionStat[] stats, CriteriaConfig config, AchievementContext context);
    }

    public interface IAchievementStrategyFactory
    {
        IAchievementStrategy GetStrategy(string strategyKey);
    }
}

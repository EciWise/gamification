using System;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Events
{
    public class AchievementUnlockedEvent : DomainEvent
    {
        public Guid AchievementId { get; }

        public AchievementUnlockedEvent(Guid userId, Guid achievementId) : base(userId)
        {
            AchievementId = achievementId;
        }
    }

    public class LevelUpEvent : DomainEvent
    {
        public string NewLevelName { get; }

        public LevelUpEvent(Guid userId, string newLevelName) : base(userId)
        {
            NewLevelName = newLevelName;
        }
    }

    public class LowRatingAlertEvent : DomainEvent
    {
        public decimal CurrentAverage { get; }
        public decimal Threshold { get; }

        public LowRatingAlertEvent(Guid userId, decimal currentAverage, decimal threshold) : base(userId)
        {
            CurrentAverage = currentAverage;
            Threshold = threshold;
        }
    }
}

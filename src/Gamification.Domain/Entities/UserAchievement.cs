using System;
using Gamification.Domain.Aggregates;

namespace Gamification.Domain.Entities
{
    public class UserAchievement : Entity
    {
        public ValueObjects.UserId UserId { get; private set; } = null!;
        public AchievementDefinition Achievement { get; private set; } = null!;
        public DateTime UnlockedAt { get; private set; }

        private UserAchievement() { }

        public UserAchievement(Guid id, ValueObjects.UserId userId, AchievementDefinition achievement, DateTime unlockedAt)
            : base(id)
        {
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Achievement = achievement ?? throw new ArgumentNullException(nameof(achievement));
            UnlockedAt = unlockedAt;
        }
    }
}
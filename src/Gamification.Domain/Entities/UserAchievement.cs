using System;
using Gamification.Domain.Aggregates;

namespace Gamification.Domain.Entities
{
    public class UserAchievement : Entity
    {
        public ValueObjects.UserId UserId { get; private set; }
        public AchievementDefinition Achievement { get; private set; }
        public DateTime UnlockedAt { get; private set; }

        // Constructor de materialización para EF Core.
        private UserAchievement()
        {
            UserId = null!;
            Achievement = null!;
        }

        public UserAchievement(Guid id, ValueObjects.UserId userId, AchievementDefinition achievement, DateTime unlockedAt)
            : base(id)
        {
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Achievement = achievement ?? throw new ArgumentNullException(nameof(achievement));
            UnlockedAt = unlockedAt;
        }
    }
}
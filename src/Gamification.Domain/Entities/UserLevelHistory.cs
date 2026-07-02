using System;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class UserLevelHistory : Entity
    {
        public UserId UserId { get; private set; }
        public LevelDefinition Level { get; private set; }
        public Points PointsAtThatMoment { get; private set; }
        public DateTime AchievedAt { get; private set; }

        // Constructor de materialización para EF Core.
        private UserLevelHistory()
        {
            UserId = null!;
            Level = null!;
            PointsAtThatMoment = null!;
        }

        public UserLevelHistory(Guid id, UserId userId, LevelDefinition level, Points points, DateTime achievedAt)
        {
            Id = id;
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Level = level ?? throw new ArgumentNullException(nameof(level));
            PointsAtThatMoment = points ?? throw new ArgumentNullException(nameof(points));
            AchievedAt = achievedAt;
        }
    }
}

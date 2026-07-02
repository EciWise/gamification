using System;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class WeeklyActivity : Entity
    {
        public UserId UserId { get; private set; } = null!;
        public DateTime WeekStart { get; private set; }
        public Points PointsEarned { get; private set; } = null!;
        public int ActionsCount { get; private set; }
        public DateTime RecordedAt { get; private set; }

        private WeeklyActivity() { }

        public WeeklyActivity(Guid id, UserId userId, DateTime weekStart, Points pointsEarned, int actionsCount, DateTime recordedAt)
        {
            Id = id;
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            WeekStart = weekStart;
            PointsEarned = pointsEarned ?? throw new ArgumentNullException(nameof(pointsEarned));
            ActionsCount = actionsCount;
            RecordedAt = recordedAt;
        }
    }
}

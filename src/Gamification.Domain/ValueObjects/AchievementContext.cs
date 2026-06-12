using System;

namespace Gamification.Domain.ValueObjects
{
    public class AchievementContext
    {
        public Guid SourceEventId { get; }
        public DateTime OccurredAt { get; }

        public AchievementContext(Guid sourceEventId, DateTime occurredAt)
        {
            SourceEventId = sourceEventId;
            OccurredAt = occurredAt;
        }
    }
}

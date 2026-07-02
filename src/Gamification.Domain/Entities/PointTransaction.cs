using System;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class PointTransaction : Entity
    {
        public UserId UserId { get; private set; }
        public Points Points { get; private set; }
        public ActionType ActionType { get; private set; }
        public EventDescription Description { get; private set; }
        public Guid SourceEventId { get; private set; }
        public IdempotencyKey IdempotencyKey { get; private set; }
        public DateTime OccurredAt { get; private set; }

        // Constructor de materialización para EF Core.
        private PointTransaction()
        {
            UserId = null!;
            Points = null!;
            Description = null!;
            IdempotencyKey = null!;
        }

        public PointTransaction(
            Guid id,
            UserId userId,
            Points points,
            ActionType actionType,
            EventDescription description,
            Guid sourceEventId,
            IdempotencyKey idempotencyKey,
            DateTime occurredAt) : base(id)
        {
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Points = points ?? throw new ArgumentNullException(nameof(points));
            ActionType = actionType;
            Description = description;
            SourceEventId = sourceEventId;
            IdempotencyKey = idempotencyKey;
            OccurredAt = occurredAt;
        }
    }
}
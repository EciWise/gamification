using System;

namespace Gamification.Domain.Events
{
    public abstract class DomainEvent
    {
        public Guid EventId { get; } = Guid.NewGuid();
        public Guid UserId { get; }
        public DateTime OccurredOn { get; } = DateTime.UtcNow;
        public string EventType => GetType().Name;

        protected DomainEvent(Guid userId)
        {
            UserId = userId;
        }
    }
}

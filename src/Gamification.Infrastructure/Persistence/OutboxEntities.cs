using System;

namespace Gamification.Infrastructure.Persistence
{
    public class OutboxEvent
    {
        public Guid Id { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string AggregateId { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public DateTime OccurredAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public int RetryCount { get; set; }

        public OutboxEvent()
        {
            Id = Guid.NewGuid();
            OccurredAt = DateTime.UtcNow;
        }
    }

    public class ProcessedEvent
    {
        public Guid EventId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
    }
}

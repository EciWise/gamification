using System;

namespace Gamification.Infrastructure.Persistence
{
    public class OutboxEvent
    {
        public Guid Id { get; set; }
        public string EventType { get; set; }
        public string AggregateId { get; set; }
        public string Payload { get; set; }
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
        public string EventType { get; set; }
        public DateTime ProcessedAt { get; set; }
    }
}

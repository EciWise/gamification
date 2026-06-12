using System.Collections.Generic;
using Gamification.Domain.Events;
using Gamification.Domain.Entities;

namespace Gamification.Domain.Aggregates
{
    public abstract class AggregateRoot<TId> : Entity
    {
        private readonly List<DomainEvent> _domainEvents = new();
        public IReadOnlyCollection<DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }

        protected void AddDomainEvent(DomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }
    }
}
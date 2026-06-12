using System;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Events
{
    public class PointsAddedEvent : DomainEvent
    {
        public Points Points { get; }
        public ActionType ActionType { get; }

        public PointsAddedEvent(Guid userId, Points points, ActionType actionType)
            : base(userId)
        {
            Points = points;
            ActionType = actionType;
        }
    }
}

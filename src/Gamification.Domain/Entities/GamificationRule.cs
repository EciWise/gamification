using System;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class GamificationRule : Entity
    {
        public ActionType ActionType { get; private set; }
        public Points PointsAwarded { get; private set; }
        public bool IsActive { get; private set; }

        // Constructor de materialización para EF Core.
        private GamificationRule()
        {
            PointsAwarded = null!;
        }

        public GamificationRule(Guid id, ActionType actionType, Points pointsAwarded, bool isActive = true)
        {
            Id = id;
            ActionType = actionType;
            PointsAwarded = pointsAwarded ?? throw new ArgumentNullException(nameof(pointsAwarded));
            IsActive = isActive;
        }
    }
}

using System;
using Gamification.Domain.Enums;

namespace Gamification.Domain.ValueObjects
{
    public class UserActionStat : ValueObject
    {
        public ActionType ActionType { get; }
        public int Count { get; }
        public DateTime LastUpdated { get; }

        private UserActionStat() { }

        public UserActionStat(ActionType actionType, int count, DateTime lastUpdated)
        {
            if (count < 0) throw new ArgumentException("Count cannot be negative.", nameof(count));
            ActionType = actionType;
            Count = count;
            LastUpdated = lastUpdated;
        }

        public UserActionStat Increment(int amount = 1)
        {
            return new UserActionStat(ActionType, Count + amount, DateTime.UtcNow);
        }

        protected override System.Collections.Generic.IEnumerable<object> GetEqualityComponents()
        {
            yield return ActionType;
            yield return Count;
            yield return LastUpdated;
        }
    }
}
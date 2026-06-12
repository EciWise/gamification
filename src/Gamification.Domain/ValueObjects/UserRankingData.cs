using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class UserRankingData : ValueObject
    {
        public UserId UserId { get; }
        public decimal Score { get; }

        public UserRankingData(UserId userId, decimal score)
        {
            UserId = userId ?? throw new ArgumentNullException(nameof(userId));
            Score = score;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return UserId;
            yield return Score;
        }
    }
}

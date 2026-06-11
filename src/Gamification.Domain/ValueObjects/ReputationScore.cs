using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class ReputationScore : ValueObject
    {
        public decimal Value { get; }

        public ReputationScore(decimal value)
        {
            if (value < 0)
                throw new ArgumentException("ReputationScore cannot be negative.", nameof(value));
            
            Value = value;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }
}
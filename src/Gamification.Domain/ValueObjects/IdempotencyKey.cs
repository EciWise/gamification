using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class IdempotencyKey : ValueObject
    {
        public string Value { get; }

        public IdempotencyKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("IdempotencyKey cannot be empty.", nameof(value));
            
            Value = value;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }
}
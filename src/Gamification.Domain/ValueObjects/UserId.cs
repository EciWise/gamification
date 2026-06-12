using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class UserId : ValueObject
    {
        public Guid Value { get; }

        public UserId(Guid value)
        {
            if (value == Guid.Empty)
                throw new ArgumentException("UserId cannot be empty", nameof(value));
            
            Value = value;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }
}

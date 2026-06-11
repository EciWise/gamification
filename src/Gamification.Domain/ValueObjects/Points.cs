using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class Points : ValueObject
    {
        public int Value { get; }

        public Points(int value)
        {
            if (value < 0)
                throw new ArgumentException("Points cannot be negative.", nameof(value));
            
            Value = value;
        }

        public Points Add(Points points)
        {
            return new Points(this.Value + points.Value);
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }

        public static Points Zero => new Points(0);
    }
}

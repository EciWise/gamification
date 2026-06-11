using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class EventDescription : ValueObject
    {
        public string Value { get; }

        public EventDescription(string value)
        {
            Value = value;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }
}
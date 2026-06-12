using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class SubjectCode : ValueObject
    {
        public string Value { get; }

        public SubjectCode(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Subject code cannot be empty", nameof(value));
            Value = value;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }
}

using System;
using System.Collections.Generic;

namespace Gamification.Domain.ValueObjects
{
    public class CriteriaConfig : ValueObject
    {
        public string JsonRaw { get; }

        public CriteriaConfig(string jsonRaw)
        {
            if (string.IsNullOrWhiteSpace(jsonRaw))
                throw new ArgumentException("JsonRaw cannot be empty.", nameof(jsonRaw));
            
            JsonRaw = jsonRaw;
        }

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return JsonRaw;
        }
    }
}
using System;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class LevelDefinition : Entity
    {
        public string Name { get; private set; } = null!;
        public Points MinPoints { get; private set; } = null!;

        private LevelDefinition() { }

        public LevelDefinition(Guid id, string name, Points minPoints) : base(id)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));
            
            Name = name;
            MinPoints = minPoints ?? throw new ArgumentNullException(nameof(minPoints));
        }
    }
}
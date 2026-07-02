using System;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Entities
{
    public class LevelDefinition : Entity
    {
        public string Name { get; private set; }
        public Points MinPoints { get; private set; }

        // Constructor de materialización para EF Core.
        private LevelDefinition()
        {
            Name = null!;
            MinPoints = null!;
        }

        public LevelDefinition(Guid id, string name, Points minPoints) : base(id)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name cannot be empty.", nameof(name));
            
            Name = name;
            MinPoints = minPoints ?? throw new ArgumentNullException(nameof(minPoints));
        }
    }
}
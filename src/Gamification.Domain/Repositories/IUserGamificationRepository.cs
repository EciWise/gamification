using System.Collections.Generic;
using System.Threading.Tasks;
using Gamification.Domain.Aggregates;
using Gamification.Domain.Entities;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Repositories
{
    public interface IUserGamificationRepository
    {
        Task<UserGamification?> GetByUserIdAsync(UserId userId);
        Task SaveAsync(UserGamification userGamification);

        /// <summary>Niveles ordenados ascendentemente por puntos mínimos (para
        /// provisión de usuarios y detección de subida de nivel) daniel.</summary>
        Task<List<LevelDefinition>> GetLevelsOrderedAsync();
    }
}
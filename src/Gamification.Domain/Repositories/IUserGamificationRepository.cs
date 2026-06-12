using System.Threading.Tasks;
using System.Threading.Tasks;
using Gamification.Domain.Aggregates;
using Gamification.Domain.ValueObjects;

namespace Gamification.Domain.Repositories
{
    public interface IUserGamificationRepository
    {
        Task<UserGamification?> GetByUserIdAsync(UserId userId);
        Task SaveAsync(UserGamification userGamification);
    }
}
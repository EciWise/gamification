using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Gamification.Application.Queries;
using Gamification.Domain.Repositories;
using Gamification.Domain.ValueObjects;

namespace Gamification.Application.Handlers
{
    public class RankingQueryHandlers :
        IRequestHandler<GetUserRankingQuery, UserRankingDto?>
    {
        private readonly IRankingRepository _rankingRepository;

        public RankingQueryHandlers(IRankingRepository rankingRepository)
        {
            _rankingRepository = rankingRepository;
        }

        public async Task<UserRankingDto?> Handle(GetUserRankingQuery request, CancellationToken cancellationToken)
        {
            var ranking = await _rankingRepository.GetCurrentAsync(request.Type, null);
            if (ranking == null) return null;

            var entry = ranking.Entries.FirstOrDefault(e => e.UserId.Value == request.UserId);
            if (entry == null) return null;

            return new UserRankingDto
            {
                UserId = entry.UserId.Value,
                Position = entry.Position,
                Score = entry.Score
            };
        }
    }
}

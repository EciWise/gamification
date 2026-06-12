using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gamification.Application.Queries;
using Gamification.Application.Commands;
using Gamification.Domain.Enums;

namespace Gamification.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class GamificationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GamificationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Retrieves the ranking position for a specific user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="type">The type of ranking (e.g., GlobalPorPuntos).</param>
        /// <returns>The user's ranking details.</returns>
        [HttpGet("users/{userId}/ranking")]
        [ProducesResponseType(typeof(UserRankingDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserRanking(Guid userId, [FromQuery] RankingType type = RankingType.GlobalPorPuntos)
        {
            var query = new GetUserRankingQuery { UserId = userId, Type = type };
            var result = await _mediator.Send(query);

            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Retrieves all achievements unlocked by a specific user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>A list of unlocked achievements.</returns>
        [HttpGet("users/{userId}/achievements")]
        [ProducesResponseType(typeof(List<AchievementDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUserAchievements(Guid userId)
        {
            var query = new GetUserAchievementsQuery { UserId = userId };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}

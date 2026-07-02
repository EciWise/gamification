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

        /// <summary>
        /// Retrieves the gamification summary (points, level, reputation) for a user.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>The user's gamification summary.</returns>
        [HttpGet("users/{userId}/summary")]
        [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserSummary(Guid userId)
        {
            var query = new GetUserSummaryQuery { UserId = userId };
            var result = await _mediator.Send(query);

            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Registers that a user played a mini-game in the Games Center. The first
        /// play ever grants 10 points and unlocks the "Buscador de aventuras"
        /// achievement; subsequent plays are idempotent (no extra points). Att Daniel
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <param name="body">Optional payload with the game identifier.</param>
        /// <returns>200 with rewarded=true on the first play; rewarded=false otherwise.</returns>
        [HttpPost("users/{userId}/games/played")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RegisterGamePlayed(Guid userId, [FromBody] GamePlayedRequest? body = null)
        {
            var result = await _mediator.Send(new RegisterGamePlayedCommand
            {
                UserId = userId,
                GameId = body?.GameId
            });
            return Ok(new { rewarded = result.Rewarded, unlockedAchievements = result.UnlockedAchievements });
        }

        /// <summary>
        /// Registers that a user completed a practice quiz. Grants points every
        /// time and may unlock quiz achievements. Returns the newly unlocked ones.
        /// </summary>
        [HttpPost("users/{userId}/practice/completed")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RegisterPracticeCompleted(Guid userId)
        {
            var result = await _mediator.Send(new RegisterActivityCommand
            {
                UserId = userId,
                ActionType = ActionType.QuizCompletado,
                Points = 5,
                Description = "Quiz de práctica completado"
            });
            return Ok(new { rewarded = result.Rewarded, unlockedAchievements = result.UnlockedAchievements });
        }

        /// <summary>
        /// Registers that a user completed a study session. Grants points every
        /// time and may unlock study achievements. Returns the newly unlocked ones.
        /// </summary>
        [HttpPost("users/{userId}/study/completed")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RegisterStudyCompleted(Guid userId)
        {
            var result = await _mediator.Send(new RegisterActivityCommand
            {
                UserId = userId,
                ActionType = ActionType.SesionEstudio,
                Points = 3,
                Description = "Sesión de estudio completada"
            });
            return Ok(new { rewarded = result.Rewarded, unlockedAchievements = result.UnlockedAchievements });
        }

        /// <summary>
        /// Registers that a user completed their AI profile in the profile section.
        /// The first completion grants 10 points and unlocks the "La IA ya sabe
        /// dónde vives" achievement; subsequent calls are idempotent (no extra
        /// points).
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>200 with rewarded=true on the first completion; rewarded=false otherwise.</returns>
        [HttpPost("users/{userId}/ai-profile/completed")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RegisterAiProfileCompleted(Guid userId)
        {
            var result = await _mediator.Send(new RegisterAiProfileCompletedCommand
            {
                UserId = userId
            });
            return Ok(new { rewarded = result.Rewarded, unlockedAchievements = result.UnlockedAchievements });
        }

        /// <summary>
        /// Registers that a user opened a question in the Help Center. The first
        /// opened question unlocks the "Perdidasss, andamos perdidasss!" achievement
        /// without granting points; subsequent calls are idempotent.
        /// </summary>
        /// <param name="userId">The unique identifier of the user.</param>
        /// <returns>200 with rewarded=true on the first opened question; rewarded=false otherwise.</returns>
        [HttpPost("users/{userId}/help/opened")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> RegisterHelpQuestionOpened(Guid userId)
        {
            var result = await _mediator.Send(new RegisterHelpQuestionOpenedCommand
            {
                UserId = userId
            });
            return Ok(new { rewarded = result.Rewarded, unlockedAchievements = result.UnlockedAchievements });
        }

        /// <summary>
        /// Retrieves the level ladder (name + minimum points) for badge display.
        /// </summary>
        [HttpGet("levels")]
        [ProducesResponseType(typeof(List<LevelDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetLevels()
        {
            var result = await _mediator.Send(new GetLevelsQuery());
            return Ok(result);
        }
    }

    /// <summary>Cuerpo opcional de POST users/{userId}/games/played.</summary>
    public class GamePlayedRequest
    {
        /// <summary>Identificador del juego jugado (p. ej. "serpiente").</summary>
        public string? GameId { get; set; }
    }
}

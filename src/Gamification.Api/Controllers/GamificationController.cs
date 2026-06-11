using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gamification.Application.Commands;

namespace Gamification.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamificationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GamificationController(IMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        // Example trigger (though points usually come from events, providing it here for testing).
        [HttpPost("points/assign")]
        public async Task<IActionResult> AssignPoints([FromBody] AssignPointsCommand command)
        {
            if (command.SourceEventId == Guid.Empty)
            {
                command.SourceEventId = Guid.NewGuid();
            }

            var result = await _mediator.Send(command);

            if (result)
            {
                return Ok(new { message = "Points assigned successfully." });
            }

            return BadRequest(new { message = "Failed to assign points." });
        }
    }
}
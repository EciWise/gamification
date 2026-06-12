using Microsoft.AspNetCore.Mvc;
using MediatR;
using Gamification.Domain.Enums;
using Gamification.Domain.ValueObjects;
using Gamification.Domain.Entities;
using Gamification.Domain.Repositories;

namespace Gamification.Api.Controllers
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Produces("application/json")]
    public class RulesController : ControllerBase
    {
        private readonly IGamificationRuleRepository _ruleRepository;

        public RulesController(IGamificationRuleRepository ruleRepository)
        {
            _ruleRepository = ruleRepository;
        }

        /// <summary>
        /// Gets all active gamification rules.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRules()
        {
            var rules = await _ruleRepository.GetAllActiveAsync();
            return Ok(rules);
        }
    }
}

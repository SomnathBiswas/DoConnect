using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public NotificationApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Admin-only: get pending count + recent pending items
        [Authorize(Roles = "Admin")]
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingSummary(int take = 10)
        {
            // Count pending questions + answers
            var pendingQuestionsCount = await _context.Questions.CountAsync(q => q.Status == "Pending");
            var pendingAnswersCount   = await _context.Answers.CountAsync(a => a.Status == "Pending");

            var pendingCount = pendingQuestionsCount + pendingAnswersCount;

            // Build a combined recent list (questions + answers) ordered by createdAt desc
            var questionItems = await _context.Questions
                .Where(q => q.Status == "Pending")
                .OrderByDescending(q => q.CreatedAt)
                .Select(q => new NotificationDto
                {
                    Type = "Question",
                    Id = q.QuestionId,
                    Title = q.QuestionTitle,
                    Username = q.User != null ? q.User.Username : "Unknown",
                    CreatedAt = q.CreatedAt
                })
                .Take(take)
                .ToListAsync();

            var answerItems = await _context.Answers
                .Where(a => a.Status == "Pending")
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new NotificationDto
                {
                    Type = "Answer",
                    Id = a.AnswerId,
                    Title = a.Question != null ? a.Question.QuestionTitle : $"Question #{a.QuestionId}",
                    Username = a.User != null ? a.User.Username : "Unknown",
                    CreatedAt = a.CreatedAt
                })
                .Take(take)
                .ToListAsync();

            // Merge and order by createdAt descending, then take up to 'take'
            var merged = questionItems.Concat(answerItems)
                                    .OrderByDescending(x => x.CreatedAt)
                                    .Take(take)
                                    .ToList();

            var summary = new NotificationSummaryDto
            {
                PendingCount = (int)pendingCount,
                Recent = merged
            };

            return Ok(summary);
        }
    }
}
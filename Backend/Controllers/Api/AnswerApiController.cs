using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnswerApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnswerApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetAnswersForQuestion(int questionId)
        {
            var answers = await _context.Answers
                .Where(a => a.QuestionId == questionId)
                .Include(a => a.User)
                .Include(a => a.Images)
                .Select(a => new AnswerDto
                {
                    AnswerId = a.AnswerId,
                    QuestionId = a.QuestionId,
                    AnswerText = a.AnswerText,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    Username = a.User.Username,
                    ImagePaths = a.Images.Select(img => img.ImagePath).ToList()
                })
                .ToListAsync();

            return Ok(answers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnswer(int id)
        {
            var answer = await _context.Answers
                .Include(a => a.User)
                .Include(a => a.Images)
                .Where(a => a.AnswerId == id)
                .Select(a => new AnswerDto
                {
                    AnswerId = a.AnswerId,
                    QuestionId = a.QuestionId,
                    AnswerText = a.AnswerText,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    Username = a.User.Username,
                    ImagePaths = a.Images.Select(img => img.ImagePath).ToList()
                })
                .FirstOrDefaultAsync();
            if (answer == null) return NotFound();

            return Ok(answer);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllAnswers()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var answers = await _context.Answers
                .Include(a => a.User)
                .Include(a => a.Question)
                .Include(a => a.Images)
                .Select(a => new
                {
                    answerId = a.AnswerId,
                    questionId = a.QuestionId,
                    questionTitle = a.Question != null ? a.Question.QuestionTitle : null,
                    answerText = a.AnswerText,
                    status = a.Status,
                    createdAt = a.CreatedAt,
                    username = a.User != null ? a.User.Username : "Unknown",
                    imagePaths = a.Images.Select(i => $"{baseUrl}/uploads/{System.IO.Path.GetFileName(i.ImagePath)}").ToList()
                })
                .OrderByDescending(a => a.createdAt)
                .ToListAsync();

            return Ok(answers);
        }


        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateAnswer([FromBody] CreateAnswerDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var question = await _context.Questions.FindAsync(dto.QuestionId);
            if (question == null) return NotFound("Question not found");

            if (question.Status != "Approved")
            {
                return BadRequest(new { message = "You cannot answer this question until it is approved by an Admin." });
            }

            var answer = new Answer
            {
                QuestionId = dto.QuestionId,
                UserId = userId,
                AnswerText = dto.AnswerText,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
            };

            _context.Answers.Add(answer);
            await _context.SaveChangesAsync();

            var result = new AnswerDto
            {
                AnswerId = answer.AnswerId,
                QuestionId = answer.QuestionId,
                AnswerText = answer.AnswerText,
                Status = answer.Status,
                CreatedAt = answer.CreatedAt,
                Username = (await _context.Users.FindAsync(userId))?.Username ?? "Unknown",
            };

            return CreatedAtAction(nameof(GetAnswer), new { id = answer.AnswerId }, result);
        }


        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnswer(int id, [FromBody] Answer updatedAnswer)
        {
            var answer = await _context.Answers.FindAsync(id);
            if (answer == null) return NotFound();

            answer.AnswerText = updatedAnswer.AnswerText;
            answer.Status = updatedAnswer.Status;



            await _context.SaveChangesAsync();

            var result = new AnswerDto
            {
                AnswerId = answer.AnswerId,
                QuestionId = answer.QuestionId,
                AnswerText = answer.AnswerText,
                Status = answer.Status,
                CreatedAt = answer.CreatedAt,
                Username = (await _context.Users.FindAsync(answer.UserId))?.Username ?? "Unknown"
            };

            return Ok(answer);
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnswer(int id)
        {
            var answer = await _context.Answers
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.AnswerId == id);

            if (answer == null) return NotFound();

            // Soft-delete images
            foreach (var img in answer.Images)
            {
                img.IsDeleted = true;
                img.DeletedAt = DateTime.UtcNow;
            }

            // Soft-delete answer
            answer.IsDeleted = true;
            answer.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer deleted successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("answers/all-including-deleted")]
        public async Task<IActionResult> GetAllAnswersIncludingDeleted()
        {
            var list = await _context.Answers
                .IgnoreQueryFilters()
                .Include(a => a.Images)
                .Include(a => a.Question)
                .ToListAsync();

            return Ok(list);
        }     
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveAnswer(int id)
        {
            var answer = await _context.Answers.FindAsync(id);
            if (answer == null) return NotFound();

            answer.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer approved successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectAnswer(int id)
        {
            var answer = await _context.Answers.FindAsync(id);
            if (answer == null) return NotFound();

            answer.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Answer rejected successfully" });
        }

    }
}

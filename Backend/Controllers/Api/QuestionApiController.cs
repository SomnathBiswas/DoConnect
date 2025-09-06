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
    public class QuestionApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public QuestionApiController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuestions()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var questions = await _context.Questions
            .Include(q => q.User)
            .Include(q => q.Answers).ThenInclude(a => a.User)
            .Include(q => q.Images)
            .Select(q => new QuestionDto
            {
                QuestionId = q.QuestionId,
                QuestionTitle = q.QuestionTitle,
                QuestionText = q.QuestionText,
                Status = q.Status,
                CreatedAt = q.CreatedAt,
                Username = q.User.Username,
                ImagePaths = q.Images
                    .Select(img => $"{baseUrl}/uploads/{Path.GetFileName(img.ImagePath)}").ToList(),

                Answers = q.Answers.Select(a => new AnswerDto
                {
                    AnswerId = a.AnswerId,
                    QuestionId = a.QuestionId,
                    AnswerText = a.AnswerText,
                    Status = a.Status,
                    CreatedAt = a.CreatedAt,
                    Username = a.User.Username,
                    ImagePaths = a.Images
                        .Select(img => $"{baseUrl}/uploads/{Path.GetFileName(img.ImagePath)}").ToList()
                }).ToList()
            })
                .ToListAsync();

            return Ok(questions);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestion(int id)
        {
            var projected = await _context.Questions
                .Include(q => q.User)
                .Include(q => q.Images)
                .Include(q => q.Answers).ThenInclude(a => a.User)
                .Include(q => q.Answers).ThenInclude(a => a.Images)
                .Where(q => q.QuestionId == id)
                .Select(q => new QuestionDto
                {
                    QuestionId = q.QuestionId,
                    QuestionTitle = q.QuestionTitle,
                    QuestionText = q.QuestionText,
                    Status = q.Status,
                    CreatedAt = q.CreatedAt,
                    Username = q.User.Username,
                    ImagePaths = q.Images.Select(img => img.ImagePath).ToList(),
                    Answers = q.Answers.Select(a => new AnswerDto
                    {
                        AnswerId = a.AnswerId,
                        QuestionId = a.QuestionId,
                        AnswerText = a.AnswerText,
                        Status = a.Status,
                        CreatedAt = a.CreatedAt,
                        Username = a.User.Username,
                        ImagePaths = a.Images.Select(img => img.ImagePath).ToList()

                    }).ToList()
                })
                .FirstOrDefaultAsync();


            if (projected == null) return NotFound();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            projected.ImagePaths = projected.ImagePaths
                .Select(p => p)
                .ToList();

            foreach (var a in projected.Answers)
            {
                a.ImagePaths = a.ImagePaths
                    .Select(p => p)
                    .ToList();
            }

            return Ok(projected);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim);

            var question = new Question
            {
                UserId = userId,
                QuestionTitle = dto.QuestionTitle,
                QuestionText = dto.QuestionText,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            var result = new QuestionDto
            {
                QuestionId = question.QuestionId,
                QuestionTitle = question.QuestionTitle,
                QuestionText = question.QuestionText,
                Status = question.Status,
                CreatedAt = question.CreatedAt,
                Username = (await _context.Users.FindAsync(userId))?.Username ?? "Unknown",
                Answers = new List<AnswerDto>()
            };


            return CreatedAtAction(nameof(GetQuestion), new { id = question.QuestionId }, result);
        }


        [Authorize]
        [HttpPost("with-image")]
        public async Task<IActionResult> CreateQuestionWithImage([FromForm] CreateQuestionWithImageDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null) return Unauthorized();
            int userId = int.Parse(userIdClaim);
            // Save Question
            var question = new Question
            {
                UserId = userId,
                QuestionTitle = dto.QuestionTitle,
                QuestionText = dto.QuestionText,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            // Save optional image
            if (dto.ImageFile != null && dto.ImageFile.Length > 0)
            {
                var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                if (!Directory.Exists(uploadsDir))
                    Directory.CreateDirectory(uploadsDir);

                var fileName = $"{Guid.NewGuid()}_{dto.ImageFile.FileName}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.ImageFile.CopyToAsync(stream);
                }

                question.Images = new List<Image>
                {
                    new Image { ImagePath = $"/uploads/{fileName}" }
                };
            }

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question created successfully, wait for admin approval.", question.QuestionId });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(int id, [FromBody] Question updatedQuestion)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();

            question.QuestionTitle = updatedQuestion.QuestionTitle;
            question.QuestionText = updatedQuestion.QuestionText;
            question.Status = updatedQuestion.Status;

            await _context.SaveChangesAsync();

            var result = new QuestionDto
            {
                QuestionId = question.QuestionId,
                QuestionTitle = question.QuestionTitle,
                QuestionText = question.QuestionText,
                Status = question.Status,
                CreatedAt = question.CreatedAt,
                Username = (await _context.Users.FindAsync(question.UserId))?.Username ?? "Unknown",
                Answers = new List<AnswerDto>()
            };
            // return Ok(question);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions
                .Include(q => q.Images)
                .Include(q => q.Answers)
                    .ThenInclude(a => a.Images)
                .FirstOrDefaultAsync(q => q.QuestionId == id);

            if (question == null) return NotFound();

            // Soft-delete images of answers
            foreach (var answer in question.Answers)
            {
                foreach (var aImg in answer.Images)
                {
                    aImg.IsDeleted = true;
                    aImg.DeletedAt = DateTime.UtcNow;
                }

                // Soft-delete answer
                answer.IsDeleted = true;
                answer.DeletedAt = DateTime.UtcNow;
            }

            // Soft-delete images of question
            foreach (var qImg in question.Images)
            {
                qImg.IsDeleted = true;
                qImg.DeletedAt = DateTime.UtcNow;
            }

            // Soft-delete question itself
            question.IsDeleted = true;
            question.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Question deleted successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all-including-deleted")]
        public async Task<IActionResult> GetAllIncludingDeleted()
        {
            var list = await _context.Questions
                .IgnoreQueryFilters()
                .Include(q => q.Images)
                .Include(q => q.Answers).ThenInclude(a => a.Images)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest(new { message = "Query parameter 'q' is required" });

            string search = q.Trim().ToLower();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var results = await _context.Questions
                .Include(qt => qt.User)
                .Include(qt => qt.Images)
                .Include(qt => qt.Answers).ThenInclude(a => a.User)
                .Include(qt => qt.Answers).ThenInclude(a => a.Images)
                // Filter only approved questions for user-facing pages (remove this line if you want all statuses)
                .Where(qt => qt.Status == "Approved" &&
                    (EF.Functions.Like(qt.QuestionTitle.ToLower(), $"%{search}%")
                     || EF.Functions.Like(qt.QuestionText.ToLower(), $"%{search}%")
                     || EF.Functions.Like(qt.User.Username.ToLower(), $"%{search}%")
                    ))
                .Select(qt => new QuestionDto
                {
                    QuestionId = qt.QuestionId,
                    QuestionTitle = qt.QuestionTitle,
                    QuestionText = qt.QuestionText,
                    Status = qt.Status,
                    CreatedAt = qt.CreatedAt,
                    Username = qt.User.Username,
                    // return full http urls for images
                    ImagePaths = qt.Images.Select(img => $"{baseUrl}/uploads/{Path.GetFileName(img.ImagePath)}").ToList(),
                    Answers = qt.Answers.Select(a => new AnswerDto
                    {
                        AnswerId = a.AnswerId,
                        QuestionId = a.QuestionId,
                        AnswerText = a.AnswerText,
                        Status = a.Status,
                        CreatedAt = a.CreatedAt,
                        Username = a.User.Username,
                        ImagePaths = a.Images.Select(i => $"{baseUrl}/uploads/{Path.GetFileName(i.ImagePath)}").ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(results);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();

            question.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question approved successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null) return NotFound();

            question.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Question rejected successfully" });
        }

    }
}

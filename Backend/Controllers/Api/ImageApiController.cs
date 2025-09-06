using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ImageApiController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [Authorize]
        [HttpPost("upload/question/{questionId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadQuestionImage(int questionId, [FromForm] UploadImageDto dto)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null)
                return NotFound(new { message = "Question not found" });

            // Only allow image upload if question is APPROVED
            if (!string.Equals(question.Status, "Approved", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Cannot upload images until this question is approved by an Admin." });
            }

            if (dto.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "Invalid file" });

            // Save file to /uploads
            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var safeName = Path.GetFileName(dto.File.FileName);
            var fileName = $"{Guid.NewGuid()}_{safeName}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var image = new Image
            {
                QuestionId = questionId,
                ImagePath = $"/uploads/{fileName}",
                UploadedAt = DateTime.UtcNow
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            return Ok(new { image.ImageId, image.ImagePath });
        }


        [Authorize]
        [HttpPost("upload/answer/{answerId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadAnswerImage(int answerId, [FromForm] UploadImageDto dto)
        {
            var answer = await _context.Answers
                .Include(a => a.Question)
                .FirstOrDefaultAsync(a => a.AnswerId == answerId);

            if (answer == null)
                return NotFound(new { message = "Answer not found" });


            if (dto.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "Invalid file" });

            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var safeName = Path.GetFileName(dto.File.FileName);
            var fileName = $"{Guid.NewGuid()}_{safeName}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var image = new Image
            {
                AnswerId = answerId,
                ImagePath = $"/uploads/{fileName}",
                UploadedAt = DateTime.UtcNow
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            return Ok(new { image.ImageId, image.ImagePath });
        }


        [HttpGet("question/{questionId}")]
        public async Task<IActionResult> GetQuestionImages(int questionId)
        {
            var images = await _context.Images
                .Where(i => i.QuestionId == questionId)
                .ToListAsync();

            return Ok(images);
        }

        [HttpGet("answer/{answerId}")]
        public async Task<IActionResult> GetAnswerImages(int answerId)
        {
            var images = await _context.Images
                .Where(i => i.AnswerId == answerId)
                .ToListAsync();

            return Ok(images);
        }
    }
}

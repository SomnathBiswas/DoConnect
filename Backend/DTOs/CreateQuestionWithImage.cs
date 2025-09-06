using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class CreateQuestionWithImageDto
{
    public string QuestionTitle { get; set; }
    public string QuestionText { get; set; }

    [FromForm(Name = "ImageFile")]
    public IFormFile? ImageFile { get; set; }
}
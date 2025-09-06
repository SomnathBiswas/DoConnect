using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

public class UploadImageDto
{
    [FromForm(Name = "file")]
    public IFormFile File { get; set; }
}
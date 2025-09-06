namespace Backend.DTOs
{
    public class CreateQuestionDto
    {

        public required string QuestionTitle { get; set; } = string.Empty;
        public required string QuestionText { get; set; } = string.Empty;
    }
}

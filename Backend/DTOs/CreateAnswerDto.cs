namespace Backend.DTOs
{
    public class CreateAnswerDto
    {
        public required int QuestionId { get; set; }
        public required string AnswerText { get; set; } = string.Empty;
    }
}

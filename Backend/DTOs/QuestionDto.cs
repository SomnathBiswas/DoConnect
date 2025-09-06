namespace Backend.DTOs
{
    public class QuestionDto
    {
        public int QuestionId { get; set; }
        public string QuestionTitle { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Username { get; set; } = string.Empty;

        public List<string> ImagePaths { get; set; } = new();
        public List<AnswerDto> Answers { get; set; } = new();
    }
}

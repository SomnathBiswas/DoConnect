namespace Backend.DTOs
{
    public class AnswerDto
    {
        public int AnswerId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Username { get; set; } = string.Empty;
        
        public List<string> ImagePaths { get; set; } = new();
    }
}

namespace Backend.DTOs
{
    public class NotificationDto
    {
        public string Type { get; set; } = ""; // "Question" or "Answer"
        public int Id { get; set; }            // questionId or answerId
        public string Title { get; set; } = "";
        public string Username { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class NotificationSummaryDto
    {
        public int PendingCount { get; set; }
        public List<NotificationDto> Recent { get; set; } = new List<NotificationDto>();
    }
}
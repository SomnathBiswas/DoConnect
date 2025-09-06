using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Backend.Models
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }

        [ForeignKey("User")]
        [Required]
        public int UserId { get; set; }  

        [Required, MaxLength(255)]
        public string QuestionTitle { get; set; } = string.Empty;

        public string QuestionText { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
        public DateTime DeletedAt { get; set; }
        public User User { get; set; } = null!;
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public ICollection<Image> Images { get; set; } = new List<Image>();
    }
}
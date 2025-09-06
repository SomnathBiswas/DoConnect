using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<User> Users { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<Image> Images { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Questions)
            .WithOne(q => q.User)
            .HasForeignKey(q => q.UserId);

        modelBuilder.Entity<Question>()
            .HasMany(q => q.Answers)
            .WithOne(a => a.Question)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // modelBuilder.Entity<Answer>()
        //     .HasOne(a => a.Question)
        //     .WithMany(q => q.Answers)
        //     .HasForeignKey(a => a.QuestionId)
        //     .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Question>()
            .HasMany(q => q.Images)
            .WithOne(i => i.Question)
            .HasForeignKey(i => i.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Answer>()
            .HasMany(a => a.Images)
            .WithOne(i => i.Answer)
            .HasForeignKey(i => i.AnswerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Answer>()
            .HasOne(a => a.User)
            .WithMany(u => u.Answers)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasQueryFilter(q => !q.IsDeleted);

        modelBuilder.Entity<Answer>()
            .HasQueryFilter(a => !a.IsDeleted);

        modelBuilder.Entity<Image>()
            .HasQueryFilter(i => !i.IsDeleted);


        // modelBuilder.Entity<Image>()
        //     .HasOne(i => i.Question)
        //     .WithMany(q => q.Images)
        //     .HasForeignKey(i => i.QuestionId)
        //     .OnDelete(DeleteBehavior.Cascade);

        // modelBuilder.Entity<Image>()
        //     .HasOne(i => i.Answer)
        //     .WithMany(a => a.Images)
        //     .HasForeignKey(i => i.AnswerId)
        //     .OnDelete(DeleteBehavior.Restrict);
    }
}

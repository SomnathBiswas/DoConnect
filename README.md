#  DoConnect – Q&A Platform  

DoConnect is a *Q&A platform* where users can ask and answer questions related to various technical topics. The system supports role-based access (User & Admin), content approval workflows, image uploads, and an integrated Angular + ASP.NET Core Web API architecture.  

---

##  Features  

###  User  
- Register & Login with JWT authentication.  
- Post questions (with or without images).  
- Answer approved questions (with image upload support).  
- Search approved questions using keywords.  
- View approved questions and multiple answers.  

###  Admin  
- Approve or reject questions and answers.  
- Receive notifications when new content is submitted.  
- Manage content with soft-delete (non-destructive deletion).  
- Full dashboard for approvals and content management.  

---

## Tech Stack  

- *Frontend:* Angular (Routing, State Management, Components)  
- *Backend:* ASP.NET Core Web API (C#)  
- *Database:* Microsoft SQL Server + EF Core ORM  
- *Authentication:* JWT (Role-based access: User & Admin)  
- *Image Handling:* Stored in /uploads folder; paths saved in DB  
- *Documentation:* Swagger + Postman API Collection  

---

##  System Design  

- *ERD:* Users ↔ Questions ↔ Answers ↔ Images  
- *Soft Delete:* Questions/Answers marked deleted instead of physical removal.  
- *Optimizations:* Indexing, DTO projection, AsNoTracking queries.  

---

## API Overview  

### Authentication  
- POST /api/Auth/register – Register new user/admin  
- POST /api/Auth/login – Login & get JWT token  

### Questions  
- GET /api/QuestionApi – Fetch all questions  
- POST /api/QuestionApi – Create new question  
- POST /api/QuestionApi/with-image – Create question with image  
- PUT /api/QuestionApi/{id}/approve – Approve question (Admin)  
- PUT /api/QuestionApi/{id}/reject – Reject question (Admin)  
- DELETE /api/QuestionApi/{id} – Soft delete question (Admin)  

### Answers  
- POST /api/AnswerApi – Create new answer  
- GET /api/AnswerApi/question/{questionId} – Get answers for a question  
- PUT /api/AnswerApi/{id}/approve – Approve answer (Admin)  
- PUT /api/AnswerApi/{id}/reject – Reject answer (Admin)  
- DELETE /api/AnswerApi/{id} – Soft delete answer (Admin)  

### Images  
- POST /api/ImageApi/upload/question/{questionId} – Upload question image  
- POST /api/ImageApi/upload/answer/{answerId} – Upload answer image  

 Full API documentation available in *Swagger UI* and [Postman Collection](#).  

---

##  Setup Instructions  

### Backend (ASP.NET Core)  
1. Clone the repo & navigate to /Backend.  
2. Configure *SQL Server connection string* in appsettings.json.  
3. Run EF Core migrations:  
   ```bash
   dotnet ef database update

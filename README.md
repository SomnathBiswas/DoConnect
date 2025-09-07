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


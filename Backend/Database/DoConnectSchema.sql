IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Users] (
    [UserId] int NOT NULL IDENTITY,
    [Username] nvarchar(100) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId])
);

CREATE TABLE [Questions] (
    [QuestionId] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [QuestionTitle] nvarchar(255) NOT NULL,
    [QuestionText] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Questions] PRIMARY KEY ([QuestionId]),
    CONSTRAINT [FK_Questions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);

CREATE TABLE [Answers] (
    [AnswerId] int NOT NULL IDENTITY,
    [QuestionId] int NOT NULL,
    [UserId] int NOT NULL,
    [AnswerText] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Answers] PRIMARY KEY ([AnswerId]),
    CONSTRAINT [FK_Answers_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([QuestionId]) ON DELETE CASCADE,
    CONSTRAINT [FK_Answers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
);

CREATE TABLE [Images] (
    [ImageId] int NOT NULL IDENTITY,
    [ImagePath] nvarchar(max) NOT NULL,
    [QuestionId] int NULL,
    [AnswerId] int NULL,
    [UploadedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Images] PRIMARY KEY ([ImageId]),
    CONSTRAINT [FK_Images_Answers_AnswerId] FOREIGN KEY ([AnswerId]) REFERENCES [Answers] ([AnswerId]),
    CONSTRAINT [FK_Images_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([QuestionId])
);

CREATE INDEX [IX_Answers_QuestionId] ON [Answers] ([QuestionId]);

CREATE INDEX [IX_Answers_UserId] ON [Answers] ([UserId]);

CREATE INDEX [IX_Images_AnswerId] ON [Images] ([AnswerId]);

CREATE INDEX [IX_Images_QuestionId] ON [Images] ([QuestionId]);

CREATE INDEX [IX_Questions_UserId] ON [Questions] ([UserId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250902062142_Initial', N'9.0.8');

COMMIT;
GO


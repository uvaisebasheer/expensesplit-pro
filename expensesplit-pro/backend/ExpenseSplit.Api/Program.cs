using ExpenseSplit.Api.Data;
using ExpenseSplit.Api.DTOs;
using ExpenseSplit.Api.Models;
using ExpenseSplit.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext < AppDbContext > (options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=(localdb)\\mssqllocaldb;Database=ExpenseSplitDb;Trusted_Connection=True;MultipleActiveResultSets=true"
    ));

builder.Services.AddScoped<ISettlementService, SettlementService>();

// Add Swagger services (MUST be before Build)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add AWS Lambda hosting
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure middleware pipeline (ORDER MATTERS)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ExpenseSplit API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");

// Health check
app.MapGet("/api/health", () => new
{
    status = "ok",
    timestamp = DateTime.UtcNow,
    version = "1.0.0",
    stack = ".NET 8 Minimal API + AWS Lambda Ready"
});

// Expense endpoints
app.MapGet("/api/expenses", async (AppDbContext db) =>
{
    var expenses = await db.Expenses
        .Include(e => e.Splits)
        .OrderByDescending(e => e.CreatedAt)
        .ToListAsync();

    return Results.Ok(expenses);
});

app.MapGet("/api/expenses/{id}", async (int id, AppDbContext db) =>
{
    var expense = await db.Expenses
        .Include(e => e.Splits)
        .FirstOrDefaultAsync(e => e.Id == id);

    return expense is null ? Results.NotFound() : Results.Ok(expense);
});

app.MapPost("/api/expenses", async (CreateExpenseDto dto, AppDbContext db) =>
{
    var expense = new Expense
    {
        Description = dto.Description,
        Amount = dto.Amount,
        PaidByUserId = dto.PaidByUserId,
        GroupId = dto.GroupId,
        Splits = dto.Splits.Select(s => new ExpenseShare
        {
            UserId = s.UserId,
            Amount = s.Amount
        }).ToList()
    };

    db.Expenses.Add(expense);
    await db.SaveChangesAsync();

    return Results.Created($"/api/expenses/{expense.Id}", expense);
});

app.MapGet("/api/groups/{groupId}/optimize", async (int groupId, AppDbContext db, ISettlementService service) =>
{
    var expenses = await db.Expenses
        .Where(e => e.GroupId == groupId)
        .Include(e => e.Splits)
        .ToListAsync();

    var users = await db.Users.ToListAsync();

    if (!expenses.Any())
        return Results.Ok(new { message = "No expenses found for this group", settlements = new List< SettlementDto > () });

    var optimized = service.OptimizeSettlements(expenses, users);

    var totalExpenses = expenses.Sum(e => e.Amount);
    var originalTransactions = expenses.Sum(e => e.Splits.Count);
    var optimizedTransactions = optimized.Count;
    var reductionPercent = originalTransactions > 0
        ? Math.Round((1 - (double)optimizedTransactions / originalTransactions) * 100, 1)
        : 0;

    return Results.Ok(new
    {
        groupId,
        totalExpenses,
        originalTransactions,
        optimizedTransactions,
        reductionPercent,
        settlements = optimized
    });
});

app.MapGet("/api/users", async (AppDbContext db) =>
{
    var users = await db.Users.ToListAsync();
    return Results.Ok(users);
});

app.MapGet("/api/groups", async (AppDbContext db) =>
{
    var groups = await db.Groups.ToListAsync();
    return Results.Ok(groups);
});

app.Run();
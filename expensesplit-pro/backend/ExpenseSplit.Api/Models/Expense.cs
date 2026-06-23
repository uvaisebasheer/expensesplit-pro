using ExpenseSplit.Api.Models;
using System.Collections.Generic;

namespace ExpenseSplit.Api.Models;

public class Expense
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int PaidByUserId { get; set; }
    public int GroupId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ReceiptUrl { get; set; }

    // RENAMED: ExpenseSplit -> ExpenseShare to avoid namespace conflict
    public ICollection<ExpenseShare> Splits { get; set; } = new List<ExpenseShare>();
}

// RENAMED CLASS
public class ExpenseShare
{
    public int Id { get; set; }
    public int ExpenseId { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public bool IsSettled { get; set; } = false;
}

public class Group
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<User> Members { get; set; } = new List<User>();
    public List<Expense> Expenses { get; set; } = new List< Expense > ();
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
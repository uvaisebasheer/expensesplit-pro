using Microsoft.EntityFrameworkCore;
using ExpenseSplit.Api.Models;
using Microsoft.Extensions.Options;

namespace ExpenseSplit.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Use global:: to avoid namespace/class confusion
    public DbSet<global::ExpenseSplit.Api.Models.Expense> Expenses 
        => Set<global::ExpenseSplit.Api.Models.Expense>();
    
    public DbSet<global::ExpenseSplit.Api.Models.ExpenseShare> ExpenseShares 
        => Set<global::ExpenseSplit.Api.Models.ExpenseShare>();
    
    public DbSet<global::ExpenseSplit.Api.Models.Group> Groups 
        => Set<global::ExpenseSplit.Api.Models.Group>();
    
    public DbSet<global::ExpenseSplit.Api.Models.User> Users 
        => Set<global::ExpenseSplit.Api.Models.User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity < global::ExpenseSplit.Api.Models.Expense > ()
            .Property(e => e.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity < global::ExpenseSplit.Api.Models.ExpenseShare > ()
            .Property(es => es.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity < global::ExpenseSplit.Api.Models.User > ().HasData(
            new global::ExpenseSplit.Api.Models.User { Id = 1, Name = "Alice", Email = "alice@test.com" },
            new global::ExpenseSplit.Api.Models.User { Id = 2, Name = "Bob", Email = "bob@test.com" },
            new global::ExpenseSplit.Api.Models.User { Id = 3, Name = "Charlie", Email = "charlie@test.com" }
        );

        modelBuilder.Entity < global::ExpenseSplit.Api.Models.Group > ().HasData(
            new global::ExpenseSplit.Api.Models.Group { Id = 1, Name = "Weekend Trip" }
        );
    }
}
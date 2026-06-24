using ExpenseSplit.Api.DTOs;
using ExpenseSplit.Api.Models;
using System.Collections.Generic;

namespace ExpenseSplit.Api.Services;

public interface ISettlementService
{
    List<SettlementDto> OptimizeSettlements(List<global::ExpenseSplit.Api.Models.Expense> expenses, List<User> users);
}

public class SettlementService : ISettlementService
{
    public List<SettlementDto> OptimizeSettlements(List<global::ExpenseSplit.Api.Models.Expense> expenses, List<User> users)
    {
        var userDict = users.ToDictionary(u => u.Id, u => u.Name);
        var balances = new Dictionary<int, decimal>();

        foreach (var expense in expenses)
        {
            balances[expense.PaidByUserId] = balances.GetValueOrDefault(expense.PaidByUserId) + expense.Amount;

            foreach (var split in expense.Splits)
            {
                balances[split.UserId] = balances.GetValueOrDefault(split.UserId) - split.Amount;
            }
        }

        var debtors = balances.Where(b => b.Value < -0.01m)
            .Select(b => new { UserId = b.Key, Amount = b.Value })
            .OrderBy(b => b.Amount)
            .ToList();

        var creditors = balances.Where(b => b.Value > 0.01m)
            .Select(b => new { UserId = b.Key, Amount = b.Value })
            .OrderByDescending(b => b.Amount)
            .ToList();

        var settlements = new List< SettlementDto > ();

        while (debtors.Any() && creditors.Any())
        {
            var debtor = debtors.First();
            var creditor = creditors.First();

            var settleAmount = Math.Min(Math.Abs(debtor.Amount), creditor.Amount);

            settlements.Add(new SettlementDto
            {
                FromUserId = debtor.UserId,
                FromUserName = userDict.GetValueOrDefault(debtor.UserId, "Unknown"),
                ToUserId = creditor.UserId,
                ToUserName = userDict.GetValueOrDefault(creditor.UserId, "Unknown"),
                Amount = Math.Round(settleAmount, 2)
            });

            var newDebtorBalance = debtor.Amount + settleAmount;
            var newCreditorBalance = creditor.Amount - settleAmount;

            debtors.RemoveAt(0);
            creditors.RemoveAt(0);

            if (newDebtorBalance < -0.01m)
                debtors.Add(new { UserId = debtor.UserId, Amount = newDebtorBalance });

            if (newCreditorBalance > 0.01m)
                creditors.Add(new { UserId = creditor.UserId, Amount = newCreditorBalance });

            debtors = debtors.OrderBy(b => b.Amount).ToList();
            creditors = creditors.OrderByDescending(b => b.Amount).ToList();
        }

        return settlements;
    }
}
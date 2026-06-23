namespace ExpenseSplit.Api.DTOs;

public class CreateExpenseDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int PaidByUserId { get; set; }
    public int GroupId { get; set; }
    public List<SplitDto> Splits { get; set; } = new List<SplitDto>();
}

public class SplitDto
{
    public int UserId { get; set; }
    public decimal Amount { get; set; }
}

public class SettlementDto
{
    public int FromUserId { get; set; }
    public string FromUserName { get; set; } = string.Empty;
    public int ToUserId { get; set; }
    public string ToUserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
export function calculateSplit(amount: number, numPeople: number): number {
    return Math.round((amount / numPeople) * 100) / 100;
}

export function calculateRemainder(amount: number, numPeople: number): number {
    const split = calculateSplit(amount, numPeople);
    return Math.round((amount - split * numPeople) * 100) / 100;
}

export function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'Food & Dining': '🍽️',
        'Transportation': '🚗',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Utilities': '💡',
        'Travel': '✈️',
        'Health': '🏥',
        'Education': '📚',
        'Other': '📦',
    };
    return icons[category] || '📋';
}
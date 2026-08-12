export const formatCurrency = (amount: number, symbol: string = '₱'): string => {
    return `${symbol}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

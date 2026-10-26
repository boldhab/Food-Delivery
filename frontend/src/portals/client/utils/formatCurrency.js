export const formatCurrency = (amount) => {
    return `${(Number(amount) || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ETB`;
};

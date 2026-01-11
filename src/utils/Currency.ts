const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "$",
    CAD: "$",
    CHF: "CHF",
    CNY: "¥",
    KRW: "₩",
    RUB: "₽",
    BRL: "R$",
    INR: "₹",
    MXN: "$",
    NZD: "$",
};

export function symbolForCurrency(code?: string | null): string {
    if (!code) return "";
    const upper = code.toUpperCase();
    return CURRENCY_SYMBOLS[upper] || upper;
}

/**
 * Format a string price with currency symbol, falling back to code if symbol is unknown.
 * Assumes the amount is already in the correct precision for the currency.
 *
 * @param code
 * @param amount
 */
export function formatPrice(code: string, amount: number ): string {
    if (amount === null || amount === undefined ) return "";

    const symbol = symbolForCurrency(code);


    // For single-character symbols (e.g. $, €, £) place symbol directly before amount
    // For multi-character symbols/codes (e.g. CHF or unknown code) place the code before the amount with a space
    if (!symbol || symbol.length > 1) {
        return `${symbol ? symbol + ' ' : ''}${amount}`.trim();
    }

    return `${symbol}${amount}`;
}

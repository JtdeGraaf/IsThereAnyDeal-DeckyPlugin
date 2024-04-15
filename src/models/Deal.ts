export interface Deal {
    shop: {
        id: number;
        name: string;
    };
    price: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    regular: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    cut: number;
    voucher: null | string;
    storeLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    historyLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    flag: string;
    drm: {
        id: number;
        name: string;
    }[];
    platforms: {
        id: number;
        name: string;
    }[];
    timestamp: string;
    expiry: string | null;
    url: string;
}
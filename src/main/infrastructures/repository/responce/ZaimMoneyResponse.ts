export interface ZaimMoneyResponse {
    money: {
        id: number;
        mode: 'income' | 'payment' | 'transfer';
        user_id: number;
        date: string; // YYYY-MM-DD形式
        category_id: number;
        genre_id: number;
        to_account_id: number;
        from_account_id: number;
        amount: number;
        comment: string;
        active: number; // 通常はboolean型を使用しますが、APIレスポンスが1または0を返す場合があるため、ここではnumber型を使用しています。
        name: string;
        receipt_id: number;
        place: string;
        created: string; // 日付と時刻の形式 YYYY-MM-DD HH:MM:SS
        currency_code: 'JPY' | string; // JPYまたは他の通貨コード
    }[];
    requested: number;
}

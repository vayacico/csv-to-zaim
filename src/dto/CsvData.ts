export interface CsvData {
    data: string[][];
    estimated: {
        validRowIndexes: number[];
        dateColumnIndex: number;
        showNameColumnIndex: number;
        paymentColumnIndex: number;
    }
}

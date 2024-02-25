import {Estimated} from '../dto/estimated';

export default class EstimateColumnService {

    async estimateColumn(csvData: string[][]): Promise<Estimated> {

        // 全カラムを走査して日付としてパースできたもののカラムインデックスをカウント
        const validDateColumnsCountMap = new Map<number, number>();
        csvData.forEach((row) => {
            row.forEach((cell, cellIndex) => {
                const date = new Date(cell);
                if (!isNaN(date.getTime())) {
                    validDateColumnsCountMap.set(cellIndex, (validDateColumnsCountMap.get(cellIndex) ?? 0) + 1);
                }
            })
        });
        // 日付カラムの決定
        let dateColumnIndex = -1;
        let dateColumnsMaxCount = -1;
        validDateColumnsCountMap.forEach((count, index) => {
            if (count > dateColumnsMaxCount) {
                dateColumnIndex = index;
                dateColumnsMaxCount = count;
            }
        });

        // 全カラムを走査して数字としてパースできたもののカラムインデックスをカウント
        const validNumberColumnsCountMap = new Map<number, number>();
        csvData.forEach((row) => {
            row.forEach((cell, cellIndex) => {
                if (this.isValidNumber(cell)) {
                    validNumberColumnsCountMap.set(cellIndex, (validNumberColumnsCountMap.get(cellIndex) ?? 0) + 1);
                }
            })
        });
        // 金額カラムの決定
        let paymentColumnIndex = -1;
        let paymentColumnsMaxCount = -1;
        validNumberColumnsCountMap.forEach((count, index) => {
            if (count > paymentColumnsMaxCount) {
                paymentColumnIndex = index;
                paymentColumnsMaxCount = count;
            }
        });

        // 有効な行を推定
        const validRowIndexes: number[] = [];
        csvData.forEach((row, rowIndex) => {
            if (row.length > dateColumnIndex && row.length > paymentColumnIndex
                && !isNaN(new Date(row[dateColumnIndex]).getTime()) && this.isValidNumber(row[paymentColumnIndex])) {
                validRowIndexes.push(rowIndex);
            }
        });

        // 店舗名列候補を取得、日付でも数字でもパースできない行が1つでもあったら店舗名列候補とする
        const shopNameColumnCandidates = new Set<number>();
        validRowIndexes.forEach((value) => {
            const row = csvData[value];
            row.forEach((cell, cellIndex) => {
                const date = new Date(cell);
                if (isNaN(date.getTime()) && !this.isValidNumber(cell)) {
                    shopNameColumnCandidates.add(cellIndex);
                }
            });
        });

        // 店舗名候補列で列ごとのカーディナリーを計算
        const itemListMap = new Map<number, Set<string>>();
        validRowIndexes.forEach((value) => {
            const row = csvData[value];
            shopNameColumnCandidates.forEach((cellIndex) => {
                if (!itemListMap.has(cellIndex)) {
                    itemListMap.set(cellIndex, new Set<string>());
                }
                itemListMap.get(cellIndex)?.add(row[cellIndex]);
            });
        })

        // 店舗名候補列でカーディナリーが最大の列を店舗名列として推定
        let shopNameColumnIndex = -1;
        let maxCardinality = -1;
        itemListMap.forEach((value, key) => {
            if (value.size > maxCardinality) {
                shopNameColumnIndex = key;
                maxCardinality = value.size;
            }
        });

        // 推定結果を返却
        return {
            validRowIndexes: validRowIndexes,
            dateColumnIndex: dateColumnIndex,
            showNameColumnIndex: shopNameColumnIndex,
            paymentColumnIndex: paymentColumnIndex
        };
    }

    private isValidNumber(text: string): boolean {
        const num = Number(text.replace(/,/g, ''));
        return text.length !== 0 && !isNaN(num);

    }
}

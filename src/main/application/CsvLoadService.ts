import * as electron from 'electron';
import CsvRepository from '../domain/model/CsvRepository';
import CsvRepositoryImpl from '../infrastructures/repository/CsvRepositoryImpl';
import {CsvData} from '../../dto/CsvData';
import EstimateColumnService from '../domain/service/EstimateColumnService';

export default class CsvLoadService {
    csvRepository: CsvRepository;
    estimateService: EstimateColumnService;

    constructor() {
        this.csvRepository = new CsvRepositoryImpl();
        this.estimateService = new EstimateColumnService();
    }

    /**
     * ファイル選択ダイアログを開いてCSVを読み込む
     */
    async loadCsv(): Promise<CsvData | null> {
        // ファイル読み込みダイアログを開く
        const result = await electron.dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: 'CSV', extensions: ['csv']}
            ]
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        // CSVを読み込む
        const csvData = await this.csvRepository.readCsv(result.filePaths[0]);

        // データから列の役割を推定する
        const estimated = await this.estimateService.estimateColumn(csvData);

        return {
            data: csvData,
            estimated
        };
    }
}

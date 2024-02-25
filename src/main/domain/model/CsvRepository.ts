export default interface CsvRepository {
    readCsv(path: string): Promise<string[][]>;
}

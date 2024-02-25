import {readFileSync} from 'fs';
import CsvRepository from '../../domain/model/CsvRepository';
import {parse} from 'csv-parse/sync';
import * as iconv from 'iconv-lite';
import Encoding from 'encoding-japanese';

export default class CsvRepositoryImpl implements CsvRepository {
    async readCsv(path: string): Promise<string[][]> {
        const buffer = readFileSync(path);

        const detected = Encoding.detect(buffer);

        if (!detected) {
            throw new Error('Failed to detect file encoding');
        }

        console.log(`Detected encoding: ${detected}`)

        const content = iconv.decode(buffer, detected);

        return await parse(content, {
            relax_column_count: true,
        });
    }

}

import {CsvData} from '../src/dto/CsvData';
import {Result} from '../src/dto/Result';
import {Payment} from '../src/dto/Payment';

export {};

declare global {
    interface Window {
        api: {
            get: (text: string) => Promise<string>;
            openFileSelectDialog: () => Promise<string>;
            loadCsv: () => Promise<Result<CsvData>>;
            getAuthUrl: () => Promise<Result<string>>;
            getAccessToken: (oauthVerifier: string) => Promise<Result<string>>;
            getMoneyData: (from: Date, to: Date) => Promise<Result<Payment[]>>;
            postMoneyData: (date: Date, price: number, shop: string) => Promise<Result<void>>;
            openUrl: (url: string) => Promise<void>;
            closeWindow: () => void
        };
    }
}

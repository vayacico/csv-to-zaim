import ZaimApiRepositoryImpl from '../infrastructures/repository/ZaimApiRepositoryImpl';
import ZaimApiRepository from '../domain/model/ZaimApiRepository';
import {Payment} from '../../dto/Payment';

export default class ZaimService {
    zaimApiRepository: ZaimApiRepository;

    constructor() {
        this.zaimApiRepository = new ZaimApiRepositoryImpl();
    }

    /**
     * 認証URLを取得
     */
    async getAuthUrl(): Promise<string> {
        return await this.zaimApiRepository.getAuthorizeUrl();
    }

    /**
     * コードを用いて認証を実行
     */
    async authorize(code: string): Promise<void> {
        await this.zaimApiRepository.authorize(code);
    }

    /**
     * 決済データを取得
     */
    async getMoneyData(from: Date, to: Date): Promise<Payment[]> {
        return await this.zaimApiRepository.getPaymentList(from, to);
    }

    /**
     * 決済データを送信
     */
    async postMoneyData(payment: Payment): Promise<void> {
        await this.zaimApiRepository.sendPayment(payment.date, payment.price, payment.shopName);
    }
}

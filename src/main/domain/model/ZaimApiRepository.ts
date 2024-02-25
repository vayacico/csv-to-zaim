import {Payment} from '../../../dto/Payment';

export default interface ZaimApiRepository {
    getAuthorizeUrl(): Promise<string>;

    authorize(code: string): Promise<void>;

    getPaymentList(fromDate: Date, toDate: Date): Promise<Payment[]>;

    sendPayment(date: Date, price: number, shop: string): Promise<void>;
}

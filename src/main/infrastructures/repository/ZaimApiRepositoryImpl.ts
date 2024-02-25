import OAuth from 'oauth-1.0a';
import ZaimApiRepository from '../../domain/model/ZaimApiRepository';
import {Payment} from '../../../dto/Payment';
import dayjs from 'dayjs';
import {ZaimMoneyResponse} from './responce/ZaimMoneyResponse';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

declare const ZAIM_CONSUMER_KEY: string;
declare const ZAIM_CONSUMER_SECRET: string;

export default class ZaimApiRepositoryImpl implements ZaimApiRepository {

    oauth: OAuth
    oauthToken = '';
    oauthTokenSecret = '';
    userOAuthToken = '';
    userOAuthTokenSecret = '';

    constructor() {
        this.oauth = new OAuth({
            consumer: {
                key: ZAIM_CONSUMER_KEY,
                secret: ZAIM_CONSUMER_SECRET,
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string: string, key: string): string {
                return crypto.createHmac('sha1', key).update(base_string).digest('base64');
            },
        });
    }

    async getAuthorizeUrl(): Promise<string> {

        const requestTokenUrl = 'https://api.zaim.net/v2/auth/request';
        const requestTokenData = {
            url: requestTokenUrl,
            method: 'POST',
            data: {oauth_callback: 'oob'},
        };

        const oauthHeader = this.oauth.toHeader(this.oauth.authorize(requestTokenData));

        try {
            const response = await fetch(requestTokenData.url, {
                method: requestTokenData.method,
                headers: {
                    ...oauthHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const result = await response.text();
            const params = new URLSearchParams(result);

            this.oauthToken = params.get('oauth_token');
            this.oauthTokenSecret = params.get('oauth_token_secret');
            const authenticateUrl = `https://auth.zaim.net/users/auth?oauth_token=${this.oauthToken}`;
            console.log('認証URL:', authenticateUrl);
            return authenticateUrl;
        } catch (error) {
            console.error('Error:', error);
            throw error
        }
    }

    async authorize(code: string): Promise<void> {
        const accessTokenData = {
            url: 'https://api.zaim.net/v2/auth/access',
            method: 'POST',
            data: {oauth_verifier: code},
        };

        const oauthHeader = this.oauth.toHeader(this.oauth.authorize(accessTokenData, {
            key: this.oauthToken,
            secret: this.oauthTokenSecret
        }));

        try {
            const response = await fetch(accessTokenData.url, {
                method: 'POST',
                headers: {
                    ...oauthHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const result = await response.text();
            console.log('アクセストークンの取得結果:', result);

            const params = new URLSearchParams(result);
            this.userOAuthToken = params.get('oauth_token');
            this.userOAuthTokenSecret = params.get('oauth_token_secret');
        } catch (error) {
            console.error('Error:' + error)
            throw error
        }

    }

    async getPaymentList(fromDate: Date, toDate: Date): Promise<Payment[]> {

        const result: Payment[] = [];

        // 念のため最大20ページとする
        for (let page = 1; page <= 20; page++) {

            const apiBaseUrl = 'https://api.zaim.net/v2/home/money';
            const method = 'GET';
            const queryParams = new URLSearchParams({
                mapping: '1',
                mode: 'payment',
                start_date: dayjs(fromDate).format('YYYY-MM-DD'),
                end_date: dayjs(toDate).format('YYYY-MM-DD'),
                limit: '100',
                page: page.toString(),
            });

            const url = `${apiBaseUrl}?${queryParams.toString()}`;

            // APIリクエストの認証情報を生成
            const requestData = {
                url: url,
                method: method,
            };

            console.log('requestData:', url);

            const headers = this.oauth.toHeader(this.oauth.authorize(requestData, {
                key: this.userOAuthToken,
                secret: this.userOAuthTokenSecret
            }));

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`APIリクエスト失敗: ${response.statusText}`);
                }

                const data: ZaimMoneyResponse = await response.json();
                console.log('支出データ:', data);
                result.push(...data.money.map((money) => {
                    return {
                        date: new Date(money.date),
                        price: money.amount,
                        shopName: money.place,
                        memo: money.comment,
                    };
                }));
                if (data.money.length < 100) {
                    break;
                }
            } catch (error) {
                console.error('APIリクエストエラー:', error);
                throw error
            }
        }

        return result;
    }

    async sendPayment(date: Date, price: number, shop: string): Promise<void> {
        const apiBaseUrl = 'https://api.zaim.net/v2/home/money/payment';
        const method = 'POST';

        // APIリクエストの認証情報を生成
        const requestData = {
            url: apiBaseUrl,
            method: method,
            data: {
                mapping: '1',
                category_id: 101,
                genre_id: 10101,
                amount: price,
                date: dayjs(date).format('YYYY-MM-DD'),
                place: shop,
                comment: '店舗名：' + shop,
            }
        };

        const headers = this.oauth.toHeader(this.oauth.authorize(requestData, {
            key: this.userOAuthToken,
            secret: this.userOAuthTokenSecret
        }));

        const encodedBody = querystring.stringify(requestData.data);

        try {
            const response = await fetch(apiBaseUrl, {
                method: method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: encodedBody,
            });

            if (!response.ok) {
                console.dir(await response.json());
                throw new Error(`APIリクエスト失敗: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('支出登録結果:', data);
        } catch (error) {
            console.error('APIリクエストエラー:', error);
            throw error;
        }
    }
}

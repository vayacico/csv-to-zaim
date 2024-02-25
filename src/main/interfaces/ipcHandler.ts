import {BrowserWindow, ipcMain, shell} from 'electron';
import CsvLoadService from '../application/CsvLoadService';
import ZaimService from '../application/ZaimService';

const registerHandler = (browserWindow: BrowserWindow | null) => {

    const csvLoadService = new CsvLoadService();
    const zaimService = new ZaimService();

    // ファイル選択ダイアログを開いてCSVを読み込む
    ipcMain.handle('LOAD_CSV', async (event) => {
        try {
            const result = await csvLoadService.loadCsv();
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    // 認証URLを取得
    ipcMain.handle('GET_AUTH_URL', async (event) => {
        try {
            const result = await zaimService.getAuthUrl();
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    // アクセストークンを取得
    ipcMain.handle('GET_ACCESS_TOKEN', async (event, oauthVerifier: string) => {
        try {
            const result = await zaimService.authorize(oauthVerifier);
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    // Zaimに登録された決済データを取得
    ipcMain.handle('GET_MONEY_DATA', async (event, from: Date, to: Date) => {
        try {
            const result = await zaimService.getMoneyData(from, to);
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    // Zaimに決済データを送信
    ipcMain.handle('POST_MONEY_DATA', async (event, date: Date, price: number, shop: string) => {
        try {
            const result = await zaimService.postMoneyData({date, price, shopName: shop});
            return {
                success: true,
                data: result
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    })

    // URLをブラウザで開く
    ipcMain.handle('OPEN_URL', async (event, url: string) => {
        await shell.openExternal(url);
    })

    // アプリケーションを閉じる
    ipcMain.handle('APPLICATION_CLOSE', async () => {
        browserWindow?.close();
    });
}
export default registerHandler;


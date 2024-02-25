// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import {contextBridge, ipcRenderer} from 'electron'
import {Result} from '../dto/Result';

contextBridge.exposeInMainWorld('api', {
    get(text: string): Promise<string> {
        return ipcRenderer.invoke('TEST', text)
    },
    async openFileSelectDialog(): Promise<string> {
        console.log('openFileSelectDialog')
        return await ipcRenderer.invoke('OPEN_FILE_SELECT_DIALOG')
    },
    async loadCsv(): Promise<Result<string[] | null>> {
        console.log('loadCsv')
        return await ipcRenderer.invoke('LOAD_CSV')
    },

    async getAuthUrl(): Promise<Result<string>> {
        console.log('getAuthUrl')
        return await ipcRenderer.invoke('GET_AUTH_URL')
    },
    async getAccessToken(oauthVerifier: string): Promise<Result<string>> {
        console.log('getAccessToken')
        return await ipcRenderer.invoke('GET_ACCESS_TOKEN', oauthVerifier)
    },
    async getMoneyData(from: Date, to: Date): Promise<Result<string>> {
        console.log('getMoneyData')
        return await ipcRenderer.invoke('GET_MONEY_DATA', from, to)
    },
    async postMoneyData(date: Date, price: number, shop: string): Promise<Result<void>> {
        console.log('postMoneyData')
        return await ipcRenderer.invoke('POST_MONEY_DATA', date, price, shop)
    },
    async openUrl(url: string): Promise<void> {
        console.log('openUrl')
        return await ipcRenderer.invoke('OPEN_URL', url)
    },
    async closeWindow() {
        return ipcRenderer.invoke('APPLICATION_CLOSE')
    }
})

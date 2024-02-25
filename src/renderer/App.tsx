import React from 'react';
import CsvInputComponent from './component/csvInput/CsvInputComponent';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    ChakraProvider
} from '@chakra-ui/react';
import {CsvData} from '../dto/CsvData';
import DataSelectComponent from './component/dataSelect/DataSelectComponent';
import TitleBarComponents from './component/common/TitleBarComponents';
import {styled} from 'styled-components';
import ProgressInformation from './component/common/ProgressInformation';
import LoginComponent from './component/login/LoginComponent';
import SendConfirm from './component/SendConfirm';
import dayjs from 'dayjs';

const Wrapper = styled.div`
  position: fixed;
  border-bottom: 4px #595959 solid;
  border-right: 4px #595959 solid;
  border-left: 4px #595959 solid;
  width: 100%;
  height: 100%;
`

export interface SendTarget {
    id: number,
    isSelected: boolean,
    isRegistered: boolean,
    date: Date,
    price: number,
    shopName: string,
    duplicated?: { item: 'PRICE' | 'PRICE_AND_SHOP', message: string, shopName?: string }

    errorMessage?: string
}

const App: React.FC = () => {

    const [pageMode, setPageMode] = React.useState<'input' | 'login' | 'confirm' | 'send'>('input')
    const [csvData, setCsvData] = React.useState<CsvData | null>(null)
    const [sendTargetData, setSendTargetData] = React.useState<SendTarget[]>([])
    const [isSending, setIsSending] = React.useState<boolean>(false)
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isDone, setIsDone] = React.useState<boolean>(false)
    const [alertMessage, setAlertMessage] = React.useState<string | null>(null)

    const cancelRef = React.useRef()
    const selectCsv = async () => {
        const result = await window.api.loadCsv()
        if (!result || !result.success) {
            setAlertMessage('CSVファイルの読み込みに失敗しました')
            return
        }
        if (result.data === null) {
            return
        }
        setCsvData(result.data)
        setPageMode('confirm')
    }

    const reset = () => {
        history.go(0)
    }

    const decideData = (dataColumnIndex: number, shopColumnIndex: number, priceColumnIndex: number) => {
        setPageMode('login')
        console.log(dataColumnIndex, shopColumnIndex, priceColumnIndex)
        if (!csvData) {
            return
        }
        const data: SendTarget[] = []
        csvData.data.forEach((row, index) => {
            const date = new Date(row[dataColumnIndex])
            const price = Number(row[priceColumnIndex] ? row[priceColumnIndex].replace(/,/g, '') : '')
            const shopName = row[shopColumnIndex]
            if (isNaN(date.getTime()) || isNaN(price) || !shopName) {
                return
            }
            data.push({date, price, shopName, id: index, isSelected: true, isRegistered: false})
        })
        setSendTargetData(data)
    }

    const getLoginUrl = async () => {
        const result = await window.api.getAuthUrl()
        if (!result.success) {
            setAlertMessage('Zaimの認証URLの取得に失敗しました。(Error:' + result.message + ')')
            return ''
        }
        return result.data
    }

    const auth = async (code: string) => {
        setIsLoading(true)
        const result = await window.api.getAccessToken(code)
        if (!result) {
            setAlertMessage('Zaimの認証に失敗しました。(Error:' + result.message + ')')
            setIsLoading(false)
            return
        }
        const minDate = new Date(Math.min(...sendTargetData.map((payment) => payment.date.getTime())));
        const maxDate = new Date(Math.max(...sendTargetData.map((payment) => payment.date.getTime())));
        const registeredData = await window.api.getMoneyData(minDate, maxDate)
        if (!registeredData || !registeredData.success) {
            setAlertMessage('Zaimからのデータ取得に失敗しました')
            setIsLoading(false)
            return
        }

        const checkedSendData = sendTargetData.map((payment) => {
            const priceAndShopDuplicated = registeredData.data.find((data) =>
                dayjs(data.date).format('YYYY-MM-DD') === dayjs(payment.date).format('YYYY-MM-DD')
                && data.price === payment.price && (removeSpace(data.shopName) === removeSpace(payment.shopName) || data.memo?.includes(payment.shopName)))
            if (priceAndShopDuplicated) {
                return {
                    ...payment,
                    isSelected: false,
                    duplicated: {
                        item: 'PRICE_AND_SHOP' as 'PRICE' | 'PRICE_AND_SHOP',
                        message: 'この日付で金額と店名が同じデータがあります'
                    }
                }
            } else {
                const priceDuplicated = registeredData.data.find((data) =>
                    dayjs(data.date).format('YYYY-MM-DD') === dayjs(payment.date).format('YYYY-MM-DD')
                    && data.price === payment.price)
                if (priceDuplicated) {
                    return {
                        ...payment,
                        duplicated: {
                            item: 'PRICE' as 'PRICE' | 'PRICE_AND_SHOP',
                            message: 'この日付で金額が同じデータがあります',
                            shopName: priceDuplicated.shopName
                        },
                    }
                } else {
                    return payment
                }
            }
        })
        setSendTargetData(checkedSendData)
        setPageMode('send')
    }

    const removeSpace = (str: string) => {
        return str.replace(/[\u3000\s]/g, '');
    }

    const setIsSelected = (id: number, isSelected: boolean) => {
        const newSendTargetData = sendTargetData.map((data) => {
            if (data.id === id) {
                return {...data, isSelected}
            }
            return data
        })
        setSendTargetData(newSendTargetData)
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const executeSend = async () => {
        setIsSending(true)
        const targetData = sendTargetData.filter((data) => data.isSelected)
        for (const data of targetData) {
            try {
                const result = await window.api.postMoneyData(data.date, data.price, data.shopName)
                if (!result || !result.success) {
                    throw new Error(result.message)
                }
            } catch (e) {
                setSendTargetData((prev) => prev.map((d) => {
                    if (d.id === data.id) {
                        return {...d, errorMessage: e.message}
                    }
                    return d
                }
                ))
            }
            await sleep(200)
            setSendTargetData((prev) => prev.map((d) => {
                if (d.id === data.id) {
                    return {...d, isRegistered: true}
                }
                return d
            }
            ))
        }
        setIsSending(false)
        setIsDone(true)
    }

    return <Wrapper>
        <ChakraProvider>
            <TitleBarComponents></TitleBarComponents>
            <ProgressInformation mode={pageMode} isDone={isDone}></ProgressInformation>
            {pageMode === 'input' && <CsvInputComponent selectCsv={() => selectCsv()}/>}
            {pageMode === 'confirm' && <DataSelectComponent csvData={csvData} decideData={decideData}/>}
            {pageMode === 'login' &&
                <LoginComponent getLoginUrl={getLoginUrl} auth={auth} isLoading={isLoading}></LoginComponent>}
            {pageMode === 'send' &&
                <SendConfirm isSending={isSending} isDone={isDone} sendData={sendTargetData}
                    setIsSelected={setIsSelected}
                    executeSend={executeSend}></SendConfirm>}

            <AlertDialog
                isOpen={alertMessage !== null}
                onClose={() => {
                    setAlertMessage(null)
                }}
                leastDestructiveRef={cancelRef}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            エラー
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {alertMessage}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button colorScheme='red' ml={3} onClick={() => reset()}>
                                閉じる
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </ChakraProvider>
    </Wrapper>
}
export default App

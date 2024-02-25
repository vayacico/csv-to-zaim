import React from 'react';
import styled, {css} from 'styled-components';
import {Button, Checkbox, Table, TableContainer, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr} from '@chakra-ui/react';
import {SendTarget} from '../App';
import {CheckIcon} from '@chakra-ui/icons';
import dayjs from 'dayjs';

interface Props {
    isSending: boolean
    isDone: boolean
    sendData: SendTarget[]

    setIsSelected: (index: number, isSelected: boolean) => void

    executeSend: () => void
}

const Wrapper = styled.div`
  height: 100%;
`

const InformationArea = styled.div`
  height: 93px;
  display: flex;
  margin: 20px;
`
const MessageArea = styled.div``

const TableAreaWrapper = styled.div`
  display: flex;
  height: calc(100% - 170px);

`
const TableWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`

const ColumnThead = styled(Thead)`
  background-color: #fff;
`

const CustomTr = styled(Tr)<{ mode: 'DISABLE' | 'DONE' | 'NONE' }>`
  ${(props) => props.mode === 'DISABLE' ? css`background-color: #b0b0b0` : ''}
  ${(props) => props.mode === 'DONE' ? css`background-color: #ccf0ff` : ''}
`

const SendButton = styled(Button)`
  margin-left: auto;
`
const FinishButton = styled(Button)`
  margin-left: auto;
`

const CustomLink = styled.a`
  padding-top: 40px;
  padding-bottom: 40px;

  &:hover {
    text-decoration: underline;
  }
`
const SendConfirm: React.FC<Props> = (props) => {

    let message = '送信するデータを確認してください'
    if (props.isSending) {
        message = '送信中です (' + props.sendData.filter(data => data.isRegistered).length + '/' + props.sendData.length + ')'
    } else if (props.isDone) {
        if (props.sendData.filter(data => data.errorMessage).length > 0) {
            message = '送信に失敗したデータがあります。必要に応じて再実行してください。'
        } else {
            message = '送信が完了しました。Webでデータを確認してください。'

        }
    }

    const minDate = new Date(Math.min(...props.sendData.map((data) => data.date.getTime())));
    const dateText = dayjs(minDate).format('YYYYMM')

    const getToolTip = (data: SendTarget) => {
        if (props.isSending || props.isDone) {
            if (data.errorMessage) {
                return <Tooltip label={data.errorMessage}>
                    <Tag colorScheme={'red'}>
                        エラー
                    </Tag>
                </Tooltip>
            } else if (!data.isSelected) {
                return <Tag>
                    送信対象外
                </Tag>
            } else if (data.isRegistered) {
                return <Tooltip label="Zaimへの送信が完了しました">
                    <Tag colorScheme={'green'}>
                        送信完了
                    </Tag>
                </Tooltip>
            } else {
                return <Tag>
                    待機中
                </Tag>
            }
        } else {
            if (data.duplicated && data.duplicated.item === 'PRICE_AND_SHOP') {
                return <Tooltip label={<>{data.duplicated.message}</>}>
                    <Tag colorScheme={'red'}>
                        重複あり
                    </Tag>
                </Tooltip>
            } else if (data.duplicated && data.duplicated.item === 'PRICE') {
                return <Tooltip label={<>{data.duplicated.message}<br/>店名：{data.duplicated.shopName}</>}>
                    <Tag colorScheme={'yellow'}>
                        重複可能性あり
                    </Tag>
                </Tooltip>
            } else {
                return <Tooltip label='「日付と金額」「日付と金額と店名」で重複するものはありませんでした'>
                    <Tag>
                        重複なし
                    </Tag>
                </Tooltip>
            }
        }
    }

    return <Wrapper>
        <TableAreaWrapper>
            <TableWrapper>
                <TableContainer overflowX="unset" overflowY="unset">
                    <Table size='sm'>
                        <ColumnThead position="sticky" top={-1} zIndex="docked">
                            <Tr>
                                <Th></Th>
                                <Th>{props.isSending ? 'ステータス' : '登録済みデータとの重複'}</Th>
                                <Th>日付</Th>
                                <Th>お店</Th>
                                <Th>金額</Th>
                            </Tr>
                        </ColumnThead>
                        <Tbody>
                            {props.sendData.map((data, index) => {
                                return <CustomTr key={index}
                                    mode={!data.isSelected ? 'DISABLE' : (data.isRegistered ? 'DONE' : 'NONE')}>
                                    <Td><Checkbox isChecked={data.isSelected}
                                        onChange={(e) => props.setIsSelected(data.id, e.target.checked)}
                                        isDisabled={props.isSending}></Checkbox></Td>
                                    <Td>
                                        {getToolTip(data)}
                                    </Td>
                                    <Td>{data.date.toLocaleDateString()}</Td>
                                    <Td>{data.shopName}</Td>
                                    <Td>{data.price}円</Td>
                                </CustomTr>
                            })}
                        </Tbody>
                    </Table>
                </TableContainer>
            </TableWrapper>

        </TableAreaWrapper>
        <InformationArea>
            <MessageArea>
                <Text fontSize={'lg'}>{message}</Text>
                {props.isDone && <CustomLink href={'#'}
                    onClick={() => window.api.openUrl('https://zaim.net/money?month=' + dateText)}>{'https://zaim.net/money?month=' + dateText}</CustomLink>}
            </MessageArea>
            {props.isDone
                ? <FinishButton mt={4} colorScheme='green' onClick={() => window.api.closeWindow()}>終了</FinishButton>
                :
                <SendButton
                    isDisabled={props.sendData.filter(data => data.isSelected).length === 0}
                    isLoading={props.isSending}
                    rightIcon={<CheckIcon/>}
                    mt={4}
                    colorScheme='blue'
                    type='submit'
                    onClick={() => props.executeSend()}
                >
                    Zaimに送信
                </SendButton>}

        </InformationArea>

    </Wrapper>
}
export default SendConfirm

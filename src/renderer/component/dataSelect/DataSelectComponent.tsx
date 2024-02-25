import React, {useEffect} from 'react';
import {CsvData} from '../../../dto/CsvData';
import {Button, Select, Table, TableContainer, Tbody, Td, Text, Thead, Tr} from '@chakra-ui/react';
import {styled} from 'styled-components';
import {ArrowForwardIcon} from '@chakra-ui/icons';

interface Props {
    csvData: CsvData | null
    decideData: (dataColumnIndex: number, shopColumnIndex: number, priceColumnIndex: number) => void
}

const TableWrapper = styled.div`
  display: flex;
  overflow-y: scroll;
  height: calc(100% - 170px);
`

const DataTd = styled(Td)`
  background-color: #c0d0fc;
`
const PaymentTd = styled(Td)`
  background-color: #d1ffcc;
`
const ShopTd = styled(Td)`
  background-color: #ffbcbc;
`

const Wrapper = styled.div`
  height: 100%;
`

const MessageArea = styled.div`
  height: 93px;
  display: flex;
  margin: 20px;
`
const ColumnThead = styled(Thead)`
  background-color: #fff;
`

const NextButton = styled(Button)`
  margin-left: auto;
`

const CustomTd = styled(Td)`
  min-width: 160px;
`

const DataSelectComponent: React.FC<Props> = (props) => {

    if (!props.csvData) {
        return <div>データがありません</div>
    }
    console.dir(props)

    const [dataColumnIndex, setDataColumnIndex] = React.useState<number>(props.csvData.estimated.dateColumnIndex)
    const [priceColumnIndex, setPriceColumnIndex] = React.useState<number>(props.csvData.estimated.paymentColumnIndex)
    const [shopColumnIndex, setShopColumnIndex] = React.useState<number>(props.csvData.estimated.showNameColumnIndex)
    const [validRowIndexes, setValidRowIndexes] = React.useState<number[]>(props.csvData.estimated.validRowIndexes)
    const [hasValidDate, setHasValidDate] = React.useState<boolean>(validRowIndexes.length > 0)

    const columnsNum = props.csvData.data.reduce((prev, current) => {
        return prev > current.length ? prev : current.length
    }, 0)

    const selectColumnTypes = (columnIndex: number, type: string) => {
        if (type === 'date') {
            if (columnIndex === priceColumnIndex) {
                setPriceColumnIndex(-1)
            }
            if (columnIndex === shopColumnIndex) {
                setShopColumnIndex(-1)
            }
            setDataColumnIndex(columnIndex)
        } else if (type === 'shop') {
            if (columnIndex === dataColumnIndex) {
                setDataColumnIndex(-1)
            }
            if (columnIndex === priceColumnIndex) {
                setPriceColumnIndex(-1)
            }
            setShopColumnIndex(columnIndex)
        } else if (type === 'price') {
            if (columnIndex === dataColumnIndex) {
                setDataColumnIndex(-1)
            }
            if (columnIndex === shopColumnIndex) {
                setShopColumnIndex(-1)
            }
            setPriceColumnIndex(columnIndex)
        }
    }

    const isValidNumber = (text: string) => {
        const num = Number(text ? text.replace(/,/g, '') : '');
        return text && text.length !== 0 && !isNaN(num);
    }

    useEffect(() => {
        console.log({dataColumnIndex, priceColumnIndex, shopColumnIndex})
        const tmpValidRowIndexes: number[] = []
        props.csvData.data.forEach((row, index) => {
            if (row.length > dataColumnIndex && row.length > priceColumnIndex && row.length > shopColumnIndex) {
                const date = new Date(row[dataColumnIndex])
                if (!isNaN(date.getTime()) && isValidNumber(row[priceColumnIndex])) {
                    tmpValidRowIndexes.push(index)
                }
            }
        })
        setValidRowIndexes(tmpValidRowIndexes)
        setHasValidDate(tmpValidRowIndexes.length > 0)
    }, [dataColumnIndex, priceColumnIndex, shopColumnIndex])

    const columnTypeSelect: React.ReactElement[] = [];
    for (let i = 0; i < columnsNum; i++) {
        let tmpValue = 'none'
        if (i === dataColumnIndex) {
            tmpValue = 'date'
        } else if (i === shopColumnIndex) {
            tmpValue = 'shop'
        } else if (i === priceColumnIndex) {
            tmpValue = 'price'
        }
        columnTypeSelect.push(
            <Td key={i}>
                <Select size={'sm'} placeholder='' value={tmpValue}
                    onChange={(value) => selectColumnTypes(i, value.target.value)}>
                    <option value='none'></option>
                    <option value='date'>日付</option>
                    <option value='shop'>店舗名</option>
                    <option value='price'>金額</option>
                </Select>
            </Td>)
    }

    const dataRows = props.csvData.data.map((row, rowIndex) => {
        const columns = row.map((column, columnIndex) => {
            if (validRowIndexes.includes(rowIndex)) {
                if (columnIndex === dataColumnIndex) {
                    return <DataTd key={`${rowIndex}-${columnIndex}`}>{column}</DataTd>
                } else if (columnIndex === priceColumnIndex) {
                    return <PaymentTd key={`${rowIndex}-${columnIndex}`}>{column}</PaymentTd>
                } else if (columnIndex === shopColumnIndex) {
                    return <ShopTd key={`${rowIndex}-${columnIndex}`}>{column}</ShopTd>
                }
            }
            return <CustomTd key={`${rowIndex}-${columnIndex}`}>{column}</CustomTd>
        })
        for (let i = row.length; i < columnsNum; i++) {
            columns.push(<CustomTd key={`${rowIndex}-${i}`}></CustomTd>)
        }

        if (validRowIndexes.includes(rowIndex)) {
            return <Tr key={rowIndex}>{columns}</Tr>

        } else {
            return <Tr key={rowIndex}>{columns}</Tr>
        }
    })

    return <Wrapper>
        <TableWrapper>
            <TableContainer overflowX="unset" overflowY="unset">
                <Table size='sm'>
                    <ColumnThead position="sticky" top={-1} zIndex="docked">
                        {columnTypeSelect}
                    </ColumnThead>
                    <Tbody>
                        {dataRows}
                    </Tbody>
                </Table>
            </TableContainer>
        </TableWrapper>
        <MessageArea>
            <Text fontSize={'lg'}>日付、金額、店舗名を選択してください</Text>
            <NextButton isDisabled={!hasValidDate} rightIcon={<ArrowForwardIcon/>} colorScheme='blue'
                onClick={() => props.decideData(dataColumnIndex, shopColumnIndex, priceColumnIndex)}>
                次へ
            </NextButton>
        </MessageArea>
    </Wrapper>

}
export default DataSelectComponent

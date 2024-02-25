import React from 'react';
import {styled} from 'styled-components';
import {Button} from '@chakra-ui/react';
import {AddIcon} from '@chakra-ui/icons';

interface Props {
    selectCsv: () => void
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MessageWrapper = styled.div`
  margin-top: -50px;
`

const Message = styled.p`
  color: #868383;
  font-size: 1.5em;
  margin-bottom: 20px;
`

const CsvInputComponent: React.FC<Props> = (props) => {

    return <Wrapper>
        <MessageWrapper>
            <Message>ZaimにアップロードするCSVファイルを選択してください</Message>
            <Button colorScheme="blue" leftIcon={<AddIcon/>} onClick={() => props.selectCsv()}>ファイルを選択</Button>
        </MessageWrapper>
    </Wrapper>
}

export default CsvInputComponent

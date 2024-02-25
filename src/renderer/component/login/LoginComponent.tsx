import React, {useEffect} from 'react';
import {Button, Input} from '@chakra-ui/react';
import styled from 'styled-components';

interface Props {
    getLoginUrl: () => Promise<string>
    auth: (code: string) => void
    isLoading: boolean
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
  width: 80%;
  margin-top: -50px;
`
const Message = styled.p`
  color: #868383;
  font-size: 1.5em;
  margin-bottom: 10px;
`
const CustomLink = styled.a`
  padding-top: 40px;
  padding-bottom: 40px;

  &:hover {
    text-decoration: underline;
  }
`
const CustomInput = styled(Input)`
  margin-top: 20px;
`

const LoginComponent: React.FC<Props> = (props) => {

    const [authUrl, setAuthUrl] = React.useState<string>('')
    const [authCode, setAuthCode] = React.useState<string>('')

    useEffect(() => {
        props.getLoginUrl().then(url => {
            setAuthUrl(url)
        })
    }, [])

    return <Wrapper>
        <MessageWrapper>
            <Message>データの取得と登録のためにZaimとの連携を行います<br/>以下のURLからログインを行い、表示された文字列を入力してください</Message>
            <CustomLink href={'#'} onClick={() => window.api.openUrl(authUrl)}>
                {authUrl}
            </CustomLink>
            <CustomInput placeholder='ここに表示されたキーをコピペ' value={authCode}
                onChange={(value: { target: { value: React.SetStateAction<string>; }; }) => setAuthCode(value.target.value)}/>
            <Button
                isDisabled={authCode === ''}
                isLoading={props.isLoading}
                mt={4}
                colorScheme='teal'
                type='submit'
                onClick={() => props.auth(authCode)}
            >
                認証
            </Button>
        </MessageWrapper>

    </Wrapper>
}
export default LoginComponent

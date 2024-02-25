import React, {useEffect} from 'react';
import {
    Box,
    Step,
    StepIcon,
    StepIndicator,
    StepNumber,
    Stepper,
    StepSeparator,
    StepStatus,
    StepTitle,
    useSteps
} from '@chakra-ui/react';
import {css, styled} from 'styled-components';

interface Props {
    mode: 'input' | 'login' | 'confirm' | 'send';
    isDone: boolean
}

const steps = [
    {title: '読み込み', description: 'CSVファイルを読み込みます'},
    {title: '列選択', description: 'Zaimに登録する列を選択します'},
    {title: 'ログイン', description: 'Zaimにログインします'},
    {title: 'データ選択', description: 'データをZaimに送信します'},
    {title: '送信', description: 'データをZaimに送信します'},
]

const Wrapper = styled.div`
  padding-top: 42px;
  padding-left: 24px;
  padding-right: 40px;
  padding-bottom: 10px;
  border-bottom: 2px #b0b0b0 solid;
`

const CustomStepTitle = styled(StepTitle)<{ isActive: boolean }>`
  ${(props) => props.isActive ? css`color: #000000;` : css`color: #c5c5c5;`}
`

const ProgressInformation: React.FC<Props> = (props) => {

    let stepNumber = 0
    if (props.mode === 'input') {
        stepNumber = 0
    } else if (props.mode === 'confirm') {
        stepNumber = 1
    } else if (props.mode === 'login') {
        stepNumber = 2
    } else if (props.mode === 'send') {
        stepNumber = 3
    }

    if (props.isDone) {
        stepNumber = 5
    }

    const {activeStep, setActiveStep} = useSteps({
        index: stepNumber,
        count: steps.length,
    })
    useEffect(() => {
        setActiveStep(stepNumber)
    }, [props.mode, props.isDone])

    return (
        <Wrapper>
            <Stepper index={activeStep} size={'sm'} colorScheme={'green'}>
                {steps.map((step, index) => (
                    <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                                complete={<StepIcon/>}
                                incomplete={<StepNumber/>}
                                active={<StepNumber/>}
                            />
                        </StepIndicator>

                        <Box flexShrink='0'>
                            <CustomStepTitle isActive={index <= activeStep}>{step.title}</CustomStepTitle>
                        </Box>

                        <StepSeparator/>
                    </Step>
                ))}
            </Stepper>
        </Wrapper>

    )
}
export default ProgressInformation

import {styled} from 'styled-components';
import {BsX} from 'react-icons/bs';
import React from 'react';

const Wrapper = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 31px;
  position: fixed;
  background-color: #595959;
  display: flex;
`;

const DraggableArea = styled.div`
  -webkit-app-region: drag;
  width: calc(100% - 32px);
  height: 100%;
`;

const ButtonArea = styled.div`
  width: 32px;
  height: 100%;
  display: flex;
`;

const CloseButtonArea = styled.div`
  height: 31px;
  width: 32px;
  color: #c8d5e1;
  background-color: transparent;

  &:hover {
    background-color: #c55350;
    color: white;
  }
`;

const CloseButton = styled(BsX)`
  height: 32px;
  width: 25px;
  margin-left: 2px;
`;

const TitleBarComponents: React.FC = () => {

    return (
        <Wrapper>
            <DraggableArea>
            </DraggableArea>
            <ButtonArea>
                <CloseButtonArea>
                    <CloseButton onClick={() => window.api.closeWindow()}/>
                </CloseButtonArea>
            </ButtonArea>
        </Wrapper>
    );
}
export default TitleBarComponents;

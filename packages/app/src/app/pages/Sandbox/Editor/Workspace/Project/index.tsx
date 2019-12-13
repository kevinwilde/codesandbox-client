import React, { FunctionComponent } from 'react';

import { Description } from './Description';
import { BasicInfo, Container, Group } from './elements';
import { Environment } from './Environment';
import { SandboxConfig } from './SandboxConfig';
import { Title } from './Title';

type Props = {
  editable?: boolean;
};
export const Project: FunctionComponent<Props> = ({ editable = false }) => (
  <Container>
    <BasicInfo>
      <Title editable={editable} />
      <Description editable={editable} />
    </BasicInfo>
    <Group>
      <Environment />
    </Group>
    {editable && <SandboxConfig />}
  </Container>
);

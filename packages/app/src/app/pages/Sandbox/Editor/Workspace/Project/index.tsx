import React, { FunctionComponent } from 'react';

import { useOvermind } from 'app/overmind';

// import { Alias } from './Alias';
import { Author } from './Author';
import { Description } from './Description';
import { BasicInfo, Container, Group } from './elements';
import { Environment } from './Environment';
import { ForkedFrom } from './ForkedFrom';
import { Frozen } from './Frozen';
import { Git } from './Git';
import { Keywords } from './Keywords';
import { Privacy } from './Privacy';
import { PrivacyNotice } from './PrivacyNotice';
import { SandboxConfig } from './SandboxConfig';
import { Team } from './Team';
import { Title } from './Title';

type Props = {
  editable?: boolean;
};
export const Project: FunctionComponent<Props> = ({ editable = false }) => {
  const {
    state: {
      editor: {
        currentSandbox: {
          author,
          forkedFromSandbox,
          forkedTemplateSandbox,
          git,
          team,
        },
      },
      isPatron,
    },
  } = useOvermind();

  return (
    <Container>
      <BasicInfo>
        <Title editable={editable} />

        <Description editable={editable} />

        {/* Disable until we also moved SSE over */}
        {/* {isPatron && <Alias editable={editable} />} */}
      </BasicInfo>

      {!team && author && <Author />}

      {team && <Team/>}

      {git && <Git />}

      <Keywords editable={editable} />

      <Group>
        <Privacy editable={editable} />

        {!isPatron && <PrivacyNotice />}

        {editable && <Frozen />}

        {(forkedFromSandbox || forkedTemplateSandbox) && <ForkedFrom />}

        <Environment />
      </Group>

      {editable && <SandboxConfig />}
    </Container>
  );
};

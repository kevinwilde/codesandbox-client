import { useOvermind } from 'app/overmind';
import React from 'react';

import {
  SaveAllButton,
  RefreshButton,
  PreferencesButton,
  NewSandboxButton,
} from './Buttons';
import {
  Container,
  Right,
  Left,
  Centered,
} from './elements';
import { Logo } from './Logo';
import { MenuBar } from './MenuBar';
import { SandboxName } from './SandboxName';
import { IHeaderProps } from './types';

export const Header: React.FC<IHeaderProps> = ({ zenMode }) => {
  const {
    state: {
      preferences: {
        settings: { experimentVSCode: vscode },
      },
      updateStatus,
    },
  } = useOvermind();

  return (
    <Container zenMode={zenMode} as="header">
      <Left>
        <Logo />
        {vscode ? <MenuBar /> : <SaveAllButton />}
      </Left>

      <Centered>
        <SandboxName />
      </Centered>

      <Right>
        {updateStatus === 'available' && <RefreshButton />}
        <PreferencesButton />
        <NewSandboxButton />
      </Right>
    </Container>
  );
};

import { useOvermind } from 'app/overmind';
import getWorkspaceItems, { getDisabledItems } from 'app/overmind/utils/items';
import React, { FunctionComponent } from 'react';
//  Fix css prop types in styled-components (see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31245#issuecomment-463640878)
import * as CSSProps from 'styled-components/cssprop'; // eslint-disable-line

import {
  Container,
  ItemTitle,
} from './elements';
import ConfigurationFiles from './items/ConfigurationFiles';
import { FilesItem } from './items/Files';
import { More } from './items/More';
import { NotOwnedSandboxInfo } from './items/NotOwnedSandboxInfo';
import { ProjectInfo } from './items/ProjectInfo';
import { Server } from './items/Server';

const workspaceTabs = {
  project: ProjectInfo,
  'project-summary': NotOwnedSandboxInfo,
  files: FilesItem,
  config: ConfigurationFiles,
  server: Server,
  more: More,
};

export const Workspace: FunctionComponent = () => {
  const { state } = useOvermind();
  const {
    workspace: { openedWorkspaceItem: activeTab },
  } = state;

  if (!activeTab) {
    return null;
  }

  const Component = workspaceTabs[activeTab];
  const item =
    getWorkspaceItems(state).find(({ id }) => id === activeTab) ||
    getDisabledItems(state).find(({ id }) => id === activeTab);

  return (
    <Container>
      {item && !item.hasCustomHeader && <ItemTitle>{item.name}</ItemTitle>}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Component />
      </div>

    </Container>
  );
};

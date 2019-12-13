import React, { useState } from 'react';
import { useOvermind } from 'app/overmind';
import Margin from '@codesandbox/common/lib/components/spacing/Margin';
import { Dependencies } from '../../Dependencies';
import { SandboxInfo } from './SandboxInfo';
import { Files } from '../../Files';
import { WorkspaceItem } from '../../WorkspaceItem';

export const NotOwnedSandboxInfo = () => {
  const [editActions, setEditActions] = useState(null);
  const {
    state: { editor },
  } = useOvermind();
  const staticTemplate = editor.currentSandbox.template === 'static';

  return (
    <div style={{ marginTop: '1rem' }}>
      <Margin bottom={1.5}>
        <SandboxInfo sandbox={editor.currentSandbox} />
      </Margin>

      <WorkspaceItem actions={editActions} defaultOpen title="Files">
        <Files setEditActions={setEditActions} />
      </WorkspaceItem>
      {!staticTemplate ? (
        <WorkspaceItem defaultOpen title="Dependencies">
          <Dependencies />
        </WorkspaceItem>
      ) : null}
    </div>
  );
};

import getTemplateDefinition from '@codesandbox/common/lib/templates';
import codesandbox from '@codesandbox/common/lib/themes/codesandbox.json';
import {
  COLUMN_MEDIA_THRESHOLD,
  CreateSandbox,
} from 'app/components/CreateNewSandbox/CreateSandbox';
import Modal from 'app/components/Modal';
import { useOvermind } from 'app/overmind';
import { templateColor } from 'app/utils/template-color';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import DeleteSandboxModal from './DeleteSandboxModal';
import { EmptyTrash } from './EmptyTrash';
import PreferencesModal from './PreferencesModal';
import SearchDependenciesModal from './SearchDependenciesModal';
import { SelectSandboxModal } from './SelectSandboxModal';
import { StorageManagementModal } from './StorageManagementModal';
import UploadModal from './UploadModal';

const modals = {
  preferences: {
    Component: PreferencesModal,
    width: 900,
  },
  newSandbox: {
    Component: CreateSandbox,
    width: () => (window.outerWidth > COLUMN_MEDIA_THRESHOLD ? 1200 : 950),
  },
  deleteSandbox: {
    Component: DeleteSandboxModal,
    width: 400,
  },
  emptyTrash: {
    Component: EmptyTrash,
    width: 400,
  },
  selectSandbox: {
    Component: SelectSandboxModal,
    width: 600,
  },
  searchDependencies: {
    Component: SearchDependenciesModal,
    width: 600,
  },
  uploading: {
    Component: UploadModal,
    width: 600,
  },
  storageManagement: {
    Component: StorageManagementModal,
    width: 800,
  },
};

const Modals: React.FC = () => {
  const {
    actions,
    state: {
      editor: { currentSandbox },
      preferences: {
        settings: { customVSCodeTheme },
      },
      currentModal,
    },
  } = useOvermind();

  const state = {
    theme: {
      colors: {},
      vscodeTheme: codesandbox,
    },
    customVSCodeTheme,
  };

  const sandbox = currentSandbox;
  const templateDef = sandbox && getTemplateDefinition(sandbox.template);

  const modal = currentModal && modals[currentModal];

  return (
    <ThemeProvider
      theme={{
        templateColor: templateColor(sandbox, templateDef),
        templateBackgroundColor: templateDef && templateDef.backgroundColor,
        ...state.theme,
      }}
    >
      <Modal
        isOpen={Boolean(modal)}
        width={
          modal &&
          (typeof modal.width === 'function' ? modal.width() : modal.width)
        }
        onClose={isKeyDown => actions.modalClosed()}
      >
        {modal
          ? React.createElement(modal.Component, {
              closeModal: () => actions.modalClosed(),
            })
          : null}
      </Modal>
    </ThemeProvider>
  );
};
export { Modals };

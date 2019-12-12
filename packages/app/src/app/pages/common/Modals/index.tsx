import getTemplateDefinition from '@codesandbox/common/lib/templates';
import codesandbox from '@codesandbox/common/lib/themes/codesandbox.json';
import {
  COLUMN_MEDIA_THRESHOLD,
  CreateSandbox,
} from 'app/components/CreateNewSandbox/CreateSandbox';
import Modal from 'app/components/Modal';
import { useOvermind } from 'app/overmind';
import getVSCodeTheme from 'app/src/app/pages/Sandbox/Editor/utils/get-vscode-theme';
import { templateColor } from 'app/utils/template-color';
import React, { useCallback, useEffect, useReducer } from 'react';
import { ThemeProvider } from 'styled-components';

import CommitModal from './CommitModal';
import { DeleteDeploymentModal } from './DeleteDeploymentModal';
import { DeleteProfileSandboxModal } from './DeleteProfileSandboxModal';
import DeleteSandboxModal from './DeleteSandboxModal';
import { DeploymentModal } from './DeploymentModal';
import { EmptyTrash } from './EmptyTrash';
import ExportGitHubModal from './ExportGitHubModal';
import { FeedbackModal } from './FeedbackModal';
import { ForkServerModal } from './ForkServerModal';
import { LiveSessionEnded } from './LiveSessionEnded';
import LiveSessionVersionMismatch from './LiveSessionVersionMismatch';
import { NetlifyLogs } from './NetlifyLogs';
import { PickSandboxModal } from './PickSandboxModal';
import PreferencesModal from './PreferencesModal';
import PRModal from './PRModal';
import SearchDependenciesModal from './SearchDependenciesModal';
import { SelectSandboxModal } from './SelectSandboxModal';
import { ShareModal } from './ShareModal';
import SignInForTemplates from './SignInForTemplates';
import { StorageManagementModal } from './StorageManagementModal';
import { SurveyModal } from './SurveyModal';
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
  share: {
    Component: ShareModal,
    width: 1200,
  },
  deployment: {
    Component: DeploymentModal,
    width: 750,
  },
  exportGithub: {
    Component: ExportGitHubModal,
    width: 400,
  },
  commit: {
    Component: CommitModal,
    width: 400,
  },
  signInForTemplates: {
    Component: SignInForTemplates,
    width: 400,
  },
  pr: {
    Component: PRModal,
    width: 400,
  },
  netlifyLogs: {
    Component: NetlifyLogs,
    width: 750,
  },
  deleteDeployment: {
    Component: DeleteDeploymentModal,
    width: 400,
  },
  deleteSandbox: {
    Component: DeleteSandboxModal,
    width: 400,
  },
  pickSandbox: {
    Component: PickSandboxModal,
    width: 600,
  },
  deleteProfileSandbox: {
    Component: DeleteProfileSandboxModal,
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
  liveSessionEnded: {
    Component: LiveSessionEnded,
    width: 600,
  },
  liveVersionMismatch: {
    Component: LiveSessionVersionMismatch,
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
  forkServerModal: {
    Component: ForkServerModal,
    width: 500,
  },
  feedback: {
    Component: FeedbackModal,
    width: 450,
  },
  userSurvey: {
    Component: SurveyModal,
    width: 850,
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

  const [state, setState] = useReducer((s, a) => ({ ...s, ...a }), {
    theme: {
      colors: {},
      vscodeTheme: codesandbox,
    },
    customVSCodeTheme,
  });

  const loadTheme = useCallback(async () => {
    try {
      const theme = await getVSCodeTheme('', customVSCodeTheme);
      setState({ theme, customVSCodeTheme });
    } catch (e) {
      console.error(e);
    }
  }, [customVSCodeTheme]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    if (customVSCodeTheme !== state.customVSCodeTheme) {
      loadTheme();
    }
  });

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

import { withLoadApp } from './factories';
import * as internalActions from './internalActions';
import { Action, AsyncAction } from '.';

export const internal = internalActions;

export const appUnmounted: AsyncAction = async ({ effects, actions }) => {
  effects.connection.removeListener(actions.connectionChanged);
};

export const sandboxPageMounted: AsyncAction = withLoadApp();

export const searchMounted: AsyncAction = withLoadApp();

export const codesadboxMounted: AsyncAction = withLoadApp();

export const genericPageMounted: AsyncAction = withLoadApp();

export const connectionChanged: Action<boolean> = ({ state }, connected) => {
  state.connected = connected;
};

type ModalName =
  | 'deleteDeployment'
  | 'deleteSandbox'
  | 'feedback'
  | 'forkServerModal'
  | 'liveSessionEnded'
  | 'moveSandbox'
  | 'netlifyLogs'
  | 'newSandbox'
  | 'preferences'
  | 'searchDependencies'
  | 'share'
  | 'signInForTemplates'
  | 'userSurvey';

export const modalOpened: Action<{
  modal: ModalName;
  message?: string;
  itemId?: string;
}> = ({ state, effects }, { modal, message, itemId }) => {
  state.currentModalMessage = message;
  state.currentModal = modal;
  if (state.currentModal === 'preferences') {
    state.preferences.itemId = itemId;
  }
};

export const modalClosed: Action = ({ state, effects }) => {
  // We just start it whenever it closes, if already started nothing happens
  if (state.currentModal === 'preferences') {
    effects.keybindingManager.start();
  }

  state.currentModal = null;
};

export const track: Action<{ name: string; data: any }> = (
  { effects },
  { name, data }
) => {};

export const refetchSandboxInfo: AsyncAction = async ({
  state,
  effects,
  actions,
}) => {
  const sandbox = state.editor.currentSandbox;
  if (sandbox && sandbox.id) {
    const updatedSandbox = await effects.api.getSandbox(sandbox.id);

    sandbox.collection = updatedSandbox.collection;
    sandbox.owned = updatedSandbox.owned;
    sandbox.userLiked = updatedSandbox.userLiked;
    sandbox.title = updatedSandbox.title;
    sandbox.team = updatedSandbox.team;
    sandbox.roomId = updatedSandbox.roomId;

    await actions.editor.internal.initializeLiveSandbox(sandbox);
  }
};

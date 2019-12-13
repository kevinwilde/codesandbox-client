import { getModulesAndDirectoriesInDirectory } from '@codesandbox/common/lib/sandbox/modules';
import {
  Directory,
  LiveDisconnectReason,
  LiveMessage,
  Module,
  Selection,
} from '@codesandbox/common/lib/types';
import { Operator } from 'app/overmind';
import { camelizeKeys } from 'humps';
import { json, mutate } from 'overmind';

export const onJoin: Operator<LiveMessage<{
  status: 'connected';
  live_user_id: string;
}>> = mutate(({ effects, state }, { data }) => {});

export const onModuleState: Operator<LiveMessage<{
  module_state: any;
}>> = mutate(({ state, actions }, { data }) => {
  actions.live.internal.initializeModuleState(data.module_state);
});

export const onUserEntered: Operator<LiveMessage<{
  users: any[];
  editor_ids: string[];
  owner_ids: string[];
  joined_user_id: string;
}>> = mutate(({ state, effects }, { data }) => {
  if (state.live.isLoading) {
    return;
  }

  const users = camelizeKeys(data.users);

  // TODO: What happening here? Is it not an array of users?
  // Check the running code and fix the type
  state.live.roomInfo.users = users as any;
  state.live.roomInfo.editorIds = data.editor_ids;
  state.live.roomInfo.ownerIds = data.owner_ids;
});

export const onUserLeft: Operator<LiveMessage<{
  users: any[];
  left_user_id: string;
  editor_ids: string[];
  owner_ids: string[];
}>> = mutate(({ state, actions, effects }, { data }) => {
  actions.live.internal.clearUserSelections(data.left_user_id);

  const users = camelizeKeys(data.users);

  // TODO: Same here, not an array?
  // Check running code
  state.live.roomInfo.users = users as any;
  state.live.roomInfo.ownerIds = data.owner_ids;
  state.live.roomInfo.editorIds = data.editor_ids;
});

export const onModuleSaved: Operator<LiveMessage<{
  moduleShortid: string;
  module: Module;
}>> = mutate(({ state, effects, actions }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const module = state.editor.currentSandbox.modules.find(
    moduleItem => moduleItem.shortid === data.moduleShortid
  );
  module.isNotSynced = false;

  state.editor.changedModuleShortids.splice(
    state.editor.changedModuleShortids.indexOf(module.shortid),
    1
  );

  actions.editor.internal.setModuleSavedCode({
    moduleShortid: data.moduleShortid,
    savedCode: data.module.savedCode,
  });

  effects.vscode.sandboxFsSync.writeFile(state.editor.modulesByPath, module);
  // We revert the module so that VSCode will flag saved indication correctly
  effects.vscode.revertModule(module);
  actions.editor.internal.updatePreviewCode();
});

export const onModuleCreated: Operator<LiveMessage<{
  module: Module;
}>> = mutate(({ state, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  state.editor.currentSandbox.modules.push(data.module);
  effects.vscode.sandboxFsSync.writeFile(
    state.editor.modulesByPath,
    data.module
  );
});

export const onModuleMassCreated: Operator<LiveMessage<{
  modules: Module[];
  directories: Directory[];
}>> = mutate(({ state, actions, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  state.editor.currentSandbox.modules = state.editor.currentSandbox.modules.concat(
    data.modules
  );
  state.editor.currentSandbox.directories = state.editor.currentSandbox.directories.concat(
    data.directories
  );

  state.editor.modulesByPath = effects.vscode.sandboxFsSync.create(
    state.editor.currentSandbox
  );

  actions.editor.internal.updatePreviewCode();
});

export const onModuleUpdated: Operator<LiveMessage<{
  moduleShortid: string;
  module: Module;
}>> = mutate(({ state, actions, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const sandbox = state.editor.currentSandbox;
  const moduleIndex = sandbox.modules.findIndex(
    moduleEntry => moduleEntry.shortid === data.moduleShortid
  );
  const existingModule =
    state.editor.sandboxes[sandbox.id].modules[moduleIndex];

  if (existingModule.path !== data.module.path) {
    effects.vscode.sandboxFsSync.rename(
      state.editor.modulesByPath,
      existingModule.path,
      data.module.path
    );
  }

  Object.assign(existingModule, data.module);

  effects.vscode.sandboxFsSync.writeFile(
    state.editor.modulesByPath,
    existingModule
  );

  if (state.editor.currentModuleShortid === data.moduleShortid) {
    effects.vscode.openModule(existingModule);
  }

  actions.editor.internal.updatePreviewCode();
});

export const onModuleDeleted: Operator<LiveMessage<{
  moduleShortid: string;
}>> = mutate(({ state, effects, actions }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const removedModule = state.editor.currentSandbox.modules.find(
    directory => directory.shortid === data.moduleShortid
  );
  const moduleIndex = state.editor.currentSandbox.modules.indexOf(
    removedModule
  );
  const wasCurrentModule =
    state.editor.currentModuleShortid === data.moduleShortid;

  state.editor.currentSandbox.modules.splice(moduleIndex, 1);
  effects.vscode.sandboxFsSync.unlink(
    state.editor.modulesByPath,
    removedModule
  );

  if (wasCurrentModule) {
    actions.editor.internal.setCurrentModule(state.editor.mainModule);
  }

  actions.editor.internal.updatePreviewCode();
});

export const onDirectoryCreated: Operator<LiveMessage<{
  module: Directory; // This is very weird?
}>> = mutate(({ state, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  // Should this not be a directory?
  state.editor.currentSandbox.directories.push(data.module);
  effects.vscode.sandboxFsSync.mkdir(state.editor.modulesByPath, data.module);
});

export const onDirectoryUpdated: Operator<LiveMessage<{
  directoryShortid: string;
  module: Directory; // Still very weird
}>> = mutate(({ state, actions, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const sandbox = state.editor.currentSandbox;
  const directoryIndex = sandbox.directories.findIndex(
    directoryEntry => directoryEntry.shortid === data.directoryShortid
  );
  const existingDirectory =
    state.editor.sandboxes[sandbox.id].directories[directoryIndex];
  const hasChangedPath = existingDirectory.path !== data.module.path;

  Object.assign(existingDirectory, data.module);

  if (hasChangedPath) {
    const prevCurrentModulePath = state.editor.currentModule.path;

    state.editor.modulesByPath = effects.vscode.sandboxFsSync.create(sandbox);
    actions.editor.internal.updatePreviewCode();

    if (prevCurrentModulePath !== state.editor.currentModule.path) {
      actions.editor.internal.setCurrentModule(state.editor.currentModule);
    }
  }
});

export const onDirectoryDeleted: Operator<LiveMessage<{
  directoryShortid: string;
}>> = mutate(({ state, effects, actions }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const sandbox = state.editor.currentSandbox;
  const directory = sandbox.directories.find(
    directoryItem => directoryItem.shortid === data.directoryShortid
  );

  if (!directory) {
    return;
  }

  const removedDirectory = sandbox.directories.splice(
    sandbox.directories.indexOf(directory),
    1
  )[0];
  const {
    removedModules,
    removedDirectories,
  } = getModulesAndDirectoriesInDirectory(
    removedDirectory,
    sandbox.modules,
    sandbox.directories
  );

  removedModules.forEach(removedModule => {
    effects.vscode.sandboxFsSync.unlink(
      state.editor.modulesByPath,
      removedModule
    );
    sandbox.modules.splice(sandbox.modules.indexOf(removedModule), 1);
  });

  removedDirectories.forEach(removedDirectoryItem => {
    sandbox.directories.splice(
      sandbox.directories.indexOf(removedDirectoryItem),
      1
    );
  });

  // We open the main module as we do not really know if you had opened
  // any nested file of this directory. It would require complex logic
  // to figure that out. This concept is soon removed anyways
  effects.vscode.openModule(state.editor.mainModule);
  actions.editor.internal.updatePreviewCode();
});

export const onUserSelection: Operator<LiveMessage<{
  liveUserId: string;
  moduleShortid: string;
  selection: Selection;
}>> = mutate(({ state, effects }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }

  const userSelectionLiveUserId = data.liveUserId;
  const { moduleShortid } = data;
  const { selection } = data;
  const userIndex = state.live.roomInfo.users.findIndex(
    u => u.id === userSelectionLiveUserId
  );

  if (userIndex > -1) {
    state.live.roomInfo.users[userIndex].currentModuleShortid = moduleShortid;
    state.live.roomInfo.users[userIndex].selection = selection;
  }

  if (
    moduleShortid === state.editor.currentModuleShortid &&
    state.live.isEditor(userSelectionLiveUserId)
  ) {
    const user = state.live.roomInfo.users.find(
      u => u.id === userSelectionLiveUserId
    );

    effects.vscode.updateUserSelections([
      {
        userId: userSelectionLiveUserId,
        name: user.username,
        selection,
        color: json(user.color),
      },
    ]);
  }
});

export const onUserCurrentModule: Operator<LiveMessage<{
  live_user_id: string;
  moduleShortid: string;
}>> = mutate(({ state, actions }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  const userIndex = state.live.roomInfo.users.findIndex(
    u => u.id === data.live_user_id
  );

  if (userIndex > -1) {
    state.live.roomInfo.users[userIndex].currentModuleShortid =
      data.moduleShortid;
  }

  actions.live.internal.clearUserSelections(null);

  if (
    state.live.followingUserId === data.live_user_id &&
    data.moduleShortid !== state.editor.currentModuleShortid
  ) {
    const { moduleShortid } = data;
    const { modules } = state.editor.currentSandbox;
    const module = modules.find(m => m.shortid === moduleShortid);

    if (!module) {
      return;
    }

    actions.editor.moduleSelected({
      id: module.id,
    });
  }
});

export const onLiveMode: Operator<LiveMessage<{
  mode: string;
}>> = mutate(({ state, actions }, { _isOwnMessage, data }) => {
  if (!_isOwnMessage) {
    state.live.roomInfo.mode = data.mode;
  }
  actions.live.internal.clearUserSelections(null);
});

export const onLiveChatEnabled: Operator<LiveMessage<{
  enabled: boolean;
}>> = mutate(({ state }, { _isOwnMessage, data }) => {
  if (_isOwnMessage) {
    return;
  }
  state.live.roomInfo.chatEnabled = data.enabled;
});

export const onLiveAddEditor: Operator<LiveMessage<{
  editor_user_id: string;
}>> = mutate(({ state }, { _isOwnMessage, data }) => {
  if (!_isOwnMessage) {
    state.live.roomInfo.editorIds.push(data.editor_user_id);
  }
});

export const onLiveRemoveEditor: Operator<LiveMessage<{
  editor_user_id: string;
}>> = mutate(({ state }, { _isOwnMessage, data }) => {
  if (!_isOwnMessage) {
    const userId = data.editor_user_id;

    const editors = state.live.roomInfo.editorIds;
    const newEditors = editors.filter(id => id !== userId);

    state.live.roomInfo.editorIds = newEditors;
  }
});

export const onOperation: Operator<LiveMessage<{
  module_shortid: string;
  operation: any;
}>> = mutate(({ state, effects }, { _isOwnMessage, data }) => {
  if (state.live.isLoading) {
    return;
  }
  if (_isOwnMessage) {
    effects.live.serverAck(data.module_shortid);
  } else {
    try {
      effects.live.applyServer(data.module_shortid, data.operation);
    } catch (e) {
      // Something went wrong, probably a sync mismatch. Request new version
      console.error('Something went wrong with applying OT operation');
      effects.live.sendModuleStateSyncRequest();
    }
  }
});

export const onConnectionLoss: Operator<LiveMessage> = mutate(
  ({ state, effects }) => {
    if (!state.live.reconnecting) {
      state.live.reconnecting = true;
    }
  }
);

export const onDisconnect: Operator<LiveMessage<{
  reason: LiveDisconnectReason;
}>> = mutate(({ state, actions }, { data }) => {
  actions.live.internal.disconnect();
  state.editor.currentSandbox.owned = state.live.isOwner;

  actions.modalOpened({
    modal: 'liveSessionEnded',
    message:
      data.reason === 'close'
        ? 'The owner ended the session'
        : 'The session has ended due to inactivity',
  });

  actions.live.internal.reset();
});

export const onOwnerLeft: Operator<LiveMessage> = mutate(({ actions }) => {
  actions.modalOpened({
    modal: 'liveSessionEnded',
    message: 'The owner left the session',
  });
});

export const onChat: Operator<LiveMessage<{
  live_user_id: string;
  message: string;
  date: number;
}>> = mutate(({ state }, { data }) => {
  let name = state.live.roomInfo.chat.users[data.live_user_id];

  if (!name) {
    const user = state.live.roomInfo.users.find(
      u => u.id === data.live_user_id
    );

    if (user) {
      state.live.roomInfo.chat.users[data.live_user_id] = user.username;
      name = user.username;
    } else {
      name = 'Unknown User';
    }
  }

  state.live.roomInfo.chat.messages.push({
    userId: data.live_user_id,
    message: data.message,
    date: data.date,
  });
});

export const onNotification: Operator<LiveMessage<{
  message: string;
  type: NotificationStatus;
}>> = mutate(({ effects }, { data }) => {});

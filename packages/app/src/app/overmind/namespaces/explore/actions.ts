import { PickedSandboxDetails } from '@codesandbox/common/lib/types';
import { Action, AsyncAction } from 'app/overmind';
import { withLoadApp } from 'app/overmind/factories';

export const popularSandboxesMounted: AsyncAction<string> = withLoadApp(
  async ({ state, actions, effects }, date) => {
    try {
      state.explore.popularSandboxes = await effects.api.getPopularSandboxes(
        date
      );
    } catch (error) {
      actions.internal.handleError({
        message: 'There has been a problem getting the sandboxes',
        error,
      });
    }
  }
);

export const pickSandbox: AsyncAction<{
  id: string;
  title: string;
  description: string;
}> = async ({ state, actions, effects }, { id, title, description }) => {
  try {
    const data = await effects.api.saveSandboxPick(id, title, description);
    const popularSandbox = state.explore.popularSandboxes.sandboxes.find(
      module => module.id === id
    );

    popularSandbox.picks = [
      {
        ...data,
        // Why are we doing this?
        id: Math.random().toString(),
      },
    ];

    state.currentModal = null;
  } catch (error) {
    actions.internal.handleError({
      message: 'There has been a problem picking the sandbox',
      error,
    });
  }
};

export const pickSandboxModal: Action<PickedSandboxDetails> = (
  { state },
  details
) => {
  state.explore.pickedSandboxDetails = details;
  state.currentModal = 'pickSandbox';
};

export const getSandbox: AsyncAction<string> = async (
  { state, actions, effects },
  id
) => {
  try {
    state.explore.selectedSandbox = await effects.api.getSandbox(id);
  } catch (error) {
    actions.internal.handleError({
      message: 'A problem occurred while fetching the sandbox',
      error,
    });
  }
};

export const pickedSandboxesMounted: AsyncAction = async ({
  state,
  actions,
  effects,
}) => {
  state.explore.pickedSandboxesLoading = true;

  try {
    const pickedSandboxes = await effects.api.getPickedSandboxes();

    state.explore.pickedSandboxesIndexes = pickedSandboxes.sandboxes.map(
      a => a.id
    );
    state.explore.pickedSandboxes = pickedSandboxes;
  } catch (error) {
    actions.internal.handleError({
      message: 'A problem occurred while fetching the sandboxes',
      error,
    });
  }
  state.explore.pickedSandboxesLoading = false;
};

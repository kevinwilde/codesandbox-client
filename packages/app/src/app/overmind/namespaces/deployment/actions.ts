import { Action, AsyncAction } from 'app/overmind';

import * as internalActions from './internalActions';

export const internal = internalActions;


export const deployWithNetlify: AsyncAction = async ({
  effects,
  actions,
  state,
}) => {};

export const getNetlifyDeploys: AsyncAction = async ({ state, effects }) => {};

export const getDeploys: AsyncAction = async ({ state, actions, effects }) => {};

export const deployClicked: AsyncAction = async ({
  state,
  effects,
  actions,
}) => {};

export const deploySandboxClicked: AsyncAction = async ({
  state,
  actions,
  effects,
}) => {};

export const setDeploymentToDelete: Action<{
  id: string;
}> = ({ state }, { id }) => {
  state.deployment.deployToDelete = id;
};

export const deleteDeployment: AsyncAction = async ({
  state,
  effects,
  actions,
}) => {};

export const aliasDeployment: AsyncAction<string> = async (
  { state, effects, actions },
  id
) => {};

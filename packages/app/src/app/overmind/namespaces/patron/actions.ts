import { AsyncAction, Action } from 'app/overmind';
import { withLoadApp } from 'app/overmind/factories';

export const patronMounted: AsyncAction = withLoadApp();

export const priceChanged: Action<{ price: number }> = (
  { state },
  { price }
) => {
  state.patron.price = price;
};

export const createSubscriptionClicked: AsyncAction<{
  token: string;
  coupon: string;
}> = async ({ state, effects }, { token, coupon }) => {};

export const updateSubscriptionClicked: AsyncAction<string> = async (
  { state, effects },
  coupon
) => {};

export const cancelSubscriptionClicked: AsyncAction = async ({
  state,
  effects,
}) => {};

export const tryAgainClicked: Action = ({ state }) => {
  state.patron.error = null;
};

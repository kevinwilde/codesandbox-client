import { Button } from '@codesandbox/common/lib/components/Button';
import theme from '@codesandbox/common/lib/theme';
import { DNT, trackPageview } from '@codesandbox/common/lib/utils/analytics';
import _debug from '@codesandbox/common/lib/utils/debug';
import { notificationState } from '@codesandbox/common/lib/utils/notifications';
import { NotificationStatus, Toasts } from '@codesandbox/notifications';
import { useOvermind } from 'app/overmind';
import Loadable from 'app/utils/Loadable';
import React, { useEffect } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { ErrorBoundary } from './common/ErrorBoundary';
import { Modals } from './common/Modals';
import { Container, Content } from './elements';
import { NewSandbox } from './NewSandbox';
import Sandbox from './Sandbox';

const routeDebugger = _debug('cs:app:router');

const NotFound = Loadable(() =>
  import(/* webpackChunkName: 'page-not-found' */ './common/NotFound')
);

const Boundary = withRouter(ErrorBoundary);

const RoutesComponent: React.FC = () => {
  const {
    actions: { appUnmounted },
  } = useOvermind();
  useEffect(() => () => appUnmounted(), [appUnmounted]);

  return (
    <Container>
      <Route
        path="/"
        render={({ location }) => {
          if (process.env.NODE_ENV === 'production') {
            routeDebugger(
              `Sending '${location.pathname + location.search}' to analytics.`
            );
            if (!DNT) {
              trackPageview();
            }
          }
          return null;
        }}
      />
      <Toasts
        colors={{
          [NotificationStatus.ERROR]: theme.dangerBackground(),
          [NotificationStatus.SUCCESS]: theme.green(),
          [NotificationStatus.NOTICE]: theme.secondary(),
          [NotificationStatus.WARNING]: theme.primary(),
        }}
        state={notificationState}
        Button={Button}
      />
      <Boundary>
        <Content>
          <Switch>
            <Route exact path="/s" component={NewSandbox} />
            <Route path="/s/:id*" component={Sandbox} />
            <Route component={NotFound} />
          </Switch>
        </Content>
      </Boundary>
      <Modals />
    </Container>
  );
};

export const Routes = withRouter(RoutesComponent);

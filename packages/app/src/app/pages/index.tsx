import theme from '@codesandbox/common/lib/theme';
import { DNT, trackPageview } from '@codesandbox/common/lib/utils/analytics';
import _debug from '@codesandbox/common/lib/utils/debug';
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
  const { actions: { appUnmounted } } = useOvermind();
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
      <Boundary>
        <Content>
          <Switch>
            <Route exact path="/s" component={NewSandbox} />
            <Route exact path="/" component={NewSandbox} />
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

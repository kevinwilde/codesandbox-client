import * as childProcess from 'node-services/lib/child_process';
// @ts-ignore
import DefaultWorkLoader from 'worker-loader?publicPath=/&name=dynamic-worker.[hash:8].worker.js!./generic-1';
// @ts-ignore
import TSWorker from 'worker-loader?publicPath=/&name=typescript-worker.[hash:8].worker.js!./ts-extension';

import { initializeAll } from '../common/global';

childProcess.addDefaultForkHandler(DefaultWorkLoader);
childProcess.addForkHandler(
  '/extensions/node_modules/typescript/lib/tsserver.js',
  TSWorker
);

initializeAll().then(() => {
  // Preload the TS worker for fast init
  childProcess.preloadWorker(
    '/extensions/node_modules/typescript/lib/tsserver.js'
  );

  // eslint-disable-next-line
  require('../workers/ext-host-worker');
});

import React, { FunctionComponent } from 'react';

import { Description } from '../../elements';

interface Props {
  id: string;
  message: string | JSX.Element;
}

export const More: FunctionComponent<Props> = ({ id, message }) => (
    <div>
      <Description>{message}</Description>
    </div>
  );

import React from 'react';

import { Create } from './Create';
import { Container } from './elements';

export const COLUMN_MEDIA_THRESHOLD = 1600;

export const CreateSandbox: React.FC = props => (
  <Container {...props}>
    <Create />
  </Container>
);

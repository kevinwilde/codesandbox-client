// @ts-check
import { react, reactTs } from '@codesandbox/common/lib/templates';

import reactPreset from './presets/create-react-app';
import reactTsPreset from './presets/create-react-app-typescript';

export default function getPreset(template: string) {
  switch (template) {
    case react.name:
      return reactPreset();
    case reactTs.name:
      return reactTsPreset();
    default:
      return reactPreset();
  }
}

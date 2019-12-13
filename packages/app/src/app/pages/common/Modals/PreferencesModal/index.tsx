import React, { useMemo } from 'react';
import { useOvermind } from 'app/overmind';

import AppearanceIcon from 'react-icons/lib/md/color-lens';
import CodeIcon from 'react-icons/lib/fa/code';
import BrowserIcon from 'react-icons/lib/go/browser';
import CodeFormatIcon from 'react-icons/lib/fa/dedent';
import KeyboardIcon from 'react-icons/lib/go/keyboard';

import { SideNavigation } from './SideNavigation';

import { Appearance } from './Appearance';
import { EditorSettings } from './EditorPageSettings/EditorSettings';
import { PreviewSettings } from './EditorPageSettings/PreviewSettings';
import { CodeFormatting } from './CodeFormatting';
import { KeyMapping } from './KeyMapping';

import { Container, ContentContainer } from './elements';

const PreferencesModal: React.FC = () => {
  const {
    state: {
      preferences: { itemId = 'appearance' },
    },
    actions: {
      preferences: { itemIdChanged },
    },
  } = useOvermind();

  const items = useMemo(
    () =>
      [
        {
          id: 'appearance',
          title: 'Appearance',
          icon: <AppearanceIcon />,
          content: <Appearance />,
        },
        {
          id: 'editor',
          title: 'Editor',
          icon: <CodeIcon />,
          content: <EditorSettings />,
        },
        {
          id: 'prettierSettings',
          title: 'Prettier Settings',
          icon: <CodeFormatIcon />,
          content: <CodeFormatting />,
        },
        {
          id: 'preview',
          title: 'Preview',
          icon: <BrowserIcon />,
          content: <PreviewSettings />,
        },
        {
          id: 'keybindings',
          title: 'Key Bindings',
          icon: <KeyboardIcon />,
          content: <KeyMapping />,
        },
      ].filter(Boolean),
    []
  );

  const item = items.find(currentItem => currentItem.id === itemId);

  return (
    <Container>
      <SideNavigation
        itemId={itemId}
        menuItems={items}
        setItem={itemIdChanged}
      />
      <ContentContainer>{item.content}</ContentContainer>
    </Container>
  );
};

export default PreferencesModal;

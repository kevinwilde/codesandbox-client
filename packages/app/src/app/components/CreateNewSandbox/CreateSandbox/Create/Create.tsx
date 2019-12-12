import React, { useEffect } from 'react';
import { Scrollable } from '@codesandbox/common/lib/components/Scrollable';
import { Header } from '../elements';

import { PersonalTemplates } from './PersonalTemplates';
import { getTemplateInfosFromAPI } from '../utils/api';

export const Create = () => {
  const [officialTemplateInfos, setOfficialTemplates] = React.useState([]);

  useEffect(() => {
    getTemplateInfosFromAPI('/api/v1/sandboxes/templates/official').then(x => {
      for (let i = 0; i < x.length; i++) {
        const y = x[i];
        // TODO
        y.templates = y.templates.filter(
          template =>
            template.sandbox.id === 'new' || template.sandbox.id === 'react-ts'
        );
      }
      setOfficialTemplates(x);
    });
  }, []);

  return (
    <>
      <Header>
        <span>Create Sandbox</span>
      </Header>
      <Scrollable>
        <PersonalTemplates officialTemplateInfos={officialTemplateInfos} />
      </Scrollable>
    </>
  );
};

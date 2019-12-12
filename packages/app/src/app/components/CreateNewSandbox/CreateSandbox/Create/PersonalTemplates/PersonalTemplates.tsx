import React from 'react';

import { ITemplateInfo } from '../../TemplateList';
import { DynamicWidthTemplateList } from '../../TemplateList/DynamicWidthTemplateList';

interface IPersonalTemplatesProps {
  officialTemplateInfos: ITemplateInfo[];
}

export const PersonalTemplates = ({
  officialTemplateInfos,
}: IPersonalTemplatesProps) => (
  <DynamicWidthTemplateList
    showSecondaryShortcuts
    forkOnOpen
    templateInfos={officialTemplateInfos}
  />
);

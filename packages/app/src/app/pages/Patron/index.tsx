import React from 'react';
import Helmet from 'react-helmet';
import MaxWidth from '@codesandbox/common/lib/components/flex/MaxWidth';
import Margin from '@codesandbox/common/lib/components/spacing/Margin';
import Centered from '@codesandbox/common/lib/components/flex/Centered';
import { useOvermind } from 'app/overmind';
import { Title } from 'app/components/Title';
import { SubTitle } from 'app/components/SubTitle';
import { Navigation } from 'app/pages/common/Navigation';
import { PricingModal } from './PricingModal';
import { Content } from './elements';

const Patron: React.FC = () => {
  const { actions } = useOvermind();

  React.useEffect(() => {
    actions.patron.patronMounted();
  }, [actions]);

  return (
    <MaxWidth>
      <>
        <Helmet>
          <title>Patron - CodeSandbox</title>
          <script async src="https://js.stripe.com/v3/" />
        </Helmet>
        <Margin vertical={1.5} horizontal={1.5}>
          <Navigation title="Become a Patron" />
          <Content>
            <MaxWidth width={1024}>
              <>
                <Title>Become a CodeSandbox Patron!</Title>
                <SubTitle>
                  You can support us by paying a monthly amount of your choice.
                  <br />
                  The money goes to all expenses of CodeSandbox.
                </SubTitle>

                <Centered horizontal>
                  <PricingModal />
                </Centered>
              </>
            </MaxWidth>
          </Content>
        </Margin>
      </>
    </MaxWidth>
  );
};

export default Patron;
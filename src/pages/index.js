import React, { Component } from 'react';
import { Card, Button, Icon } from 'semantic-ui-react';
import { factory } from '@ethereum';
import Layout from '@layouts';
import { Header } from '@elements';
import { Link } from '@routes';

class CampaignIndex extends Component {
  static async getInitialProps() {
    const campaigns = await factory.methods.getCampaigns().call();
    return { campaigns };
  }

  renderCampaigns() {
    const { campaigns } = this.props;
    const items = campaigns.map((address) => {
      return {
        header: address,
        description: (
          <Link route={`/campaigns/${address}`}>
            <a>View campaign</a>
          </Link>
        ),    
        fluid: true,
        color: 'green',
      };
    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <Header text="Open Campaigns" divider />
        <Link route="/campaigns/new">
          <a>
            <Button floated="right" primary animated="fade">
              <Button.Content visible>
                <Icon name="add circle" /> Create campaign
              </Button.Content>
              <Button.Content hidden>
                <Icon name="handshake outline" size="large" />
              </Button.Content>
            </Button>
          </a>
        </Link>
        {this.renderCampaigns()}
      </Layout>
    );
  }
}

export default CampaignIndex;

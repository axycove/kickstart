import React, { Component } from 'react';
import ErrorPage from 'next/error';
import { Card, Button, Divider, Message } from 'semantic-ui-react';
import { Link } from '@routes';
import Layout from '@layouts';
import { Header } from '@elements';
import { ContributeForm } from '@templates';
import { Campaign, web3 } from '@ethereum';

class CampaignShow extends Component {
  static async getInitialProps({ query }) {
    try {
      const { address } = query;
      const campaign = Campaign(address);
      const summary = await campaign.methods.getSummary().call();

      return {
        minimumContribution: summary[0],
        campaignBalance: summary[1],
        requestsCount: summary[2],
        approversCount: summary[3],
        managerAddress: summary[4],
        contractAddress: address,
      };
    } catch (error) {
      return { error };
    }
  }

  state = {
    success: false,
    error: false,
    msgHeader: '',
    msgContent: '',
  };

  renderCards = () => {
    const { minimumContribution, campaignBalance, requestsCount, approversCount, managerAddress } =
      this.props;

    const items = [
      {
        header: (
          <span
            className="header"
            style={{
              whiteSpace: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {managerAddress}
          </span>
        ),
        description:
          'The manager created this campaign, and can create requests to withdraw money.',
        meta: 'Address of manager',
      },
      {
        header: minimumContribution,
        description:
          'You must contribute at least ' + minimumContribution + ' (wei) to become an approver.',
        meta: 'Minimum contribution (wei)',
      },
      {
        header: requestsCount,
        description:
          'A request tries to withdraw money from a contract. Request must be approved by approvers.',
        meta: 'Number of requests',
      },
      {
        header: approversCount,
        description: 'Number of people who have already donated for this campaign.',
        meta: 'Number of approvers',
      },
      {
        header: web3.utils.fromWei(campaignBalance, 'ether'),
        description: 'The balance is how much money this campaign has left to spend.',
        meta: 'Campaign balance (eth)',
      },
      {
        meta: (
          <span style={{ marginBottom: '3px' }} className="meta">
            Contribute to this campaign
          </span>
        ),
        description: this.renderContribute(),
      },
    ];

    return <Card.Group centered items={items} />;
  };

  renderContribute = () => {
    const { minimumContribution, contractAddress } = this.props;
    return (
      <ContributeForm
        updateMsgs={this.handleUpdateMsgs}
        showMsgs={false}
        style={{ textAlign: 'center', marginTop: '4px' }}
        minimumContribution={minimumContribution}
        contractAddress={contractAddress}
      />
    );
  };

  handleUpdateMsgs = (msgObj) => {
    const { success, error, msgHeader, msgContent } = msgObj;
    this.setState({ success, error, msgHeader, msgContent });
  };

  render() {
    const { requestsCount, contractAddress, err } = this.props;
    const { success, error, msgHeader, msgContent } = this.state;

    if (err) {
      return <ErrorPage statusCode={404} />;
    }

    return (
      <Layout>
        <Header text="Campaign summary" divider />
        {this.renderCards()}
        <Divider />
        {success ? (
          <Message
            style={{ textAlign: 'center' }}
            success={success}
            header={msgHeader}
            content={msgContent}
          />
        ) : null}
        {error ? (
          <Message
            style={{ textAlign: 'center' }}
            error={error}
            header={msgHeader}
            content={msgContent}
          />
        ) : null}
        <Header style={{ marginTop: '5rem' }} text="Campaign Requests" divider />
        <Link route={`/campaigns/${contractAddress}/requests`}>
          <a>
            <Button
              style={{ display: 'flex', justifyContent: 'center' }}
              color="red"
              content="View requests"
              icon="bullhorn"
              label={{ basic: true, color: 'red', pointing: 'left', content: requestsCount }}
            />
          </a>
        </Link>
      </Layout>
    );
  }
}

export default CampaignShow;

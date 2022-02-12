import React, { Component } from 'react';
import { Form, Button, Container, Input, Label, Message } from 'semantic-ui-react';
import Layout from '@layouts';
import { Header } from '@elements';
import { Router } from '@routes';
import { factory, web3 } from '@ethereum';

class CampaignNew extends Component {
  state = {
    minimumContribution: '',
    msgHeader: '',
    msgContent: '',
    loading: false,
    success: false,
    error: false,
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { minimumContribution } = this.state;

    try {
      if (Number(minimumContribution) > 0) {
        this.setState({
          loading: true,
          success: true,
          error: false,
          msgHeader: 'Transaction',
          msgContent: 'Waiting on transaction success...',
        });

        const accounts = await web3.eth.getAccounts();
        await factory.methods.createCampaign(minimumContribution).send({
          from: accounts[0],
        });

        this.setState({
          loading: false,
          success: true,
          error: false,
          msgHeader: 'Congratulations!',
          msgContent: "You've created a campaign",
          minimumContribution: '',
        });

        setTimeout(() => {
          Router.pushRoute('/');
        }, 1000);
      } else {
        this.setState({
          loading: false,
          success: false,
          error: true,
          msgHeader: 'Minimum contribution',
          msgContent: 'Minimum contribution is required',
        });
      }
    } catch (err) {
      let msg;
      if (err.code === 4001) {
        msg = err.message.split(':')[1];
      } else {
        msg = err.message;
      }

      this.setState({
        loading: false,
        success: false,
        error: true,
        msgHeader: 'Transaction error',
        msgContent: msg,
      });
    }
  };

  handleMinimumContributionInput = (e) => {
    const { value } = e.target;
    this.setState({ minimumContribution: value });
  };

  render() {
    const { loading, minimumContribution, error, success, msgHeader, msgContent } = this.state;

    return (
      <Layout>
        <Header text="Create a campaign" divider />
        <Container textAlign="center" text>
          <Form
            style={{ marginTop: '10rem' }}
            onSubmit={this.handleSubmit}
            error={error}
            success={success}
            loading={loading}
          >
            <Form.Field>
              <label style={{ marginBottom: '2rem' }}>
                Minimum contribution
              </label>
              <Input
                labelPosition="right"
                type="number"
                placeholder="Amount"
                value={minimumContribution}
                onChange={this.handleMinimumContributionInput}
              >
                <Label basic>&#9830;</Label>
                <input />
                <Label>WEI</Label>
              </Input>
            </Form.Field>
            <Button primary type="submit">
              Create!
            </Button>
            <Message success header={msgHeader} content={msgContent} />
            <Message error header={msgHeader} content={msgContent} />
          </Form>
        </Container>
      </Layout>
    );
  }
}

export default CampaignNew;

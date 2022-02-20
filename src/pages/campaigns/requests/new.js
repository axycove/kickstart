import React from 'react';
import ErrorPage from 'next/error';
import { Container, Form, Input, Button, Message } from 'semantic-ui-react';
import Layout from '@layouts';
import { Header } from '@elements';
import { Campaign, web3 } from '@ethereum';

function RequestNew(props) {
  const [state, setState] = React.useState({
    description: '',
    amount: '',
    recipient: '',
    msgHeader: '',
    msgContent: '',
    fLoading: false,
    success: false,
    error: false,
  });

  const handleInput = (e) => {
    const { value, name } = e.target;
    setState({ [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { address } = props;
    const { recipient, amount, description } = state;

    try {
      if (amount > 0 && description.length && web3.utils.isAddress(recipient)) {
        setState({
          fLoading: true,
          success: true,
          error: false,
          msgHeader: 'Transaction',
          msgContent: 'Waiting on transaction success...',
        });

        const campaign = Campaign(address);
        const accounts = await web3.eth.getAccounts();
        await campaign.methods
          .createRequest(description, web3.utils.toWei(amount, 'ether'), recipient)
          .send({
            from: accounts[0],
          });

        setState({
          fLoading: false,
          success: true,
          error: false,
          msgHeader: 'Congratulations!',
          msgContent: "You've created a request",
          description: '',
          amount: '',
          recipient: '',
        });
      } else {
        setState({
          fLoading: false,
          success: false,
          error: true,
          msgHeader: 'Invalid input',
          msgContent: 'Please provide a valid ethereum address',
        });
      }
    } catch (err) {
      let msg;
      if (err.code === 4001) {
        msg = err.message.split(':')[1];
      } else {
        msg = err.message;
      }

      setState({
        fLoading: false,
        success: false,
        error: true,
        msgHeader: 'Transaction error',
        msgContent: msg,
      });
    }
  };

  const { address, err } = props;
  const { description, amount, recipient, fLoading, error, success, msgHeader, msgContent } = state;

  if (err) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout>
      <Header back route={`/campaigns/${address}/requests`} text="Create a request" divider />
      <Container textAlign="center" text>
        <Form
          style={{ marginTop: '5rem' }}
          onSubmit={handleSubmit}
          error={error}
          success={success}
          loading={fLoading}
        >
          <Form.Field>
            <label style={{ marginBottom: '4px' }}>Request description</label>
            <Input
              required
              onChange={handleInput}
              value={description}
              name="description"
              icon="question circle"
              iconPosition="left"
              placeholder="Description..."
            />
            <label style={{ marginBottom: '4px', marginTop: '2rem' }}>Request amount (ETH)</label>
            <Input
              required
              onChange={handleInput}
              type="number"
              value={amount}
              name="amount"
              icon="money bill alternate"
              iconPosition="left"
              placeholder="Withdraw amount..."
            />
            <label style={{ marginTop: '2rem' }}>Request recipient</label>
            <Input
              required
              onChange={handleInput}
              value={recipient}
              name="recipient"
              icon="ethereum"
              iconPosition="left"
              placeholder="Recipient address..."
            />
          </Form.Field>
          <Button primary type="submit">
            Create request
          </Button>
          <Message success header={msgHeader} content={msgContent} />
          <Message error header={msgHeader} content={msgContent} />
        </Form>
      </Container>
    </Layout>
  );
}

RequestNew.getInitialProps = async ({ query }) => {
  try {
    const address = query.address;
    return { address };
  } catch (err) {
    return { err };
  }
};

export default RequestNew;

import React from 'react';
import { Form, Button, Input, Label, Message } from 'semantic-ui-react';

import { Router } from '@routes';
import { web3, Campaign } from '@ethereum';

function ContributeForm(props) {
  const [state, setState] = React.useState({
    amount: '',
    msgHeader: '',
    msgContent: '',
    fLoading: false,
    success: false,
    error: false,
  });

  const handleAmountInput = (e) => {
    const { value } = e.target;
    setState({ amount: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { amount } = state;
    const { minimumContribution, contractAddress } = props;

    try {
      if (Number(amount) >= Number(web3.utils.fromWei(minimumContribution, 'ether'))) {
        setState({
          fLoading: true,
          success: true,
          error: false,
          msgHeader: 'Transaction',
          msgContent: 'Waiting on transaction success...',
        });

        handleUpdateMsgs({
          success: true,
          error: false,
          msgHeader: 'Transaction',
          msgContent: 'Waiting on transaction success...',
        });

        const campaign = Campaign(contractAddress);
        const accounts = await web3.eth.getAccounts();
        await campaign.methods.contribute().send({
          from: accounts[0],
          value: web3.utils.toWei(amount, 'ether'),
        });

        setState({
          fLoading: false,
          success: true,
          error: false,
          msgHeader: 'Congratulations!',
          msgContent: "You're now an approver",
          amount: '',
        });

        handleUpdateMsgs({
          success: true,
          error: false,
          msgHeader: 'Congratulations!',
          msgContent: "You're now an approver",
        });

        setTimeout(() => {
          Router.replaceRoute('/campaigns/' + contractAddress);
          setTimeout(() => {
            setState({ error: false, success: false, msgHeader: '', msgContent: '' });
            handleUpdateMsgs({ error: false, success: false, msgHeader: '', msgContent: '' });
          }, 4000);
        }, 1000);
      } else {
        setState({
          fLoading: false,
          success: false,
          error: true,
          msgHeader: 'Minimum contribution',
          msgContent: 'Amount must be greater than minimum contribution',
        });
        handleUpdateMsgs({
          success: false,
          error: true,
          msgHeader: 'Minimum contribution',
          msgContent: 'Amount must be greater than minimum contribution',
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

      handleUpdateMsgs({
        success: false,
        error: true,
        msgHeader: 'Transaction error',
        msgContent: msg,
      });
    }
  };

  const handleUpdateMsgs = (msgObj) => {
    const { updateMsgs } = props;
    updateMsgs(msgObj);
  };

  const { style, showMsgs } = props;
  const { error, success, fLoading, msgHeader, msgContent, amount } = state;

  return (
    <Form style={style} onSubmit={handleSubmit} error={error} success={success} loading={fLoading}>
      <Form.Field style={{ marginBottom: '4px' }}>
        <Input
          labelPosition="right"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={handleAmountInput}
        >
          <Label basic>&#9830;</Label>
          <input />
          <Label>ETH</Label>
        </Input>
      </Form.Field>
      <Button primary type="submit">
        Contribute
      </Button>
      {showMsgs ? (
        <>
          <Message success header={msgHeader} content={msgContent} />
          <Message error header={msgHeader} content={msgContent} />
        </>
      ) : null}
    </Form>
  );
}

export default ContributeForm;

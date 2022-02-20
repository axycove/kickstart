import React from 'react';
import { Table, Button } from 'semantic-ui-react';
import { Campaign, web3 } from '@ethereum';

function RequestRow(props) {
  const { Row, Cell } = Table;
  const { id, request, approversCount } = props;
  const readyToFinalize = request.approvalCount > approversCount / 2;

  return (
    <Row disabled={request.complete} positive={readyToFinalize && !request.complete}>
      <Cell>{id}</Cell>
      <Cell>{request.description}</Cell>
      <Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>
      <Cell>{request.recipient}</Cell>
      <Cell>
        {request.approvalCount}/{approversCount}
      </Cell>
      <Cell>
        {request.complete ? null : (
          <Button color="green" basic onClick={onApprove}>
            Approve
          </Button>
        )}
      </Cell>
      <Cell>
        {request.complete ? null : (
          <Button color="teal" basic onClick={onFinalize}>
            Finalize
          </Button>
        )}
      </Cell>
    </Row>
  );

  async function onApprove() {
    const campaign = Campaign(props.address);

    const accounts = await web3.eth.getAccounts();
    await campaign.methods.approveRequest(props.id).send({
      from: accounts[0],
    });
  }

  async function onFinalize() {
    const campaign = Campaign(props.address);

    const accounts = await web3.eth.getAccounts();
    await campaign.methods.finalizeRequest(props.id).send({
      from: accounts[0],
    });
  }
}

export default RequestRow;

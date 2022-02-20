import React from 'react';
import ErrorPage from 'next/error';
import { Table, Icon, Message } from 'semantic-ui-react';
import { Header, RequestRow } from '@elements';
import { Router } from '@routes';
import Layout from '@layouts';
import { Campaign } from '@ethereum';

const { Header: HeaderTable, HeaderCell, Row, Body } = Table;

function RequestIndex(props) {
  const [state, setState] = React.useState({
    error: false,
    success: false,
    msgHeader: '',
    msgContent: '',
  });

  const renderRow = () => {
    const { requests, address, approversCount } = props;

    return requests.map((r, i) => {
      return (
        <RequestRow
          cb={cb}
          key={i}
          id={i}
          approversCount={approversCount}
          request={r}
          address={address}
        />
      );
    });
  };

  const cb = (error, success, msgHeader, msgContent) => {
    const { address } = props;
    setState({ error, success, msgContent, msgHeader });

    setTimeout(() => {
      Router.replaceRoute(`/campaigns/${address}/requests`);
    }, 2000);
  };

  const { address, requestsCount, err } = props;
  const { error, success, msgHeader, msgContent } = state;

  if (err) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout>
      <Header add route={`/campaigns/${address}/requests/new`} text="View requests" divider />
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
      <Table style={{ marginTop: '5rem' }} striped celled textAlign="center">
        <HeaderTable>
          <Row>
            <HeaderCell>ID</HeaderCell>
            <HeaderCell>Description</HeaderCell>
            <HeaderCell>
              <Icon name="ethereum" />
              Amount
            </HeaderCell>
            <HeaderCell>Recipient</HeaderCell>
            <HeaderCell>ApprovalsCount</HeaderCell>
            <HeaderCell>Approve</HeaderCell>
            <HeaderCell>Finalize</HeaderCell>
          </Row>
        </HeaderTable>
        <Body>{renderRow()}</Body>
      </Table>
      <div>Found {requestsCount} requests</div>
    </Layout>
  );
}

RequestIndex.getInitialProps = async ({ query }) => {
  try {
    const { address } = query;
    const campaign = Campaign(address);
    const requestsCount = await campaign.methods.requestsCount().call();
    const approversCount = await campaign.methods.approversCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestsCount))
        .fill()
        .map((_e, i) => {
          return campaign.methods.requests(i).call();
        })
    );

    return { address, requests, requestsCount, approversCount };
  } catch (err) {
    return { err };
  }
};

export default RequestIndex;

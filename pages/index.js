import React, { Component } from 'react';
import factory from '../ethereum/factory';
import { Card, Button } from 'semantic-ui-react';
import Layout from '../components/Layout';

class CampaignIndex extends Component {
    static async getInitialProps() {
        const campaign = await factory.methods.getDeployedCampaign().call();
        return { campaign };
    }

    renderCampaigns() {
        const items = this.props.campaign.map(address => {
            return {
                header: address,
                description: <a>View Campaign</a>,
                fluid: true
            }
        });

        return <Card.Group items={items} />
    }

    render() {
        return (
            <Layout>
                <div> 
                    <h3>Open Campaigns</h3>
                    <Button floated='right' primary content='Create Campaign' icon='add circle' />
                    { this.renderCampaigns() }
                </div>
            </Layout>     
        );
    }
}

export default CampaignIndex;
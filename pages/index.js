import React, { Component } from 'react';
import factory from '../ethereum/factory'

class CampaignIndex extends Component {
    static async getInitalProps() {
        const campaigns = await factory.methods.getDeployedCampaign().call();
        return { campaigns };
    }
    render() {
        return <div> { this.props.campaigns[0] } </div>;
    }
}

export default CampaignIndex;
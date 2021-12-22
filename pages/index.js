import React, { Component } from 'react';
import factory from '../ethereum/factory'

class CampaignIndex extends Component {
    async componentDidMount() {
        const campaigns = await factory.methods.getDeployedCampaign().call();
        console.log(campaigns);
    }
    render() {
        return <div>Hi there</div>
    }
}

export default CampaignIndex;
import React, { Component } from "react";
import Layout from "../../components/Layout";
import { Button, Form, Input, Message } from 'semantic-ui-react';
import factory from '../../ethereum/factory';
import web3 from "../../ethereum/web3";
import { Router } from '../../routes';

class CampaignNew extends Component {
    state = {
        minimumContribution: '',
        errormessage: '',
        loading: false
    };

    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({loading: true, errormessage:''});
        try{
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createCampaign(this.state.minimumContribution)
                .send({
                    from: accounts[0]
                });
            Router.pushRoute('/');
        }
        catch(error) {
            this.setState({ errormessage: error.message });
        }
        this.setState({loading: false});
    }
    render() {
        return (
            <Layout>
                <h3>Create a Campaign</h3>
                <Form onSubmit={this.onSubmit} error={!!this.state.errormessage}>
                    <Form.Field>
                        <label>Minimum Contribution</label>
                        <Input 
                        label='Wei' 
                        labelPosition="right"
                        value = {this.state.minimumContribution}
                        onChange={event => this.setState({minimumContribution: event.target.value})}
                        />
                    </Form.Field>
                    <Message error header="Oops! Something went wrong" content= {this.state.errormessage} />
                    <Button loading={this.state.loading} primary>Create!</Button>
                </Form>
            </Layout>
        );
    }
}
export default CampaignNew;
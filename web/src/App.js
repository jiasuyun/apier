import React, { Component } from 'react';
import { Container, Row, Col, Form, Tabs, Tab, Button, Alert } from 'react-bootstrap';
import Clipboard from 'react-clipboard.js';
import ClipboardIcon from './clipboard.png';
import * as parse from '@dee-contrib/apier';
import yaml from 'js-yaml';
import merge from 'lodash.merge';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      error: '',
      handlersText: '',
      httesText: '',
      openapisText: '',
    };
  }
  handlerGenBtnClick = () => {
    let result;
    try {
      result = parse(this.state.code);
    } catch (err) {
      this.setState({ error: err.message });
      return;
    }
    const { handlers, httes, openapis } = result;
    const handlersText = handlers.join('\n\n');
    const httesText = yaml.safeDump(httes);
    const openapisText = yaml.safeDump(openapis.reduce((a, c) => merge(a, c), {}))
    this.setState({
      error: '',
      handlersText,
      httesText,
      openapisText,
    })
  }
  handleCodeInput = e => {
    this.setState({code: e.target.value })
  }
  renderClipboard() {
    return (
      <Clipboard
        className="btn btn-light"
        title="复制到剪切板"
        style={{ position: 'absolute', right: '14px' }}
        data-clipboard-text=""
      >
        <img src={ClipboardIcon} alt="" style={{ width: '20px' }} />
      </Clipboard>
    )
  }
  renderCode = (text, type) => {
    return text ? <SyntaxHighlighter language={type} style={docco}>{text}</SyntaxHighlighter> : <div></div>;
  }
  render() {
    const textAreaHeight = Math.max(window.innerHeight - 50, this.state.code.split('\n').length * 24 + 60);
    return (
      <div className="App">
        <Container fluid>
          <Row>
            <Col sm={5}>
              <Form>
                <Form.Group>
                  {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
                  <Row>
                    <Col>
                      <Form.Label style={{ paddingTop: '10px' }}>API</Form.Label>
                    </Col>
                    <Col sm="auto" style={{ marginLeft: 'auto' }}>
                      <Button variant="outline-primary" disabled={!this.state.code} onClick={this.handlerGenBtnClick}>生成</Button>
                    </Col>
                  </Row>
                  <Form.Control as="textarea" rows="3" style={{ height: `${textAreaHeight}px` }} onChange={this.handleCodeInput} />
                </Form.Group>
              </Form>
            </Col>
            <Col sm={7}>
              <Tabs defaultActiveKey="openapi">
                <Tab eventKey="openapi" title="OPENAPI">
                  {this.renderClipboard()}
                  {this.renderCode(this.state.openapisText, 'yaml')}
                </Tab>
                <Tab eventKey="htte" title="HTTE">
                  {this.renderClipboard()}
                  {this.renderCode(this.state.httesText, 'yaml')}
                </Tab>
                <Tab eventKey="handler" title="HANDLER">
                  {this.renderClipboard()}
                  {this.renderCode(this.state.handlersText, 'typescript')}
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;

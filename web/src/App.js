import React, { Component } from 'react';
import { Container, Row, Col, Form, Tabs, Tab, Button } from 'react-bootstrap';
import Clipboard from 'react-clipboard.js';
import ClipboardIcon from './clipboard.png';
import * as parse from '@dee-contrib/apier';
import yaml from 'js-yaml';
import merge from 'lodash.merge';
import { ToastConsumer, ToastProvider } from 'react-toast-notifications';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css';

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
  handlerGenBtnClick = (add) => {
    let result;
    try {
      result = parse(this.state.code);
    } catch (err) {
      add(err.message, { appearance: 'error', autoDismiss: false })
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
    this.setState({ code: e.target.value })
  }
  renderClipboard() {
    return (
      <ToastConsumer>
        {({ add }) => (
          <Clipboard
            className="btn btn-light"
            title="复制到剪切板"
            style={{ position: 'absolute', right: '14px' }}
            data-clipboard-text={this.state.code}
            onSuccess={() => add('已复制', { appearance: 'success', autoDismiss: true })}
          >
            <img src={ClipboardIcon} alt="" style={{ width: '20px' }} />
          </Clipboard>
        )}
      </ToastConsumer>
    )
  }
  renderCode = (text, type) => {
    if (!text) return <div></div>;
    return <Editor
      value={text}
      disabled
      highlight={code => highlight(code, languages[type])}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
      }}
    />
  }
  render() {
    return (
      <div className="App">
        <ToastProvider>
          <Container fluid>
            <Row>
              <Col sm={5}>
                <Row>
                  <Col>
                    <Form.Label style={{ paddingTop: '10px' }}>API</Form.Label>
                  </Col>
                  <Col sm="auto" style={{ marginLeft: 'auto' }}>
                    <ToastConsumer>
                      {({ add }) => (
                        <Button variant="outline-primary" disabled={!this.state.code} onClick={() => this.handlerGenBtnClick(add)}>生成</Button>
                      )}
                    </ToastConsumer>
                  </Col>
                </Row>
                <Editor
                  value={this.state.code}
                  onValueChange={code => this.setState({ code })}
                  highlight={code => highlight(code, languages.js)}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    border: '1px solid lightgray',
                  }}
                />
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
        </ToastProvider>
      </div>
    );
  }
}

export default App;

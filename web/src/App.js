import React, { Component } from 'react';
import { Container, Row, Col, Form, Tabs, Tab, Button } from 'react-bootstrap';
import Clipboard from 'react-clipboard.js';
import ClipboardIcon from './clipboard.png';
import { ToastConsumer, ToastProvider } from 'react-toast-notifications';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism.css';
import parse from './parse';

import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      error: '',
      errorToastId: null,
      errorLineIndex: 0,
      handlersText: '',
      httesText: '',
      openapisText: '',
    };
  }
  handlerGenBtnClick = toastManager => {
    if (this.state.errorToastId) {
      toastManager.remove(this.state.errorToastId);
    }
    let result;
    let errorLineIndex = -1;
    try {
      result = parse(this.state.code);
    } catch (err) {
      if (err.lineNumber) {
        errorLineIndex = err.lineNumber - 1;
      }
      toastManager.add(
        err.message,
        { appearance: 'error', autoDismiss: false },
        errorToastId => this.setState({ errorToastId })
      );
      return;
    }
    this.setState({
      error: '',
      errorLineIndex,
      ...result,
    })
  }
  handleCodeInput = e => {
    this.setState({ code: e.target.value })
  }
  renderClipboard(text) {
    return (
      <ToastConsumer>
        {({ add }) => (
          <Clipboard
            className="btn btn-light"
            title="复制到剪切板"
            style={{ position: 'absolute', right: '14px', top: '3px' }}
            data-clipboard-text={text}
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
    return (
      <div>
        {this.renderClipboard(text)}
        <Editor
          value={text}
          disabled
          highlight={code => highlight(code, languages[type])}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
      </div>
    )
  }
  render() {
    return (
      <div className="App">
        <ToastProvider>
          <Container fluid>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <Form.Label style={{ paddingTop: '10px' }}>API</Form.Label>
                  </Col>
                  <Col sm="auto" style={{ marginLeft: 'auto' }}>
                    <ToastConsumer>
                      {toastManager => (
                        <Button variant="outline-primary" disabled={!this.state.code} onClick={() => this.handlerGenBtnClick(toastManager)}>生成</Button>
                      )}
                    </ToastConsumer>
                  </Col>
                </Row>
                <Editor
                  value={this.state.code}
                  onValueChange={code => this.setState({ code })}
                  highlight={code =>
                    highlight(code, languages.js)
                      .split('\n')
                      .map((line, index) => `<span class="${index === this.state.errorLineIndex ? 'line line-error' : 'line'}">${line}</span>`)
                      .join('\n')
                  }
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                    border: '1px solid lightgray',
                  }}
                />
              </Col>
              <Col>
                <Tabs defaultActiveKey="openapi">
                  <Tab eventKey="openapi" title="OPENAPI">
                    {this.renderCode(this.state.openapisText, 'yaml')}
                  </Tab>
                  <Tab eventKey="htte" title="HTTE">
                    {this.renderCode(this.state.httesText, 'yaml')}
                  </Tab>
                  <Tab eventKey="handler" title="HANDLER">
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

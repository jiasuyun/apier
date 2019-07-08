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
import Swagger from "./components/Swagger";
import qs from "query-string";

import './App.css';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      error: '',
      errorToastId: null,
      errorLineIndex: -1,
      apisText: '',
      mocksText: '',
      htteDefinesText: '',
      htteTestsText: '',
      openapisText: '',
      openapisObj: null,
    };
    this.toastManagerProxy = React.createRef();
  }
  componentDidMount() {
    this.loadApiFromLocationQuery();
    window.addEventListener('paste', e => {
      let data = e.clipboardData.getData('text');
      setTimeout(() => {
        if (this.state.code === data) {
          window.scrollTo(0, 0);
        }
      }, 10);
    });
  }
  loadApiFromLocationQuery() {
    const { search } = window.location;
    if (!search) {
      return;
    }
    const { apier } = qs.parse(search);
    if (!apier) {
      return;
    }
    fetch(apier, { cache: 'no-cache' }).then(res => {
      return res.text();
    }).then(text => {
      this.setState({ code: text })
      this.toastManagerProxy.current.click();
    }).catch(err => {
      window.alert(`Cannot load apier at ${apier}, ${err.message}`);
    })
  }
  handlerGenBtnClick = toastManager => {
    if (this.state.errorToastId) {
      toastManager.remove(this.state.errorToastId);
    }
    let result;
    try {
      result = parse(this.state.code);
    } catch (err) {
      let errorLineIndex = -1;
      if (err.lineNumber) {
        errorLineIndex = err.lineNumber - 1;
      }
      toastManager.add(
        err.message,
        { appearance: 'error', autoDismiss: false },
        errorToastId => this.setState({ errorToastId, errorLineIndex })
      );
      return;
    }
    this.setState({
      error: '',
      errorLineIndex: -1,
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
              <Col style={{ maxWidth: '50%' }}>
                <Row>
                  <Col>
                    <Form.Label style={{ paddingTop: '10px' }}>API</Form.Label>
                  </Col>
                  <Col sm="auto" style={{ marginLeft: 'auto' }}>
                    <ToastConsumer>
                      {toastManager => (
                        <Button variant="outline-primary" ref={this.toastManagerProxy} disabled={!this.state.code} onClick={() => this.handlerGenBtnClick(toastManager)}>生成</Button>
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
              <Col style={{ maxWidth: '50%' }}>
                <Tabs defaultActiveKey="swagger">
                  <Tab eventKey="swagger" title="SWAGGER">
                    <Swagger data={this.state.openapisObj} />
                  </Tab>
                  <Tab eventKey="openapi" title="OPENAPI">
                    {this.renderCode(this.state.openapisText, 'yaml')}
                  </Tab>
                  <Tab eventKey="htteTests" title="HTTE-TESTS">
                    {this.renderCode(this.state.htteTestsText, 'yaml')}
                  </Tab>
                  <Tab eventKey="htteDefines" title="HTTE-DEFINES">
                    {this.renderCode(this.state.htteDefinesText, 'yaml')}
                  </Tab>
                  <Tab eventKey="api" title="API">
                    {this.renderCode(this.state.apisText, 'javascript')}
                  </Tab>
                  <Tab eventKey="mock" title="MOCK">
                    {this.renderCode(this.state.mocksText, 'javascript')}
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

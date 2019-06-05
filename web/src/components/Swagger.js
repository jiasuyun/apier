import React, { Component } from "react";
import SwaggerUI, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';

class Swagger extends Component {
  swagger = null;
  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data){
      if (!this.swagger) {
        this.swagger = SwaggerUI({
          dom_id: '#swagger',
          spec: nextProps.data,
          presets: [presets.apis],
        });
      } else {
        this.swagger.specActions.updateJsonSpec(nextProps.data);
      }
    }
  }
  render() {
    return (
      <div id="swagger"></div>
    )
  }
}

export default Swagger;
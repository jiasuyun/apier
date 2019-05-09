
const yaml = require('js-yaml');

const capitalize = ([first, ...rest], lowerRest = false) =>
    first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));

const getOpenapi = (element) => {
    let path = element['path'];
    let method = element['method'];
    const contentRequest = capitalize(element['handler']) + 'Request';
    const contentResponse = capitalize(element['handler']) + 'Response';
    const openapiObj = {};
    const requestObj = {};
    const responsesObj = {};
    let openapiContent1 = '  ';
    let openapiContent2 = '    ';
    let openapiContent3 = '    ';

    openapiObj[path] = {};
    openapiObj[path][method] = {
        'operationId': element['handler'],
        'summary': element['describe'] || '',
        'security': [],
    }

    if (element['security']) delete openapiObj[path][method]['security'];

    if (element['req']) {
        if (element['req']['params']) {
            openapiObj[path][method]['parameters'] = [];
            dealParams(element['req']['params'], openapiObj[path][method]['parameters'], 'path')
        }
        if (element['req']['query']) {
            if (!openapiObj[path][method]['parameters']) openapiObj[path][method]['parameters'] = [];
            dealParams(element['req']['query'], openapiObj[path][method]['parameters'], 'query')
        }
        if (element['req']['headers']) {
            if (!openapiObj[path][method]['headers']) openapiObj[path][method]['headers'] = {};
            dealHeaders(element['req']['headers'], openapiObj[path][method]['headers'])
        }
        if (element['req']['body']) {
            openapiObj[path][method]['requestBody'] = {
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': `#/components/schemas/${contentRequest}`
                        }
                    }
                }
            };
            requestObj[contentRequest] = { type: 'object', properties: {} };
            dealBody(element['req']['body'], requestObj[contentRequest]['properties'], requestObj[contentRequest])
        }
    }
    if (element['res']) {
        openapiObj[path][method]['responses'] = {
            "200": {
                'description': element['describe'],
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': `#/components/schemas/${contentResponse}`
                        }
                    }
                }

            }
        };
        responsesObj[contentResponse] = {
            'description': element['describe'] + ' - 响应参数',
            'content': {
                'application/json': {
                    'schema': {
                        'type': 'object',
                        'properties': {}
                    }
                }
            }
        };
        dealRes(element['res'], responsesObj[contentResponse]['content']['application/json']['schema']['properties'])
    }

    openapiContent1 += yaml.dump(openapiObj).replace(new RegExp("\n", "gm"), '\n  ');
    if (Object.keys(requestObj).length > 0) openapiContent2 += yaml.dump(requestObj).replace(new RegExp("\n", "gm"), '\n    ');
    openapiContent3 += yaml.dump(responsesObj).replace(new RegExp("\n", "gm"), '\n    ');
    const data1 = openapiContent1;
    const data2 = openapiContent2 || '';
    const data3 = openapiContent3;
    return [data1, data2, data3];
}

function dealParams(parames, parameterArr, source) {
    for (const item of Object.keys(parames)) {
        console.log();
        let openapiObjContent = {
            in: source,
            name: item,
            required: parames[item]['required'],
            schema: {
                type: parames[item]['type']
            }
        }
        parameterArr.push(openapiObjContent);
        for (const item2 of Object.keys(parames[item])) {
            if (['value', 'type', 'required', 'name'].includes(item2)) continue;
            openapiObjContent['schema'][item2] = parames[item][item2];
        }
    }
}

function dealHeaders(headers, headersObj) {
    for (const item of Object.keys(headers)) {
        headersObj[item] = headers[item]['value'];
    }
}

function dealBody(body, propertiesObj, obj) {
    for (const item of Object.keys(body)) {
        propertiesObj[item] = {};
        for (const item2 of Object.keys(body[item])) {
            switch (item2) {
                case 'value':
                    break;
                case 'required':
                    if (body[item][item2]) {
                        if (!obj['required']) obj['required'] = [];
                        obj['required'].push(item);
                    }
                    break;
                case 'desc':
                    propertiesObj[item]['description'] = body[item][item2];
                    break;
                default:
                    propertiesObj[item][item2] = body[item][item2];
                    break;
            }
        }
    }
}

function dealRes(resObj, properties) {
    for (const item of Object.keys(resObj)) {
        properties[item] = {
            type: resObj[item]['type'],
            value: resObj[item]['value']
        }
    }
}
module.exports = getOpenapi;
const JSON5 = require('json5');
/**
 *  输入字符串，输出规整的接口对象
 * @returns {API}
 */

const regex1 = /"[^"]*"|'[^"]*'|\S+/g;

function parse(input) {
    let result = [];
    try {
        let jsonData =JSON5.parse(input);
        for (const item of Object.keys(jsonData)) {
            const element = { handler: item };
            result.push(element);
            if (!jsonData[item]['route']) throw 'route err';
            dealRoute(jsonData[item]['route'], element);
            if (jsonData[item]['req']) dealReq(jsonData[item]['req'], element);
            if (jsonData[item]['res']) dealRes(jsonData[item]['res'], element);
        }
    } catch (error) {
        console.error(error);
    }
    return result;
}

function dealRoute(str, element) {
    const routeArr = str.match(regex1);
    if (routeArr.length < 2) throw 'route err';
    element['method'] = routeArr[0].toLocaleLowerCase();
    element['path'] = routeArr[1];
    return;
}

function dealReq(reqObj, element) {
    if(!element['req']) element['req']={};
    for (const item of Object.keys(reqObj)) {
        let key = '';
        switch (item) {
            case 'query':
                key = 'query';
                break;
            case 'params':
                key = 'params';
                break;
            case 'headers':
                key = 'headers';
                break;
            case 'body':
                key = 'body';
                break;
        }
        if (key.length === 0) continue;
        
        if(!element['req'][key])element['req'][key]={};
        for (const item2 of Object.keys(reqObj[item])) {
            element['req'][key][item2]={
                value:reqObj[item][item2],
                type:typeJudgment(reqObj[item][item2]),
                required:true
            }
        }
    }
    return;
}

function dealRes(resObj, element) {
    if(!element['res']) element['res']={};
    for (const item of Object.keys(resObj)) {
        element['res'][item]={
            value:resObj[item],
            type:typeJudgment(resObj[item])
        }
    }
    return;
}

function typeJudgment(value) {
    let type = 'string';
    if (!value){
        if(value===null) return 'null';
        if(value===undefined) return 'undefined ';
        if(isNaN(value)) return 'NaN ';
    }
    if (Array.isArray(value)) {
        type = 'array';
    } else if (Object.prototype.toString.call(value) === '[Object Object]') {
        type = 'object';
    } else {
        type = typeof value;
    }
    return type;
}

/**
 * @typedef {Object} API
 * @property {string} method
 * @property {string} path
 * @property {Req} req
 * @property {Object} res
 */

/**
 * @typedef {Object} Req
 * @property {Object} [query]
 * @property {Object} [params]
 * @property {Object} [headers]
 * @property {Object} [body]
 */


module.exports = parse;
const yaml = require('js-yaml');

const getHtte = (element) => {
    const jwtContent = "!$concat [ Bearer, ' ', !$query before.login.res.body.token ]";
    const htteObj = {
        'describe': element['describe'],
        'includes': element['handler'],
    };
    const htteObj2 = {};
    htteObj2[element['handler']] = {
        req: {
            method: element['method'],
            path: element['path'].replace(/\/:([a-zA-Z0-9])+[^/]/, `/{$1}`),
        }
    }

    if (!element['describe']) delete htteObj['describe'];
    if (element['security']) {
        if (!htteObj['req']) htteObj['req'] = {};
        htteObj['req']['headers'] = {
            'Authorization': jwtContent
        }
    }
    if (element['req']) {
        if (!htteObj['req']) htteObj['req'] = {};
        dealQeq(element['req'], htteObj['req'])
    }
    if (element['res']) {
        if (!htteObj['res']) htteObj['res'] = {};
        dealQes(element['res'], htteObj['res'])
    }
    const data1 = `  ${yaml.dump(htteObj).replace(new RegExp("\n", "gm"), '\n  ').replace("'!$concat [ Bearer, '' '', !$query before.login.res.body.token ]'", jwtContent)}`;
    const data2 = yaml.dump(htteObj2).replace(new RegExp("\n", "gm"));
    return [data1, data2];
}

function dealQeq(elementReq, htteReq) {
    for (const key of Object.keys(elementReq)) {
        if (!htteReq[key]) htteReq[key] = {};
        for (const item2 of Object.keys(elementReq[key])) {
            htteReq[key][item2] = elementReq[key][item2]['value'];
        }
    }
}

function dealQes(elementRes, htteRes) {
    for (const item of Object.keys(elementRes)) {
        htteRes[item] = elementRes[item]['value'];
    }
}

module.exports = getHtte;
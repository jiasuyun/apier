"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const apier = __importStar(require("@dee-contrib/apier"));
const apier_utils_1 = require("@dee-contrib/apier-utils");
const OPERATION_KEYS = ['tags', 'description', 'deperacated', 'security', 'servers'];
const PARAMETER_KEYS = ['name', 'in', 'description', 'required', 'deprecated', 'allowEmptyValue'];
const FUN_KEYS = ['optional', 'saveSchema', 'useSchema', 'array'];
class Generator {
    constructor(apier) {
        const schemas = {};
        const operation = { responses: {} };
        const url = apier_utils_1.colonToCurlybrace(apier.url);
        this.apier = apier;
        this.value = { paths: { [url]: { [apier.method]: operation } }, components: { schemas } };
        this.operation = operation;
        this.generate();
    }
    generate() {
        const { apier } = this;
        const { comment, model: { req } } = apier;
        const commentUtil = comment.retrive();
        const summary = commentUtil.val('summary', apier.name);
        const operation = { operationId: apier.name, summary };
        Object.assign(operation, commentUtil.pick(OPERATION_KEYS));
        const parameters = this.dealParameters();
        if (parameters.length > 0) {
            operation.parameters = parameters;
        }
        if (req.model.body)
            this.dealReqeustBody();
        this.dealResponses();
    }
    dealParameters() {
        const parameters = [];
        ['params', 'query', 'headers'].forEach(key => {
            const apierParameters = this.apier.model.req.model[key];
            if (!apierParameters)
                return;
            Object.keys(apierParameters.model).forEach(name => {
                const apierParameter = apierParameters.model[name];
                const commentUtil = apierParameter.comment.retrive();
                const useSchema = commentUtil.val('useSchema');
                if (useSchema)
                    return parameters.push(createRef(useSchema));
                const parameter = { name, 'in': inOfParameter(key) };
                Object.assign(parameter, commentUtil.pick(PARAMETER_KEYS));
                parameter.schema = this.createSchema(apierParameter);
                [...PARAMETER_KEYS, ...FUN_KEYS, 'description'].forEach(key => delete parameter.schema[key]);
                if (commentUtil.val('optional'))
                    parameter.required = true;
                const saveSchema = commentUtil.val('saveSchema');
                if (saveSchema)
                    parameter.schema = this.saveSchema(saveSchema, parameter.schema);
                parameters.push(parameter);
            });
        });
        return parameters;
    }
    dealReqeustBody() {
        const body = this.apier.model.req.model.body;
        const commentUtil = body.comment.retrive();
        const requestBody = { content: {} };
        this.operation.requestBody = requestBody;
        const description = commentUtil.val('description');
        if (description)
            requestBody.description = description;
        if (!commentUtil.val('optional'))
            requestBody.required = true;
        const useSchema = commentUtil.val('useSchema');
        const contentType = commentUtil.val('contentType', 'application/json');
        if (useSchema)
            return requestBody.content = { [contentType]: { schema: createRef(useSchema) } };
        const schemaName = commentUtil.val('saveSchema', nameOfReqResSchema(this.apier.name, 'Request'));
        requestBody.content = { [contentType]: { schema: this.saveSchema(schemaName, this.createSchema(body)) } };
    }
    dealResponses() {
        const res = this.apier.model.res;
        const commentUtil = res.comment.retrive();
        const { status, body } = res.model;
        const responses = { [status]: {} };
        this.operation.responses = responses;
        responses[status].description = commentUtil.val('description', 'SUCCESS');
        const contentType = commentUtil.val('contentType', 'application/json');
        const useSchema = commentUtil.val('useSchema');
        if (useSchema)
            return responses[status].content = { [contentType]: { schema: createRef(useSchema) } };
        const schemaName = commentUtil.val('saveSchema', nameOfReqResSchema(this.apier.name, 'Response'));
        responses[status].content = { [contentType]: { schema: this.saveSchema(schemaName, this.createSchema(body)) } };
    }
    saveSchema(name, schema) {
        this.value.components.schemas[name] = schema;
        return createRef(name);
    }
    createSchema(apierItem) {
        const schema = {};
        this.schemaUtil(apierItem, schema);
        return schema;
    }
    schemaUtil(apierItem, schema) {
        const commentUtil = apierItem.comment.retrive();
        const useSchema = commentUtil.val('useSchema');
        if (useSchema) {
            Object.assign(schema, createRef(useSchema));
            return !commentUtil.val('optional', false);
        }
        ;
        if (apierItem instanceof apier.ApierObject) {
            this.schemaObject(apierItem, schema);
        }
        else if (apierItem instanceof apier.ApierArray) {
            this.schemaArray(apierItem, schema);
        }
        Object.assign(schema, { type: apierItem.kind() }, commentUtil.omit(FUN_KEYS));
        const saveSchema = commentUtil.val('saveSchema');
        if (saveSchema) {
            this.value.components.schemas[saveSchema] = Object.assign({}, schema);
            Object.keys(schema).forEach(key => delete schema[key]); // clear
            Object.assign(schema, createRef(saveSchema));
        }
        return !commentUtil.val('optional', false);
    }
    schemaArray(apierItem, schema) {
        const children = apierItem.model;
        if (children.length === 0)
            return;
        const commentUtil = apierItem.comment.retrive();
        let strategy = commentUtil.val('array', 'anyOf');
        const items = schema.items = {};
        if (children.length === 1)
            strategy = 'first';
        if (strategy === 'first') {
            this.schemaUtil(children[0], items);
        }
        else if (strategy = 'anyOf') {
            const anyOf = items.anyOf = [];
            children.forEach((child) => {
                const childSchema = {};
                this.schemaUtil(child, childSchema);
                anyOf.push(childSchema);
            });
        }
        else {
            this.schemaArrayAll(apierItem, schema);
        }
    }
    schemaArrayAll(apierItem, schema) {
        let requiredAll = [];
        let properties = {};
        const children = apierItem.model;
        children.forEach((child) => {
            const childSchema = {};
            this.schemaUtil(child, childSchema);
            if (child.kind() === apier_utils_1.ApierKind.OBJECT) {
                requiredAll = [...requiredAll, ...childSchema.required];
                properties = Object.assign({}, properties, childSchema.properties);
            }
        });
        schema.type = 'object';
        schema.properties = properties;
        const required = filterByCount(requiredAll, children.length);
        if (required.length > 0)
            schema.required = required;
    }
    schemaObject(apierItem, schema) {
        const properties = {};
        const required = [];
        let haveProperties = false;
        for (const key in apierItem.model) {
            haveProperties = true;
            const item = schema.properties[key] = {};
            if (this.schemaUtil(apierItem.model[key], item)) {
                required.push(key);
            }
        }
        if (required.length > 0)
            schema.required = required;
        if (haveProperties)
            schema.properties = properties;
    }
}
exports.default = Generator;
function createRef(name) {
    return { ['$ref']: `#/components/schemas/${name}` };
}
function inOfParameter(name) {
    if (name === 'params')
        return 'path';
    if (name === 'query')
        return 'query';
    return 'header';
}
function nameOfReqResSchema(text, tail) {
    return [text[0].toUpperCase(), ...text.slice(1), ...tail].join('');
}
function filterByCount(arr, count) {
    const result = [];
    arr.sort().reduce((a, c) => {
        if (c === a.prev) {
            a.count++;
            if (a.count === count) {
                result.push(c);
            }
            return a;
        }
        else {
            return { prev: c, count: 1 };
        }
    }, { prev: '', count: 0 });
    return result;
}
//# sourceMappingURL=index.js.map
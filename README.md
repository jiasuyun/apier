# API 工具

## 开始使用

```js
{
    "getModel": {
        "route": "GET /model/:id", // security=[]
        "req": {
            "query": {
                "pageSize": 10, // maximum=10
                "pageNo": 1, 
            },
            "params": {
                "id": 32234, // type=integer format=int32
            },
            "headers": {
                "X-ORG-ID": 32432
            },
            "body": { //
                "integer": 32, // format=int64
                "number": 16.23, // format=float
                "bool": true,
                "null": null,
                "array": [
                    "1",
                    "2",
                ]
                "object": {
                    "foo": 3
                }
            }
        },
        "res": {
            "integer": 32, // format=int64
            "number": 16.23, // format=float
            "bool": true,
            "null": null,
            "array": [
                "1",
                "2",
            ]
            "object": {
                "password": "a234324" // minLength=6
            }
        }
    }
}
```

## 设计

- 使用 `json5` 解析文档
- 注释追踪

> 如何将 `minLength` 应用到 `getModel.res.object.password`? 发现 `//`，查找其所在行头部 `password`, 查找其父级 `object`, 查找其父级 `res`，查找其父级 `getModel`。

## 结构

const { filter } = require('../comment');

const getHtte = (element, comments) => {
  const { summary = `测试 ${element.name}` } = filter(comments, [element.name], true) || {};
  const { url, method, req, res } = element;
  const dumpObj = {
    describe: summary,
    req: { method, url: url.replace(/\/:([A-Za-z0-9_]+)/g, '/{$1}'), ...req },
    res
  }
  return dumpObj;
}


module.exports = getHtte;
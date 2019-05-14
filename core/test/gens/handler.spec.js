const getHandler = require('../../src/gens/handler');

it('getHandler', () => {
  const { getModel } = require('../fixtures/apis');
  expect(getHandler(getModel)).toEqual(`export async function getModel(req: Request, res: Response) {}`);
})
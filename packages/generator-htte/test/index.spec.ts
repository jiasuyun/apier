import Generator from '../src';
import { loadApiers } from "@dee-contrib/apier-test-utils-generator";

test('generate', () => {
  const apier = loadApiers('general')[0];
  const generator = new Generator(apier);
  expect(generator.value).toMatchSnapshot();
});

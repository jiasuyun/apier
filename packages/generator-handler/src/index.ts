import * as apier from "@jiasuyun/apier"; // eslint-disable-line

export type GeneratorResult = string;
export default class Generator {
  public readonly value: GeneratorResult;
  constructor(apier: apier.Apier) {
    this.value = `export async function ${
      apier.name
    }(req: Request, res: Response) {}`;
  }
}

import { Apier } from "@jiasuyun/apier";

export type GeneratorResult = string;
export default class Generator {
  public readonly value: GeneratorResult;
  constructor(apier: Apier) {
    this.value = `export async function ${
      apier.name
    }(req: Request, res: Response) {}`;
  }
}

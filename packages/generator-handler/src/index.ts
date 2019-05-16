import * as apier from '@dee-contrib/apier';

export type GeneratorResult = string;
export class Generator {
  public readonly value: GeneratorResult;
  constructor(apier: apier.Apier) {
    this.value = `export async function ${apier.name}(req: Request, res: Response) {}`;
  }
}

const getHandler = (element) => {
    return `export async function ${element['name']}(req: Request, res: Response) {}`;
}

module.exports = getHandler;

const getHandler = (element) => {
    return ` export async function ${element['handler']}(req: Request, res: Response) {}`;
}

module.exports = getHandler;
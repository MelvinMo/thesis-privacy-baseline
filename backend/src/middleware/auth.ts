import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global{
	namespace Express {
		interface Request {
			userId: string;
		}
	}
}

/*
 * The token will be stored in the Authorization headers as a Bearer token.
 * Example: headers: {
 * 	"Authorization": "Bearer <token>"
 * }
*/
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized: No token provided' });
	}

	const token = authHeader.split(' ')[1];

	try{
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
		req.userId = (decoded as JwtPayload).userId;
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}
}

export default verifyToken;
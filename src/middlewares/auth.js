import { userModel } from '../../DB/Models/usermodel.js'
import { verifyToken } from '../utiles/tokenFunction.js'
import { asyncHandler } from '../utiles/errorhandaling.js'
import jwt from 'jsonwebtoken';

export const roles = {
    User: 'User',
    Admin: 'Admin',
}

export const auth = (accessRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization?.startsWith(process.env.BEARERKEY)) {
            return res.status(400).json({ cause: 400, message: req.translate('invalid bearer key') });
        }

        const token = authorization.split(process.env.BEARERKEY)[1];
        if (!token) {
            return res.status(400).json({ cause: 400, message: req.translate('invalid token') });
        }

        try {
            const decoded = jwt.verify(token, process.env.LOGIN_TOKEN);
            const user = await userModel.findById(decoded.id).select('userName email role');
            if (!user) {
                return res.status(401).json({ cause: 401, message: req.translate('not registered user') });
            }

            if (!accessRoles.includes(user.role)) {
                return res.status(403).json({ cause: 403, message: req.translate('not authorized to access') });
            }

            if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
                return res.status(400).json({ cause: 400, message: req.translate('expired token') });
            }

            req.user = user;
            return next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ cause: 401, message: req.translate('token expired') });
            }
            return res.status(400).json({ cause: 400, message: req.translate('invalid payload token') });
        }
    });
}

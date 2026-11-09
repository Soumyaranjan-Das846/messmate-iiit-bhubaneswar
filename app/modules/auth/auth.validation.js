
const MessModel = require('../mess/mess.model');
const UserModel = require('../user/user.model');

module.exports = class AuthValidation {
    static signupValidation(req, res, next) {
        const { username, email, password, phone, role, adminCode } =
            req.body || {};

        if (!username || !String(username).trim()) {
            return res.status(400).json({
                success: false,
                message: "User name can't be empty"
            });
        }

        if (!email || !String(email).trim()) {
            return res.status(400).json({
                success: false,
                message: "Email can't be empty"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        if (!phone || !String(phone).trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone no can't be empty"
            });
        }

        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration role'
            });
        }

        if (role === 'admin' && !adminCode) {
            return res.status(400).json({
                success: false,
                message: 'Admin registration code is required'
            });
        }

        next();
    }

    static addUserValidation(req, res, next) {
        const { username, email, password, phone } = req.body || {};

        if (!username || !String(username).trim()) {
            return res.status(400).json({
                success: false,
                message: "User name can't be empty"
            });
        }

        if (!email || !String(email).trim()) {
            return res.status(400).json({
                success: false,
                message: "Email can't be empty"
            });
        }

        if (!password || !String(password).trim()) {
            return res.status(400).json({
                success: false,
                message: "Password can't be empty"
            });
        }

        if (!phone || !String(phone).trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone no can't be empty"
            });
        }

        next();
    }

    static loginValidation(req, res, next) {
        const { email, password } = req.body || {};

        if (!email || !String(email).trim()) {
            return res.status(400).json({
                success: false,
                message: "Email can't be empty"
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password can't be empty"
            });
        }

        next();
    }

    async checkMessExistOrNot(mess) {
        const existingMess = await MessModel.findOne(mess);

        if (existingMess) {
            return {
                success: false,
                message: `${mess.messusername} already exists`
            };
        }

        return { success: true };
    }

    async checkEmailExistOrNot(email) {
        const existingUser = await UserModel.findOne(email);

        if (existingUser) {
            return {
                success: false,
                message: 'Email already registered. Please sign in.'
            };
        }

        return { success: true };
    }

    async checkUser(email) {
        const user = await UserModel.findOne(email);

        if (user) {
            return { success: true, data: user };
        }

        return {
            success: false,
            message: 'Incorrect email or password'
        };
    }
};


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const response = require('../../../helper/response');
const UserModel = require('../user/user.model');
const MessModel = require('../mess/mess.model');
const AuthValidation = require('./auth.validation');

const authValidation = new AuthValidation();
const secretKey = require('../../../config/config').development.JWTsecret;

const saltRounds = 10;

module.exports = class AuthController {
    constructor() {}

    async login(req, res, next) {
        try {
            const email = String(req.body.email || '')
                .trim()
                .toLowerCase();

            const result = await authValidation.checkUser({ email });

            if (!result.success) {
                return res.status(401).json(
                    response.error(
                        false,
                        'Incorrect email or password'
                    )
                );
            }

            const matched = await bcrypt.compare(
                req.body.password,
                result.data.password
            );

            if (!matched) {
                return res.status(401).json(
                    response.error(
                        false,
                        'Incorrect email or password'
                    )
                );
            }

            req.user = result.data;
            next();
        } catch (e) {
            console.error('Login error:', e);

            return res.status(500).json(
                response.error(false, 'Unable to sign in')
            );
        }
    }

    async signup(req, res) {
        try {
            const {
                username,
                email,
                password,
                phone,
                role,
                rollNumber,
                department,
                hostel,
                roomNumber,
                address,
                adminCode
            } = req.body;

            const normalizedEmail = String(email)
                .trim()
                .toLowerCase();

            const selectedRole = role === 'admin' ? 'admin' : 'user';

            // Admin registration must be authorized by backend.
            if (selectedRole === 'admin') {
                const expectedCode = process.env.ADMIN_REGISTRATION_CODE;

                if (!expectedCode) {
                    return res.status(503).json(
                        response.error(
                            false,
                            'Admin registration is not configured'
                        )
                    );
                }

                if (
                    typeof adminCode !== 'string' ||
                    adminCode !== expectedCode
                ) {
                    return res.status(403).json(
                        response.error(
                            false,
                            'Invalid admin registration code'
                        )
                    );
                }
            }

            // Student-specific information.
            if (selectedRole === 'user') {
                const studentFields = {
                    rollNumber,
                    department,
                    hostel,
                    roomNumber
                };

                for (const [field, value] of Object.entries(studentFields)) {
                    if (!value || !String(value).trim()) {
                        return res.status(400).json(
                            response.error(
                                false,
                                `${field} is required`
                            )
                        );
                    }
                }
            }

            // Prevent duplicate email.
            const emailCheck =
                await authValidation.checkEmailExistOrNot({
                    email: normalizedEmail
                });

            if (!emailCheck.success) {
                return res.status(409).json(
                    response.error(false, emailCheck.message)
                );
            }

            // Find the existing mess.
            // Prefer a configured mess name if provided.
            let mess;

            const configuredMessName =
                process.env.MESS_USERNAME?.trim();

            if (configuredMessName) {
                mess = await MessModel.findOne({
                    messusername: configuredMessName
                });

                if (!mess) {
                    return res.status(400).json(
                        response.error(
                            false,
                            'Configured mess not found in database'
                        )
                    );
                }
            } else {
                // Safe fallback for a database with exactly one mess.
                const messes = await MessModel.find({})
                    .limit(2);

                if (messes.length === 0) {
                    return res.status(400).json(
                        response.error(
                            false,
                            'No mess exists. Please configure the mess first.'
                        )
                    );
                }

                if (messes.length > 1) {
                    return res.status(400).json(
                        response.error(
                            false,
                            'Multiple messes found. Set MESS_USERNAME in .env.'
                        )
                    );
                }

                mess = messes[0];
            }

            // Hash password before storing.
            const hashedPassword = await bcrypt.hash(
                password,
                saltRounds
            );

            // Explicit whitelist: never store adminCode,
            // confirmPassword, or arbitrary client fields.
            const newUserData = {
                username: String(username).trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: String(phone).trim(),
                role: selectedRole,
                messId: mess._id
            };

            if (selectedRole === 'user') {
                newUserData.rollNumber = String(rollNumber).trim();
                newUserData.department = String(department).trim();
                newUserData.hostel = String(hostel).trim();
                newUserData.roomNumber = String(roomNumber).trim();
            } else {
                newUserData.address = String(address || '').trim();
            }

            const newUser = await UserModel.create(newUserData);

            // Never return password hash to frontend.
            const safeUser = {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                messId: newUser.messId,
                rollNumber: newUser.rollNumber,
                department: newUser.department,
                hostel: newUser.hostel,
                roomNumber: newUser.roomNumber
            };

            return res.status(201).json(
                response.single(
                    true,
                    'Account created successfully',
                    safeUser
                )
            );
        } catch (e) {
            console.error('Signup error:', e);

            if (e.code === 11000) {
                return res.status(409).json(
                    response.error(
                        false,
                        'Email already registered. Please sign in.'
                    )
                );
            }

            return res.status(500).json(
                response.error(
                    false,
                    'Registration failed. Please try again.'
                )
            );
        }
    }

    async prepareToken(req, res, next) {
        try {
            const mess = await MessModel.findById(req.user.messId);

            if (!mess) {
                return res.status(401).json(
                    response.error(false, 'Mess account not found')
                );
            }

            req.auth = {
                id: req.user._id,
                username: req.user.username,
                messusername: mess.messusername,
                messId: mess._id,
                email: req.user.email,
                role: req.user.role
            };

            next();
        } catch (e) {
            console.error('Token preparation error:', e);

            return res.status(500).json(
                response.error(false, 'Unable to prepare login')
            );
        }
    }

    generateToken(req, res, next) {
        try {
            req.tokenObject = {};

            req.tokenObject.token = jwt.sign(
                req.auth,
                secretKey,
                { expiresIn: '30 days' }
            );

            next();
        } catch (e) {
            console.error('Token generation error:', e);

            return res.status(500).json(
                response.error(false, 'Unable to generate token')
            );
        }
    }

    sendToken(req, res) {
        res.setHeader('x-auth-token', req.tokenObject.token);

        return res.json(
            response.single(
                true,
                'Enjoy your token!',
                { token: req.tokenObject.token }
            )
        );
    }

    async isAuthenticate(req, res, next) {
        try {
            const token = req.headers['x-auth-token'];

            if (!token) {
                return res.status(401).json(
                    response.error(
                        false,
                        'No token provided'
                    )
                );
            }

            const decoded = jwt.verify(token, secretKey);

            const user = await UserModel.findOne({
                _id: decoded.id,
                messId: decoded.messId
            });

            if (!user) {
                return res.status(401).json(
                    response.error(
                        false,
                        'Failed to authenticate user'
                    )
                );
            }

            // Refresh role from database, not stale JWT.
            req.auth = {
                ...decoded,
                role: user.role,
                username: user.username,
                email: user.email,
                messId: user.messId
            };

            next();
        } catch (e) {
            return res.status(401).json(
                response.error(
                    false,
                    'Authentication failed'
                )
            );
        }
    }

    isUser(req, res, next) {
        if (
            req.auth?.role === 'user' ||
            req.auth?.role === 'admin'
        ) {
            return next();
        }

        return res.status(403).json(
            response.error(
                false,
                'Access denied',
                null
            )
        );
    }

    isAdmin(req, res, next) {
        if (req.auth?.role === 'admin') {
            return next();
        }

        return res.status(403).json(
            response.error(
                false,
                'Admin access required',
                null
            )
        );
    }
};

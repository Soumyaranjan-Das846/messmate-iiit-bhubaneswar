
const bcrypt = require('bcryptjs');

const saltRounds = 10;

const BalanceModule = require('../balance/index');

const { BalanceModel } = BalanceModule;
const ExpenseModel = require('../expense/expense.model');
const MealModel = require('../meal/meal.model');
const UserModel = require('./user.model');

class UserLib {
    static async getProfile(id) {
        try {
            return await UserModel.findById(id, { password: 0 });
        } catch (e) {
            throw e;
        }
    }

    static async updateProfile(id, updateObject) {
        try {
            return await UserModel.findByIdAndUpdate(
                id,
                updateObject,
                { new: true }
            );
        } catch (e) {
            throw e;
        }
    }

    static async changPassword(id, oldPassword, newPassword) {
        try {
            const user = await UserModel.findOne({ _id: id });

            if (user) {
                const isMatched = await bcrypt.compare(
                    oldPassword,
                    user.password
                );

                if (isMatched) {
                    const hashed = bcrypt.hashSync(
                        newPassword,
                        saltRounds
                    );

                    return {
                        success: true,
                        data: await UserModel.findOneAndUpdate(
                            { _id: id },
                            { $set: { password: hashed } },
                            { new: true }
                        ),
                    };
                }

                return {
                    success: false,
                    message: 'Password not matched',
                };
            }

            return {
                success: false,
                message: 'User not found',
            };
        } catch (e) {
            throw e;
        }
    }

    static async getUsers(messId) {
        try {
            return await UserModel.find(
                { messId },
                { password: 0 }
            );
        } catch (e) {
            throw e;
        }
    }

    // Admin can edit students belonging to their own mess only
    static async updateStudent(userId, messId, studentData) {
        try {
            const allowedFields = [
                'username',
                'email',
                'phone',
                'rollNumber',
                'department',
                'hostel',
                'roomNumber',
            ];

            const updates = {};

            for (const field of allowedFields) {
                if (Object.prototype.hasOwnProperty.call(studentData, field)) {
                    if (
                        typeof studentData[field] !== 'string' ||
                        !studentData[field].trim()
                    ) {
                        return {
                            success: false,
                            status: 400,
                            message: `${field} must be a non-empty string`,
                        };
                    }

                    updates[field] = studentData[field].trim();
                }
            }

            if (Object.keys(updates).length === 0) {
                return {
                    success: false,
                    status: 400,
                    message: 'No valid student fields provided',
                };
            }

            if (updates.email) {
                updates.email = updates.email.toLowerCase();

                const existingUser = await UserModel.findOne({
                    email: updates.email,
                    _id: { $ne: userId },
                });

                if (existingUser) {
                    return {
                        success: false,
                        status: 409,
                        message: 'Email already exists',
                    };
                }
            }

            const updatedStudent = await UserModel.findOneAndUpdate(
                {
                    _id: userId,
                    messId,
                    role: 'user',
                },
                { $set: updates },
                {
                    new: true,
                    runValidators: true,
                    projection: { password: 0 },
                }
            );

            if (!updatedStudent) {
                return {
                    success: false,
                    status: 404,
                    message: 'Student not found in your mess',
                };
            }

            return {
                success: true,
                data: updatedStudent,
            };
        } catch (e) {
            if (e.code === 11000) {
                return {
                    success: false,
                    status: 409,
                    message: 'Email already exists',
                };
            }

            throw e;
        }
    }

    // Securely remove only students belonging to the admin's mess
    static async removeUser(userId, messId) {
        try {
            const user = await UserModel.findOne({
                _id: userId,
                messId,
                role: 'user',
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Student not found in your mess',
                };
            }

            await UserModel.deleteOne({
                _id: userId,
                messId,
                role: 'user',
            });

            await BalanceModel.deleteMany({ userId, messId });
            await ExpenseModel.deleteMany({ userId, messId });
            await MealModel.deleteMany({ userId, messId });

            return {
                success: true,
                message: 'Student removed successfully',
            };
        } catch (e) {
            throw e;
        }
    }

    static async addUser(user) {
        try {
            user.password = bcrypt.hashSync(
                user.password,
                saltRounds
            );

            user.role = 'user';

            const found = await UserModel.findOne({
                email: user.email,
            });

            if (found) {
                return {
                    success: false,
                    message: 'Email already exist',
                };
            }

            return {
                success: true,
                data: await UserModel.create(user),
            };
        } catch (e) {
            throw e;
        }
    }
}

module.exports = UserLib;

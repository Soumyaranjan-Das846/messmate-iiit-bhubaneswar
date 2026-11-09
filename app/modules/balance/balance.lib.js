
const UserModel = require('../user/user.model');
const CategoryModel = require('../category/category.model');
const BalanceModel = require('./balance.model');
const ExpenseLib = require('../expense/expense.lib');

async function Balancedetails(data) {
    const balanceDetails = await Promise.all(
        data.map(async (item) => {
            const [cat, usr] = await Promise.all([
                item.categoryId
                    ? CategoryModel.findById(item.categoryId)
                    : null,
                item.userId
                    ? UserModel.findById(item.userId)
                    : null,
            ]);

            return {
                ...item.toObject(),
                category: cat?.name || 'Uncategorized',
                username: usr?.username || 'Unknown User',
            };
        })
    );

    const total = data.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
    );

    return { data: balanceDetails, total };
}

class BalanceLib {
    static async addBalance(balanceObject) {
        const balance = await BalanceModel.create(balanceObject);

        return {
            success: true,
            message: `You have added ${balance.amount} amount to your balance`,
            data: balance,
        };
    }

    static async userTotalBalance(firstDate, lastDate, id) {
        const data = await BalanceModel.find({
            userId: id,
            date: { $gte: firstDate, $lte: lastDate },
        });

        return Balancedetails(data);
    }

    static async userMealBalance(firstDate, lastDate, id, messId) {
        const category = await CategoryModel.findOne({
            isMeal: 1,
            messId,
        });

        if (!category) {
            return { data: [], total: 0 };
        }

        const data = await BalanceModel.find({
            userId: id,
            messId,
            categoryId: category._id,
            date: { $gte: firstDate, $lte: lastDate },
        });

        return Balancedetails(data);
    }

    static async totalMessBalance(firstDate, lastDate, messId) {
        const data = await BalanceModel.find({
            messId,
            date: { $gte: firstDate, $lte: lastDate },
        });

        return Balancedetails(data);
    }

    static async totalMealBalance(firstDate, lastDate, messId) {
        const category = await CategoryModel.findOne({
            isMeal: 1,
            messId,
        });

        if (!category) {
            return { data: [], total: 0 };
        }

        const data = await BalanceModel.find({
            categoryId: category._id,
            messId,
            date: { $gte: firstDate, $lte: lastDate },
        });

        return Balancedetails(data);
    }

    static async categoryWiseBalance(firstDate, lastDate, categoryId) {
        const data = await BalanceModel.find({
            categoryId,
            date: { $gte: firstDate, $lte: lastDate },
        });

        return Balancedetails(data);
    }

    static async currentAvailableBalance(firstDate, lastDate, messId) {
        const [balance, expense] = await Promise.all([
            this.totalMessBalance(firstDate, lastDate, messId),
            ExpenseLib.totalMessExpense(firstDate, lastDate, messId),
        ]);

        return (
            (Number(balance.total) || 0) -
            (Number(expense.total) || 0)
        );
    }

    static async updateBalance(balanceId, updateObj) {
        return BalanceModel.findByIdAndUpdate(
            balanceId,
            updateObj,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    static async deleteBalance(balanceId) {
        return BalanceModel.findByIdAndDelete(balanceId);
    }
}

module.exports = BalanceLib;


const MealModel = require('./meal.model');
const UserModel = require('../user/user.model');
const ExpenseLib = require('../expense/expense.lib');

async function getMealDetails(data) {
    const mealDetails = await Promise.all(
        data.map(async (item) => {
            const usr = item.userId
                ? await UserModel.findById(item.userId)
                : null;

            return {
                ...item.toObject(),
                username: usr?.username || 'Unknown Student',
            };
        })
    );

    const meals = data.reduce(
        (sum, item) => sum + (Number(item.numberOfMeal) || 0),
        0
    );

    return {
        data: mealDetails,
        meals,
    };
}

class MealLib {
    static async addMeal(mealObject) {
        return MealModel.create(mealObject);
    }

    static async updateMeal(mealId, updateObj) {
        return MealModel.findByIdAndUpdate(
            mealId,
            updateObj,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    static async deleteMeal(mealId) {
        return MealModel.findByIdAndDelete(mealId);
    }

    static async totalMealInMonth(
        currentMonthFirstDate,
        currentMonthLastDate,
        messId
    ) {
        const data = await MealModel.find({
            messId,
            date: {
                $gte: currentMonthFirstDate,
                $lte: currentMonthLastDate,
            },
        });

        return getMealDetails(data);
    }

    static async totalMeal(
        currentMonth,
        currentMonthLastDate,
        messId
    ) {
        const data = await MealModel.find({
            messId,
            date: {
                $gte: currentMonth,
                $lte: currentMonthLastDate,
            },
        });

        return getMealDetails(data);
    }

    static async currentMeal(
        currentMonth,
        currentMonthLastDate,
        messId
    ) {
        const data = await MealModel.find({
            messId,
            date: {
                $gte: currentMonth,
                $lte: currentMonthLastDate,
            },
        });

        return getMealDetails(data);
    }

    static async userWiseMeal(
        currentMonthFirstDate,
        currentMonthLastDate,
        userId
    ) {
        const data = await MealModel.find({
            userId,
            date: {
                $gte: currentMonthFirstDate,
                $lte: currentMonthLastDate,
            },
        });

        const meals = data.reduce(
            (sum, item) => sum + (Number(item.numberOfMeal) || 0),
            0
        );

        return {
            data,
            meals,
        };
    }

    static async mealRateInMonth(
        currentMonthFirstDate,
        currentMonthLastDate,
        messId
    ) {
        const [expense, meal] = await Promise.all([
            ExpenseLib.totalMealExpense(
                currentMonthFirstDate,
                currentMonthLastDate,
                messId
            ),
            MealLib.totalMealInMonth(
                currentMonthFirstDate,
                currentMonthLastDate,
                messId
            ),
        ]);

        const totalMeals = Number(meal.meals) || 0;

        if (totalMeals === 0) {
            return 0;
        }

        return (Number(expense.total) || 0) / totalMeals;
    }

    static async mealRate(messId) {
        const [expense, meal] = await Promise.all([
            ExpenseLib.totalMessExpense(messId),
            MealLib.totalMeal(messId),
        ]);

        const totalExpense =
            typeof expense === 'number'
                ? expense
                : Number(expense?.total) || 0;

        const totalMeals =
            typeof meal === 'number'
                ? meal
                : Number(meal?.meals) || 0;

        if (totalMeals === 0) {
            return 0;
        }

        return totalExpense / totalMeals;
    }
}

module.exports = MealLib;


const express = require('express');
const app = express();

require('dotenv').config();

const path = require('path');
const cors = require('cors');

const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

const connectDatabase = require('./config/database');

const AppModule = require('./app/modules/index');
const indexRoute = require('./routes/index');

const MenuRoute = require('./app/modules/menu/menu.route');
const FeedbackRoute = require('./app/modules/feedback/feedback.route');
const StudentRoute = require('./app/modules/student/student.route');

const {
    AuthModule,
    CategoryModule,
    BalanceModule,
    ExpenseModule,
    MealModule,
    MessModule,
    UserModule
} = AppModule;

const { UserRoute } = UserModule;
const { CategoryRoute } = CategoryModule;
const { BalanceRoute } = BalanceModule;
const { ExpenseRoute } = ExpenseModule;
const { MealRoute } = MealModule;
const { MessRoute } = MessModule;

const { AuthController, AuthRoute } = AuthModule;

const authController = new AuthController();

// CORS configuration
const corsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Public routes
app.use('/', indexRoute);
app.use('/api/auth', AuthRoute);

// Authenticate all /api/v1 routes
app.all('/api/v1/*', authController.isAuthenticate);

// Existing Admin and shared routes
app.use('/api/v1/user', UserRoute);
app.use('/api/v1/category', CategoryRoute);
app.use('/api/v1/balance', BalanceRoute);
app.use('/api/v1/expense', ExpenseRoute);
app.use('/api/v1/meal', MealRoute);
app.use('/api/v1/mess', MessRoute);

// Weekly Mess Menu
app.use('/api/v1/menu', MenuRoute);

// Feedback and Complaints
app.use('/api/v1/feedback', FeedbackRoute);

// Student Portal
app.use('/api/v1/student', StudentRoute);

// Start server only after MongoDB connects
async function startServer() {
    try {
        await connectDatabase();

        server.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
            console.log('MongoDB connection ready');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();

require('dotenv').config();
console.log("=== ENV DEBUG ===");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("=================");
require('./Models/db');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const ExpenseRouter = require('./Routes/ExpenseRouter');
const BudgetRouter = require('./Routes/BudgetRouter');
const ensureAuthenticated = require('./Middlewares/Auth');

const PORT = process.env.PORT || 4000;

// CORS configuration - Fixed to allow frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.use('/api/auth', AuthRouter);
app.use('/api/products', ProductRouter);
app.use('/api/expenses', ensureAuthenticated, ExpenseRouter);
app.use('/api/budgets', ensureAuthenticated, BudgetRouter);



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const Topic = require('./models/category');
const userRouter = require('./routes/users');
const categoryRouter = require('./routes/categories');

const app = express();

mongoose.connect('mongodb://localhost:27017/test')

mongoose.connection.on('connected', () => {
    console.log('connected to mongodb');
}).on('error', (error) => {
    console.log(error);
});

app.use(express.json());
app.use('/users', userRouter);
app.use('/categories', categoryRouter);

app.listen(3001);

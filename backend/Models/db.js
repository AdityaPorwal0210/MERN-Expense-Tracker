import mongoose from 'mongoose';

const mongo_url ="mongodb+srv://adityaporwal234_db_user:aditya@cluster0.i6gr9ft.mongodb.net/expense_tracker";
console.log(mongo_url)
mongoose.connect(mongo_url)
    .then(() => {
        console.log('MongoDB Connected...');
    }).catch((err) => {
        console.log('MongoDB Connection Error: ', err);
    })
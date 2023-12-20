const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/HWCRUD", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to DB")).catch(console.error);


const ShoppingList = require('./models/ShoppingList')

app.get('/list',async (req, res) => {
    const list = await ShoppingList.find();

    res.json(list);
});

app.post('/list/new', (req, res) => {
    const list = new ShoppingList({
        name: req.body.name
    });
    list.save();

    res.json(list);
    
})

app.delete('/list/delete/:id', async (req, res) => {
    const result = await ShoppingList.findByIdAndDelete(req.params.id);
    res.json(result);
})

app.put('/list/items/complete/:id', async (req,res) => {
    const item
});

app.listen(3001, () => console.log("Server started on port 3001"));
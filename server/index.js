const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const ItemsModel = require('./models/Items')



app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://coufal:123@cluster0.ckzh8l6.mongodb.net/?retryWrites=true&w=majority", {
}).then(() => console.log("Connected to DB")).catch(console.error);


app.get("/getLists", async (req, res) => {
    try {
        const items = await ItemsModel.find({});
        res.json(items);
    } catch (err) {
        res.json(err);
    }
});


app.post("/createList", async (req, res) => {
    const item = req.body;
    const newItem = new ItemsModel(item);
    const savedItem = await newItem.save();

    res.json(savedItem);
});

app.delete("/deleteList/:id", async (req, res) => {
    try {
        const { id } = req.params; // Extract the id from the request parameters
        const deletedItem = await ItemsModel.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).send("No item found with that id");
        }

        // Optionally, return the deleted item or a success message
        res.json({ message: "List deleted successfully", deletedItem });
    } catch (error) {
        res.status(500).send("Error deleting the item");
    }
});

app.post("/addItemToList/:listId", async (req, res) => {
    const { listId } = req.params;
    const item = req.body; 

    try {
        const updatedList = await ItemsModel.findByIdAndUpdate(
            listId,
            { $push: { items: item } },
            { new: true }
        );
        res.json(updatedList);
    } catch (error) {
        res.status(400).send("Error adding item to list");
    }
});

// Increment item quantity within a list
app.post("/incrementItemQuantity/:listId/:itemId", async (req, res) => {
    try {
        const { listId, itemId } = req.params;

        const list = await ItemsModel.findById(listId);
        const item = list.items.id(itemId); // Using Mongoose's id method to find a subdocument
        if (item) {
            item.quantity += 1;
            await list.save(); // This will trigger Mongoose middleware to save the parent document
            res.json(item);
        } else {
            res.status(404).send("Item not found");
        }
    } catch (error) {
        res.status(500).send("Error updating item: " + error.message);
    }
});

// Decrement item quantity within a list
app.post("/decrementItemQuantity/:listId/:itemId", async (req, res) => {
    try {
        const { listId, itemId } = req.params;

        const list = await ItemsModel.findById(listId);
        const item = list.items.id(itemId); // Using Mongoose's id method to find a subdocument
        if (item) {
            item.quantity = Math.max(0, item.quantity - 1); // Prevent negative quantities
            if (item.quantity === 0) {
                item.remove(); // Remove the item if quantity is 0
            }
            await list.save();
            res.json(item.quantity > 0 ? item : { message: "Item removed" });
        } else {
            res.status(404).send("Item not found");
        }
    } catch (error) {
        res.status(500).send("Error updating item: " + error.message);
    }
});

app.patch("/toggleItemSelection/:listId/:itemId", async (req, res) => {
    try {
        const { listId, itemId } = req.params;

        const list = await ItemsModel.findById(listId);
        const item = list.items.id(itemId); // Find the subdocument
        if (item) {
            item.isSelected = !item.isSelected; // Toggle the boolean
            await list.save();
            res.json(item);
        } else {
            res.status(404).send("Item not found");
        }
    } catch (error) {
        res.status(500).send("Error toggling item selection: " + error.message);
    }
});

app.delete("/deleteItem/:listId/:itemId", async (req, res) => {
    const { listId, itemId } = req.params;

    try {
        const list = await ItemsModel.findById(listId); // Find the list by ID
        if (!list) {
            return res.status(404).send("List not found");
        }
        
        // Find the item index using the itemId
        const itemIndex = list.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).send("Item not found in list");
        }

        // Remove the item from the array
        list.items.splice(itemIndex, 1);

        // Save the updated list
        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        res.status(500).send("Error deleting item: " + error.message);
    }
});

app.patch("/updateListName/:listId", async (req, res) => {
    const { listId } = req.params;
    const { listName } = req.body; // Get the new list name from the request body

    try {
        const updatedList = await ItemsModel.findByIdAndUpdate(
            listId,
            { $set: { listName: listName } },
            { new: true, runValidators: true }
        );

        if (!updatedList) {
            return res.status(404).send("List not found");
        }

        res.json(updatedList);
    } catch (error) {
        res.status(500).send("Error updating list name: " + error.message);
    }
});





app.listen(3001, () => console.log("Server started on port 3001"));
//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// const date = require(__dirname + "/date.js");

const app = express();
let items = [];
let workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todo-list"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name:String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else{
                    console.log("Successfull insertions");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle: "Today", newListItems: foundItems});
        }
    });
});


app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function (err, foundList) {
        if(!err){
            if(!foundList){
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //show an existing list
                res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
            }
        }
    });


});


// app.get("/", function(req, res){

//     let today = new Date();
    
//     let options = {
//     weekday:'long',
//     day: 'numeric',
//     month: 'long'

//     };

//     let day = today.toLocaleDateString("en-US", options);


// });


app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({
        name: itemName
    });

    if(listname === "Today"){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});


    // if(req.body.list === "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }

    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }



app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successful delete checked");
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }            
        }); 
    }
    
});


// Item.deleteOne({_id: "637011215471d34654256026"}, function(err){
//     if(err){
//         console.log(err);
//     } else{
//         console.log("succesfull deletion");
//     }
// })


// app.get("/work", function(req,res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.post("/work", function(req,res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

app.get("/about", function(req, res){
    res.render("about");
  });
  

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});



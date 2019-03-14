var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

function showItems() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price);
            console.log("----------------------------------------------------------");
        };
    });
};

function initialAsk() {
    showItems();

    inquirer.prompt([
        {
            type: 'input',
            message: "What is the ID of the item you would like to purchase?",
            name: "item_identity"
        },
        {
            type: 'input',
            message: 'What is the quantity of the item you would like to purchase?',
            name: 'item_quantity'
        }

    ]).then(function (answer) {
        var identity = answer.item_identity;
        var quantity = answer.item_quantity;
        // console.log(identity);
        // console.log(quantity);
        var query = "SELECT * FROM products WHERE ?";
        connection.query(query, { item_id: identity }, function (err, res) {
            if (err) throw err;
            // console.log(res);
            

            for (i = 0; i < res.length; i++) {
                // console.log("THIS IS IT: " + res[i].stock_quantity);
                stockQuantity = res[i].stock_quantity;
                newStockQuantity = stockQuantity - quantity;
                price= res[i].price;


                if (stockQuantity < quantity) {
                    console.log("Insufficient Quantity!")
                    break;
                } else {

                    // console.log("We've got something here...")
                    var sql = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                    connection.query(sql, [newStockQuantity, identity], function (err, res) {
                        if (err) throw err;
                        // console.log("You got that right!");
                        totalCost();
                    });
                };
           

                function totalCost() {
                    // multilpy quantity times price
                    var customerTotal = quantity * price;
                    // display total
                    console.log("--------------------------------");
                    console.log("Your total is: $" + customerTotal);
                };
            };
        });
    });
};




initialAsk();
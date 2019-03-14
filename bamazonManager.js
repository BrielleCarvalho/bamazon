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
    // console.log("connected as id " + connection.threadId);
});

function showItems() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log("#" + res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | $" + res[i].price + " | STOCK: " + res[i].stock_quantity);
            console.log("----------------------------------------------------------------------");
        };
    });
};

function initialAsk() {
    // showItems();

    inquirer.prompt([
        {
            type: 'list',
            message: "What would you like to do?",
            choices: ["View all items for sale", "View low inventory", "Add inventory", "Add new product"],
            name: "decision"
        }

    ]).then(function (answer) {
        var decision = answer.decision;
        console.log();

        if (decision === "View all items for sale") {
            showItems();
        }

        if (decision === "View low inventory") {
            connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN ? AND ?", [0, 2], function (err, res) {
                if (err) throw err;
                for (i = 0; i < res.length; i++) {
                    console.log("#" + res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | $" + res[i].price + " | STOCK: " + res[i].stock_quantity);
                }
            });
        };

        if (decision === "Add inventory") {
            showItems();

            inquirer.prompt([

                {
                    type: 'input',
                    message: "What is the ID of the item in which you'd like to add inventory?",
                    name: "item_identity"
                },
                {
                    type: 'input',
                    message: 'How many would you like to add?',
                    name: 'item_quantity'
                }

            ]).then(function (answer) {

                var identity = answer.item_identity;
                var quantity = answer.item_quantity;

                console.log(identity);
                console.log(quantity);
                var query = "SELECT * FROM products WHERE ?";
                connection.query(query, { item_id: identity }, function (err, res) {
                    if (err) throw err;
                    // console.log(res);


                    for (i = 0; i < res.length; i++) {
                        // console.log("THIS IS IT: " + res[i].stock_quantity);
                        var stockQuantity = res[i].stock_quantity;
                        stockQuantity = parseInt(stockQuantity) + parseInt(quantity);

                        // console.log("We've got something here...")
                        var sql = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                        connection.query(sql, [stockQuantity, identity], function (err, res) {
                            if (err) throw err;
                            // console.log("You got that right!");
                            showItems();
                        });


                    };
                });
            });
        };

        if (decision === "Add new product") {
            showItems();
            inquirer.prompt([
                {
                    type:"input",
                    message: "What ID would you like to give this item? (Suggest following numerical values that already exist)",
                    name: 'item_id'
                },
                {
                    type: 'input',
                    message: 'What is the name of the product you are adding?',
                    name: 'item_name'
                },
                {
                    type: 'input',
                    message: "What department does this item belong in?",
                    name: "item_department"
                },
                {
                    type: 'input',
                    message: "What will be the cost of this item?",
                    name: "item_cost"
                },
                {
                    type: 'input',
                    message: "How many do you have in stock?",
                    name: "item_quantity"
                }

            ]).then(function (answer) {
                var id = answer.item_id;
                var name = answer.item_name;
                var department = answer.item_department;
                var cost = answer.item_cost;
                var quantity = answer.item_quantity;

                var products = { item_id: id, product_name: name, department_name: department, price: cost, stock_quantity: quantity};
                
                connection.query('INSERT INTO products SET ?', products, function (err, res) {
                    if (err) throw err;
                    for(let i=0; i < res.length; i++){
                        console.log("#" + res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | $" + res[i].price + " | STOCK: " + res[i].stock_quantity);
                    };
                });

                showItems();
            });
        };
    });
};


initialAsk();
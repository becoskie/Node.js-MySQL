var inquirer = require("inquirer");
var figlet = require('figlet');
var chalk = require('chalk');
var Table = require('cli-table');
var colors = require('colors');
var mysql = require("mysql");
var cart = [];
var purchaseQuestions = [
    {
        type: "input",
        message: "Enter the id of the item",
        name: "id"
    },
    {
        type: "input",
        message: "How many?",
        name: "qty"
    }
];

var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 8889,
    // Your username
    user: "root",
    // Your password
    password: "root",
    database: "bamazon"
});

figlet('   Bamazon Fine   ', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(chalk.bgMagenta(data));
    tag();
});

showStore();



function tag() {
    console.log('\nOnly the Products You Need, Not What You Want.\n'.magenta);
    console.log("_____________________________________________________________\n".magenta);
}

function showStore() {
    var table = new Table({
        head: ['ID'.cyan, 'Product'.cyan, 'Department'.cyan, 'Description'.cyan, 'Price'.cyan, 'Qty'.cyan]
        , colWidths: [5, 30, 20, 50, 10, 5]
    });
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].department_name, res[i].description, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        inquirer.prompt(purchaseQuestions).then(answers => {
            addToCart(answers.id, answers.qty)
        });
    });
}


function addToCart(id, quantity) {
    var query = connection.query(`SELECT product_name, price, stock_quantity FROM products WHERE id=${id}`, function (err, res) {
        var item = res[0];
        if (item.stock_quantity > quantity) {
            var updateQty = item.stock_quantity - quantity;
            updateStock(id, updateQty);
            var total = quantity * item.price;
            cart.push(new CartItem(id, quantity, item.price, item.product_name, total));
        } else {
            console.log("Sorry, we don't have that may available.");
            customerControl();
        }
    });
}

function updateStock(id, quantity) {
    connection.query(`UPDATE products SET stock_quantity = ${quantity} WHERE id=${id}`, function (err, res) {
        console.log("Item added to cart".magenta);
        customerControl();
    });
}

function customerControl() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "Continue Shopping",
                "View Cart",
                "Check Out"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "Continue Shopping":
                    showStore();
                    break;

                case "View Cart":
                    viewCart();
                    break;

                case "Check Out":
                    rangeSearch();
                    break;
            }
        });

}

function CartItem(id, qty, price, name, total) {
    this.id = id;
    this.name = name;
    this.qty = qty;
    this.price = price;
    this.total = total;
}

function viewCart() {
    var table = new Table({
        head: ['ID'.cyan, 'Product'.cyan, 'Price'.cyan, 'Qty'.cyan, 'Total'.cyan]
        , colWidths: [5, 30, 10, 5, 10]
    });
    for (var i = 0; i < cart.length; i++) {
        table.push(
            [cart[i].id, cart[i].name, parseFloat(cart[i].price).toFixed(2), cart[i].qty, parseFloat(cart[i].total).toFixed(2)]
        );
    }
    console.log(table.toString());
}







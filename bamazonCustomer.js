var inquirer = require("inquirer");
var figlet = require('figlet');
var chalk = require('chalk');
var Table = require('cli-table');
var colors = require('colors');
var mysql = require("mysql");
var cart = [];
var prodAvail = [];
var purchaseQuestions = [
    {
        type: "input",
        message: "To add to your order enter the id of the item:".magenta.bold,
        name: "id",
        validate: validateName
    },
    {
        type: "input",
        message: "How many would you like?".magenta.bold,
        name: "qty",
        validate: validateName
    }
];

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

figlet('   Bamazon Fine   ', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log("\n \n");
    console.log(chalk.bgMagenta(data));
    tag();
});

showStore();


function validateName(name) {
    return name !== '';
}

function tag() {
    console.log('\n          We Keep Your Choices Low to Keep Your Prices Low!!.           \n\n'.white.bgMagenta.bold);
}

function showStore() {
    var table = new Table({
        head: ['ID'.white.bgMagenta, 'Product'.white.bgMagenta, 'Department'.white.bgMagenta, 'Description'.white.bgMagenta, 'Price'.white.bgMagenta, 'Qty'.white.bgMagenta]
        , colWidths: [5, 30, 20, 50, 10, 5]
    });
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].id, res[i].product_name, res[i].department_name, res[i].description, res[i].price.toFixed(2), res[i].stock_quantity]
            );
            prodAvail.push(res[i].id);
        }
        console.log(table.toString());
        inquirer.prompt(purchaseQuestions).then(answers => {
            addToCart(answers.id, answers.qty)
        });
    });
}


function addToCart(id, quantity) {
    if (prodAvail.includes(parseInt(id))) {
        checkStock(id, quantity);
    } else {
        console.log("Hold on there happy shopper, we only carry products you need, not what you want!".red.bold);
        customerControl();
    }
}

function checkStock(id, quantity) {
    var query = connection.query(`SELECT product_name, price, stock_quantity FROM products WHERE id=${id}`, function (err, res) {
        var item = res[0];
        if (item.stock_quantity >= quantity) {
            var updateQty = item.stock_quantity - quantity;
            updateStock(id, updateQty);
            var total = quantity * item.price;
            cart.push(new CartItem(id, quantity, item.price, item.product_name, total));
        } else {
            console.log("Sorry, we don't have that many available.".red.bold);
            customerControl();
        }
    });
}

function updateStock(id, quantity) {
    connection.query(`UPDATE products SET stock_quantity = ${quantity} WHERE id=${id}`, function (err, res) {
        console.log("\nAdded to cart!\n".white.bgMagenta);
        customerControl();
    });
}

function customerControl() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?".magenta.bold,
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
                    getCartTotal();
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
            [cart[i].id, cart[i].name, cart[i].price.toFixed(2), cart[i].qty, cart[i].total.toFixed(2)]
        );
    }
    console.log(table.toString());
    customerControl();
}


function getCartTotal() {
    var totalQty = [];
    var totalPrice = [];
    for (var i = 0; i < cart.length; i++) {
        totalQty.push(
            parseInt(cart[i].qty)
        );
        totalPrice.push(
            parseFloat(cart[i].total.toFixed(2))
        );
    }
    console.log(typeof totalPrice[0]);
    var table = new Table({
        head: ['Total Number of Items'.cyan, 'Total Cost'.cyan]
        , colWidths: [25, 15]
    });
    table.push(
        [totalQty.reduce((a, b) => a + parseFloat(b), 0), totalPrice.reduce((a, b) => a + parseFloat(b.toFixed(2)), 0)]
    );
    console.log(table.toString());
    console.log("\nThank you for shopping at Bamazon!!\n".white.bgMagenta);
}




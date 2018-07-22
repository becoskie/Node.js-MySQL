var inquirer = require("inquirer");
var figlet = require('figlet');
var chalk = require('chalk');
var mysql = require("mysql");
var questions = [
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


var figlet = require('figlet');

figlet('Bamazon Fresh', function (err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(chalk.bgMagentaBright(data));
    tag();
});
loadProducts();

function tag() {
    console.log(chalk.greenBright('Only the Personal Hygiene Products You Need, Not What You Want.'));
}

function loadProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(`id: ${res[i].id}\r
            Product: ${res[i].product_name}\r
            Department: ${res[i].department_name}\r
            Description: ${res[i].description}\r
            Price: ${parseFloat(res[i].price).toFixed(2)}\r
            Qty in stock: ${res[i].stock_quantity}
            `);
        }
        console.log("-----------------------------------");
        inquirer.prompt(questions).then(answers => {
            checkAvailability(answers.id, answers.qty)
        });
    });
}


function checkAvailability(id, quantity) {
    var query = connection.query(`SELECT stock_quantity FROM products WHERE id=${id}`, function (err, res) {
        if (res[0].stock_quantity > quantity) {
            console.log("Thank you for your purchase!");
        } else {
            console.log("Sorry, we don't have that may available.");
        }
    });
}

function updateStock(id, quantity) {

}







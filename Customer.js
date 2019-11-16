const inquirer = require('inquirer')
const mysql = require('mysql2')
const Table = require('../Bamazon/node_modules/cli-table2')
const app = require('../Bamazon/Customer.js')

// creates connection to MySql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'groot',
    database: 'bamazon_db'
})

connection.connect()

    let display = function() {
        connection.query("SELECT * FROM `products`",function (err,res){
            if(err) throw err;

            console.log('--------------------')
            console.log('      Welcome To Bamazon     ')
            console.log('--------------------')
            console.log('-------')
            console.log('Find your equipment below')
            console.log('-------')

            let table =  new Table({
                head: ['Product ID', 'Product Description', 'Cost'],
                colWidth: [12,50,8],
                colAligns:['center','left', 'right'],
                style: {
                    head: ["cornflowerblue"],
                    compact: true
                }            
            })
            for(let i = 0; i < res.length; i++){
                table.push([res[i].item_id,res[i].product_name, res[i].price])
            }
            console.log(table.toString())
            console.log('')
            shopping()
        })
        // newTable()
    }

let shopping = function() {
    inquirer.prompt({
        name: 'productsToBuy',
        type: 'input',
        message: 'Enter the Product ID of the item you would like to buy'
    }).then(function(answer1){
        let selection = answer1.productsToBuy;
        connection.query("SELECT * FROM products WHERE item_id = ?", selection, function(err,res){
            if(err) throw err;
            if(res.length === 0) {
                console.log('That product no longer exists. Please choose from the following products in the diagram above')

                shopping()
            }else {
                inquirer.prompt({
                    name: 'quantity',
                    type: 'input',
                    message: 'How many Items would you like to buy?'
                }).then(function(answer2){
                    let quantity = answer2.quantity;
                    if(quantity > res[0].stock_quantity){
                        console.log('Sorry, we only have ' + res[0].stock_quantity + 'items in stock')

                        shopping()
                    }else {
                        console.log('')
                        console.log(res[0].product_name  +  'purchased')
                        console.log( quantity  + 'unit at $' +  res[0].price)
                        console.log(res[0].stock_quantity)

                        const newQuantity = (res[0].stock_quantity - quantity);

                        connection.query("UPDATE products SET stock_quantity = " + newQuantity + "WHERE id =" + res[0].item_id, function(err, resUpdate) {
                            if(err) throw err;
                            console.log("Thank You for shopping with us!")
                            console.log("Your order is being processed and will be sent out to you")
                            connection.end()
                        })
                    }
                }).catch(e =>{
                    if(e){console.log(e)}
                })
            }
        })

    })

}
display();
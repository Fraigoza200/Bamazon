const inquire = require('inquirer')
const mysql = require('mysql2')
const table = require('cli-table2')

// creates connection to MySql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'groot',
    database: 'bamazon_db'
})

connection.connect()

    let display = function() {
        connection.query('SELECT * FROM products',(err,res)=>{
            if(err) throw err;

            console.log('--------------------')
            console.log('      Welcome To Bamazon     ')
            console.log('--------------------')
            console.log('-------')
            console.log('Find your equipment below')
            console.log('-------')

            let table = new Table({
                head: ['Product Id', 'Product Description', 'Cost'],
                colWidth: [12,50,8],
                colAligns:['center','left', 'right'],
                style: {
                    head: ["cornflowerblue"],
                    compact: true
                }            
            })
            for(let i = 0; i < res.length; i++){
                table.push([res[i].id,res[i].product_name, res[i].price])
            }
            console.log(table.toString())
            console.log('')
        })
    }

let shopping = function() {
    inquire.prompt({
        name: 'productsToBuy',
        type: 'input',
        message: 'Enter the Product ID of the item you would like to buy'
    }).then(function(answer1){

        let selection = answer.productToBuy
        connection.query('SELECT * FROM products WHERE =?',selection,function(err,res){
            if(err) throw err
            if(res.length ===0){
                console.log('Sorry, that item is not availabe. Please choose one of the following items that is displayed on the screen')

                shopping()
            }else {
                console.log('We are all good to go')
                inquirer.prompt({
                    name: 'quantity',
                    type: 'input',
                    message: 'How many products would you like to buy?'
                })
                .then(function(answer2){
                    let quantity = answer2.quantity
                    if(quantity > res[0].stock_quantity){
                        console.log('Sorry, we only have ' + res[0].stock_quantity + 'of the desired product')

                        shopping()
                    }else {
                        console.log(res[0].products_name + 'purchased')
                        console.log(quantity + 'qty at $' + res[0].price)

                        let newQuantity = res[0].stock_quantity - quantity 

                        connection.query('UPDATE products Set stock_quantity' + newQuantity + 'WHERE id = ' + res[0].id, function(err,resUpdate) {
                            if(err) throw err
                            console.log('')
                            console.log('Your Order is being Processed and will be sent to you')
                            console.log('Thank You for shopping with us. Please come again')
                            connection.end()
                        })
                    }
                })
            }
        })

    })
}

display();



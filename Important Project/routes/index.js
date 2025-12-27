const express = require('express');
const router = express.Router();
const db_config = require("./config");
const excel = require("exceljs");
const xlsx = require('xlsx');
var bodyParser = require('body-parser')
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const app = express();
const moment = require("moment");
const app_user_location = "eyJsYXQiOiIyMi44ODI2IiwibG9uZyI6IjczLjA5OTgiLCJwaW5jb2RlIjoiMzg4MDAxIiwiY2l0eSI6IkFuYW5kIiwiYWRkcmVzc19pZCI6bnVsbH0=";
const mpincode = "388001";
/* LOGI...N PAGE. */

router.get('/', function(req, res, next) {
    res.render('index', { title: '' });
});

// Dashboard
router.get('/dashboard', function(req, res, next) {
    res.render('dashboard');
});

// USERS
router.get('/user', function(req, res, next) {
    //  var user_type = req.query.type;
    var sql = "";
    var perPage = 10;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;
    sql = "SELECT count(*) as num FROM `users`  WHERE `otp_verify` = 1 AND `login_status` = 0 AND `order_count` <= 0";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
            sql = "SELECT * FROM `users`  WHERE `otp_verify` = 1 AND `login_status` = 0 AND `order_count` <= 0 Order BY id DESC LIMIT " + start + "," + perPage;
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            res.render('user_list', {
                data: result,
                current: page,
                total: count,
                pages: Math.ceil(count / perPage)
            });
        }
    });
        }
    });

    
});

// Used
router.get('/used_user', function(req, res, next) {
    //  var user_type = req.query.type;
    var sql = "";
    var perPage = 10;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;
    sql = "SELECT count(*) as num FROM `users` WHERE `order_count` > 0";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
            sql = "SELECT * FROM `users` WHERE `reffer_code` = 'RJJBA7404569' OR `my_refer_code` = 'RJJBA7404569' LIMIT " + start + "," + perPage;
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR ...");
                } else {
                    res.render('used_user', {
                        data: result,
                        current: page,
                        total: count,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        }
    });

   
});


// Suspended USERS
router.get('/suspended_user', function(req, res, next) {
    //  var user_type = req.query.type;
    var sql = "";
    var perPage = 10;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;
    sql = "SELECT count(*) as num FROM `users`  WHERE  `login_status` = 1 OR `reffer_code` = 'REFERRAL_ALREADY_EXISTS'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
            sql = "SELECT * FROM `users`  WHERE `login_status` = 1 OR `reffer_code` = 'REFERRAL_ALREADY_EXISTS' LIMIT " + start + "," + perPage;
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR ...");
                } else {
                    res.render('suspended_user', {
                        data: result,
                        current: page,
                        total: count,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        }
    });

   
});

// Not Verify USERS
router.get('/invalid_user', function(req, res, next) {
    //  var user_type = req.query.type;
    var sql = "";
    var perPage = 25;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;
    sql = "SELECT count(*) as num FROM `users` where otp_verify = 0 AND `reffer_code` != 'REFERRAL_ALREADY_EXISTS';";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
            sql = "SELECT * FROM `users` where otp_verify = 0 AND `reffer_code` != 'REFERRAL_ALREADY_EXISTS' LIMIT " + start + "," + perPage;
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            res.render('invalid_user_list', {
                data: result,
                current: page,
                total: count,
                pages: Math.ceil(count / perPage)
            });
        }
    });
        }
    });

    
});

// order_list
router.get('/order_list', function(req, res, next) {
    var sql = "SELECT * FROM `orders` ORDER BY `orders`.`id` DESC";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            console.log(">>>>" + result.length);
            res.render('order_list', { "data": result });
        }
    });
});

// CREATE-ORDERS-BY-USER
router.get('/create_user_order', function(req, res, next) {

 setInterval(function() {
    var sql = "SELECT cards.id as cards_id,cards.*,users.* FROM `cards` LEFT JOIN users ON cards.user_id = users.user_id WHERE cards.status = 0 AND cards.user_id != 0 LIMIT 1;";  
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            if (result.length > 0) {
               
                var user_id = result[0].user_id;
                var product_id = result[0].product_id; 
                var card_id = result[0].cards_id;  

                var order_mobile = result[0].order_mobile;
                var address_line_1 = result[0].address;
                var address_line_2 = result[0].landmark;
                var pin_code = result[0].pincode;
                var name = result[0].name;
                var city = result[0].city;

                var qty = result[0].qty;
                              
                console.log(">>>>>>> Order Started >>"+user_id+" >> " +product_id+" >> " +card_id);  
                var sql = "UPDATE `cards` SET `status`='3' WHERE `id` = '" + card_id + "'";
                db_config.query(sql, (err, result) => {
                    addAddress(product_id,qty,user_id,order_mobile,address_line_1,address_line_2,pin_code,name,city,card_id,res); 
                });
                
            }
        }
    });
 }, 5000);
});

function addAddress(product_id,qty,user_id,order_mobile,address_line_1,address_line_2,pin_code,name,city,card_id,res)
{   
    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR");
                } else {        
                    var qs = require('qs');

                    var xo = result[0].xo;
                    var device_id = result[0].device_id;
                    var mobile = "+91" + result[0].mobile;
                    var axios = require('axios');
                    var u_token = Buffer.from("+91" + mobile).toString('base64');
        
                    //DELETE CART PRODUCT
                    var axios = require("axios").default;
                    var data = { "context": "cart", "identifier": "default", "cart_session": "", "dest_pin": null, "address_id": null, "customerAmount": null, "payment_modes": null, "replaceable": null, "item": null, "payment_instrument": null, "bank_offers": null, "user_id": user_id };
                    var options = {
                        method: 'POST',
                        url: 'https://prod.meeshoapi.com/api/8.0/cart',
                        headers: {
                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                            'app-version': '14.0',
                            'app-version-code': '436',
                            'instance-id': device_id,
                            'country-iso': 'in',
                            'application-id': 'com.meesho.supply',
                            'app-sdk-version': '25',
                            'app-client-id': 'android',
                            'xo': xo,
                            'app-iso-language-code': 'en',
                            'app-user-id': user_id,
                            'u-token': u_token,
                            'app-user-location': app_user_location,
                            'content-type': 'application/json; charset=UTF-8',
                            'accept-encoding': 'gzip',
                            'user-agent': 'okhttp/4.9.0'
                        },
                        data: data
                    };
        
                    axios.request(options).then(function(response) {
                        //console.log(response.data);
                        var cart_session = response.data['cart_session'];
                        var json_data = response.data.result;

                       // console.log(">>>>"+JSON.stringify(json_data));
                        for (let j = 0; j < json_data.splits.length; j++) {
                            var products = json_data.splits[j].products
                            for (let k = 0; k < products.length; k++) {
                                var identifier = products[k].identifier
        
                                var mdata = {
                                    "identifier": "default",
                                    "cart_session": cart_session,
                                    "items": [identifier],
                                    "context": "cart",
                                    "user_id": user_id
                                }
                                console.log(identifier);
                                var axios = require("axios").default;
                                var options = {
                                    method: 'POST',
                                    url: 'https://prod.meeshoapi.com/api/1.0/cart/remove',
                                    headers: {
                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                        'app-version': '14.0',
                                        'app-version-code': '436',
                                        'instance-id': device_id,
                                        'country-iso': 'in',
                                        'application-id': 'com.meesho.supply',
                                        'app-sdk-version': '25',
                                        'app-client-id': 'android',
                                        'xo': xo,
                                        'app-iso-language-code': 'en',
                                        'app-user-id': user_id,
                                        'u-token': u_token,
                                        'app-user-location': app_user_location,
                                        'content-type': 'application/json; charset=UTF-8',
                                        'accept-encoding': 'gzip',
                                        'user-agent': 'okhttp/4.9.0'
                                    },
                                    data: mdata
                                };
        
                                axios.request(options).then(function(response) {
                                    console.log(response.data);
                                }).catch(function(error) {
                                    console.error(error);
                                });
                            }
                        }

                        setTimeout(function () { 
                            var axios = require("axios").default;
                            //SEARCH PRODUCT
                            var data = { "id": product_id, "context": "search", "context_value": product_id, "ad_active": false, "include_catalog": true, "user_id": user_id };
            
                            var config = {
                                method: 'post',
                                url: 'https://prod.meeshoapi.com/api/2.0/product',
                                headers: {
                                    'accept-encoding': 'gzip',
                                    'app-client-id': 'android',
                                    'app-iso-language-code': 'en',
                                    'app-sdk-version': '25',
                                    'instance-id': device_id,
                                    'app-user-id': user_id,
                                    'app-user-location': app_user_location,
                                    'app-version': '14.0',
                                    'app-version-code': '436',
                                    'application-id': 'com.meesho.supply',
                                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                                    'connection': 'Keep-Alive',
                                    'content-type': 'application/json; charset=UTF-8',
                                    'country-iso': 'in',
                                    'host': 'prod.meeshoapi.com',
                                    'u-token': u_token,
                                    'user-agent': 'okhttp/4.9.0',
                                    'xo': xo
                                },
                                data: data
                            };
                            axios(config)
                                .then(function(response) {
                                    var supplier_id = response.data['product']['suppliers'][0]['id'];
                                    var variations = response.data['product']['suppliers'][0]['variations'][0];
                                   // console.log(JSON.stringify(supplier_id));
            
                                    var data = {
                                        "context": "pdp",
                                        "identifier": "default",
                                        "cart_session": null,
                                        "replaceable": false,
                                        "items": [{
                                                "identifier": "default",
                                                "product_id": product_id,
                                                "supplier_id": supplier_id,
                                                "variation": variations,
                                                "quantity": qty,
                                                "selected_price_type_id": "premium_return_price"
                                            }
                                            //For extra discount basic_return_price
                                        ],
                                        "user_id": user_id
                                    };
                                    // ADD TO CART
                                    const options = {
                                        method: 'POST',
                                        url: 'https://prod.meeshoapi.com/api/1.0/cart/add',
                                        headers: {
                                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                                            'app-version': '14.0',
                                            'app-version-code': '436',
                                            'instance-id': device_id,
                                            'country-iso': 'in',
                                            'application-id': 'com.meesho.supply',
                                            'app-sdk-version': '25',
                                            'app-client-id': 'android',
                                            'xo': xo,
                                            'app-iso-language-code': 'en',
                                            'app-user-id': user_id,
                                            'u-token': u_token,
                                            'app-user-location': app_user_location,
                                            'content-type': 'application/json; charset=UTF-8',
                                            'host': 'prod.meeshoapi.com',
                                            'connection': 'Keep-Alive',
                                            'accept-encoding': 'gzip',
                                            'user-agent': 'okhttp/4.9.0'
                                        },
                                        data: data
                                    };
            
                                    axios.request(options).then(function(response) {
                                        //console.log(response.data);
                                        //cart_session
                                        var cart_session = response.data['cart_session'];
                                        var data = { "pincode": pin_code, "context": "main", "user_id": user_id };
            
                                        var config = {
                                            method: 'post',
                                            url: 'https://prod.meeshoapi.com/api/1.0/user/delivery-location',
                                            headers: {
                                                'accept-encoding': 'gzip',
                                                'app-client-id': 'android',
                                                'app-iso-language-code': 'en',
                                                'app-sdk-version': '25',
                                                'app-user-id': user_id,
                                                'app-user-location': app_user_location,
                                                'app-version': '14.0',
                                                'app-version-code': '436',
                                                'application-id': 'com.meesho.supply',
                                                'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                'connection': 'Keep-Alive',
                                                'content-type': 'application/json; charset=UTF-8',
                                                'country-iso': 'in',
                                                'host': 'prod.meeshoapi.com',
                                                'instance-id': device_id,
                                                'u-token': u_token,
                                                'user-agent': 'okhttp/4.9.0',
                                                'xo': xo
                                            },
                                            data: data
                                        };
            
                                        axios(config)
                                            .then(function(response) {
                                             //   console.log(">>>> 07"+JSON.stringify(response.data));
                                                // GET USER DETAILS
                                                var data = {
                                                    "actions": ["paymentPage"],
                                                    "cod_enabled": false,
                                                    "identifier": "default",
                                                    "user_id": user_id
                                                };
            
                                                var config = {
                                                    method: 'post',
                                                    url: 'https://prod.meeshoapi.com/api/1.0/payments/user-details',
                                                    headers: {
                                                        'accept-encoding': 'gzip',
                                                        'app-client-id': 'android',
                                                        'app-iso-language-code': 'en',
                                                        'app-sdk-version': '25',
                                                        'app-user-id': user_id,
                                                        'app-user-location': app_user_location,
                                                        'app-version': '14.0',
                                                        'app-version-code': '436',
                                                        'application-id': 'com.meesho.supply',
                                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                        'connection': 'Keep-Alive',
                                                        'content-type': 'application/json; charset=UTF-8',
                                                        'country-iso': 'in',
                                                        'host': 'prod.meeshoapi.com',
                                                        'instance-id': device_id,
                                                        'u-token': u_token,
                                                        'user-agent': 'okhttp/4.9.0',
                                                        'xo': xo
                                                    },
                                                    data: data
                                                };
            
                                                axios(config)
                                                    .then(function(response) {
                                                     //   console.log(">>>> 06"+JSON.stringify(response.data));
                                                        // Add Address
                                                        var data = {
                                                            "check_pin": false,
                                                            "landmark": "",
                                                            "pin": pin_code,
                                                            "mobile": order_mobile,
                                                            "address_line_1": address_line_1,
                                                            "city": city,
                                                            "name": name,
                                                            "state": "Gujarat",
                                                            "address_line_2": address_line_2,
                                                            "country_id": 1,
                                                            "address_type": "Home",
                                                            "user_id": user_id
                                                        };
            
                                                        const config = {
                                                            method: 'POST',
                                                            url: 'https://prod.meeshoapi.com/api/2.0/addresses',
                                                            params: { context: 'cart', cart_identifier: 'default' },
                                                            headers: {
                                                                'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                'app-version': '14.0',
                                                                'app-version-code': '436',
                                                                'country-iso': 'in',
                                                                'application-id': 'com.meesho.supply',
                                                                'app-sdk-version': '25',
                                                                'app-client-id': 'android',
                                                                'xo': xo,
                                                                'app-iso-language-code': 'en',
                                                                'app-user-id': user_id,
                                                                'instance-id': device_id,
                                                                'u-token': u_token,
                                                                'app-user-location': app_user_location,
                                                                'content-type': 'application/json; charset=UTF-8',
                                                                'host': 'prod.meeshoapi.com',
                                                                'connection': 'Keep-Alive',
                                                                'accept-encoding': 'gzip',
                                                                'user-agent': 'okhttp/4.9.0'
                                                            },
                                                            data: data
                                                        };
            
                                                        axios(config)
                                                            .then(function(response) {
                                                                // LOCATION
                                                                var address_id = response.data['address']['id'];
                                                                var data = {
                                                                    "context": "address",
                                                                    "identifier": "default",
                                                                    "cart_session": cart_session,
                                                                    "dest_pin": pin_code,
                                                                    "address_id": address_id,
                                                                    "customerAmount": null,
                                                                    "payment_modes": null,
                                                                    "replaceable": null,
                                                                    "item": null,
                                                                    "payment_instrument": null,
                                                                    "bank_offers": null,
                                                                    "user_id": user_id
                                                                };
            
                                                                const options = {
                                                                    method: 'POST',
                                                                    url: 'https://prod.meeshoapi.com/api/1.0/cart/location',
                                                                    headers: {
                                                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                        'app-version': '14.0',
                                                                        'app-version-code': '436',
                                                                        'country-iso': 'in',
                                                                        'application-id': 'com.meesho.supply',
                                                                        'app-sdk-version': '25',
                                                                        'app-client-id': 'android',
                                                                        'xo': xo,
                                                                        'instance-id': device_id,
                                                                        'app-iso-language-code': 'en',
                                                                        'app-user-id': user_id,
                                                                        'u-token': u_token,
                                                                        'app-user-location': app_user_location,
                                                                        'content-type': 'application/json; charset=UTF-8',
                                                                        'host': 'prod.meeshoapi.com',
                                                                        'connection': 'Keep-Alive',
                                                                        'accept-encoding': 'gzip',
                                                                        'user-agent': 'okhttp/4.9.0'
                                                                    },
                                                                    data: data
                                                                };
            
                                                                axios.request(options).then(function(response) {
                                                             //       console.log(">>>> 05"+JSON.stringify(response.data));
                                                                    var cart_session = response.data['cart_session'];
                                                                    //PAYMENT INFO
                                                                    var data = {
                                                                        "context": "payment",
                                                                        "identifier": "default",
                                                                        "cart_session": cart_session,
                                                                        "dest_pin": null,
                                                                        "address_id": null,
                                                                        "customerAmount": null,
                                                                        "payment_modes": ["juspay"],
                                                                        "replaceable": false,
                                                                        "item": null,
                                                                        "payment_instrument": { "payment_method_type": "CARD", "payment_method": "HDFC Credit Card", "payment_card_type": "", "payment_card_issuer": "HDFC Credit Card" },
                                                                        "bank_offers": null,
                                                                        "user_id": user_id
                                                                    };
                                                                   
                                                                    const options = {
                                                                        method: 'POST',
                                                                        url: 'https://prod.meeshoapi.com/api/1.0/cart/paymentinfo',
                                                                        headers: {
                                                                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                            'app-version': '14.0',
                                                                            'app-version-code': '436',
                                                                            'country-iso': 'in',
                                                                            'application-id': 'com.meesho.supply',
                                                                            'app-sdk-version': '25',
                                                                            'app-client-id': 'android',
                                                                            'xo': xo,
                                                                            'instance-id': device_id,
                                                                            'app-iso-language-code': 'en',
                                                                            'app-user-id': user_id,
                                                                            'u-token': u_token,
                                                                            'app-user-location': app_user_location,
                                                                            'content-type': 'application/json; charset=UTF-8',
                                                                            'host': 'prod.meeshoapi.com',
                                                                            'connection': 'Keep-Alive',
                                                                            'accept-encoding': 'gzip',
                                                                            'user-agent': 'okhttp/4.9.0'
                                                                        },
                                                                        data: data
                                                                    };
            
                                                                    axios.request(options).then(function(response) {
                                                                  //      console.log(">>>> 04"+JSON.stringify(response.data));
                                                                        //GET SUMMERY    
                                                                        var cart_session = response.data['cart_session'];
                                                                        var data = {
                                                                            "context": "summary",
                                                                            "identifier": "default",
                                                                            "cart_session": cart_session,
                                                                            "dest_pin": pin_code,
                                                                            "address_id": null,
                                                                            "customerAmount": null,
                                                                            "payment_modes": null,
                                                                            "replaceable": false,
                                                                            "item": null,
                                                                            "payment_instrument": null,
                                                                            "bank_offers": null,
                                                                            "user_id": user_id
                                                                        };
                                                                        const options = {
                                                                            method: 'POST',
                                                                            url: 'https://prod.meeshoapi.com/api/8.0/cart',
                                                                            headers: {
                                                                                'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                                'app-version': '14.0',
                                                                                'app-version-code': '436',
                                                                                'country-iso': 'in',
                                                                                'application-id': 'com.meesho.supply',
                                                                                'app-sdk-version': '25',
                                                                                'app-client-id': 'android',
                                                                                'xo': xo,
                                                                                'instance-id': device_id,
                                                                                'app-iso-language-code': 'en',
                                                                                'app-user-id': user_id,
                                                                                'u-token': u_token,
                                                                                'app-user-location': app_user_location,
                                                                                'content-type': 'application/json; charset=UTF-8',
                                                                                'host': 'prod.meeshoapi.com',
                                                                                'connection': 'Keep-Alive',
                                                                                'accept-encoding': 'gzip',
                                                                                'user-agent': 'okhttp/4.9.0'
                                                                            },
                                                                            data: data
                                                                        };
            
                                                                        axios.request(options).then(function(response) {
                                                                     //       console.log(">>>> 03"+JSON.stringify(response.data));
                                                                            var cart_session = response.data['cart_session'];
                                                                            var sender_id = response.data['result']['default_sender']['id'];
                                                                            var effective_total = response.data['result']['effective_total'];
                                                                            var discount_amount = response.data['result']['price_detail_banner_info']['amount'];
                                                                            var data = {
                                                                                    "identifier": "default",
                                                                                    "cart_session": cart_session,
                                                                                    "is_selling_to_customer": false,
                                                                                    "enable_price_unbundling": true,
                                                                                    "address_id": address_id,
                                                                                    "sender_id": sender_id,
                                                                                    "customer_amount": effective_total,
                                                                                    "user_id": user_id
                                                                                }
                                                                                //Pre Order
                                                                            const options = {
                                                                                method: 'POST',
                                                                                url: 'https://prod.meeshoapi.com/api/4.0/preorders',
                                                                                headers: {
                                                                                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                                    'app-version': '14.0',
                                                                                    'app-version-code': '436',
                                                                                    'country-iso': 'in',
                                                                                    'application-id': 'com.meesho.supply',
                                                                                    'app-sdk-version': '25',
                                                                                    'app-client-id': 'android',
                                                                                    'xo': xo,
                                                                                    'instance-id': device_id,
                                                                                    'app-iso-language-code': 'en',
                                                                                    'app-user-id': user_id,
                                                                                    'u-token': u_token,
                                                                                    'app-user-location': app_user_location,
                                                                                    'content-type': 'application/json; charset=UTF-8',
                                                                                    'host': 'prod.meeshoapi.com',
                                                                                    'connection': 'Keep-Alive',
                                                                                    'accept-encoding': 'gzip',
                                                                                    'user-agent': 'okhttp/4.9.0'
                                                                                },
                                                                                data: data
                                                                            };
            
                                                                            axios.request(options).then(function(response) {
                                                                      //          console.log(">>>> 01 "+JSON.stringify(response.data));
                                                                                var success = response.data['success'];
                                                                                if (success == true) {
                                                                                    var order_num = response.data['order_num'];
                                                                                    var signature = response.data['juspay_transaction_params']['signature'];
                                                                                    var orderDetails = JSON.parse(response.data['juspay_transaction_params']['orderDetails']);
                                                                                    var order_id = orderDetails['order_id'];
                                                                                   // console.log(order_num + " >> " + signature + " >> " + orderDetails + " >> " + order_id);
            
                                                                                    var msql = "SELECT * FROM `cards` WHERE `id` = "+card_id;
                                                                                    db_config.query(msql, (err, result) => {
                                                                                        var card_number =  result[0].cards_number;
                                                                                        card_number = card_number.replace(" ","");
                                                                                        var month =  result[0].month;
                                                                                        var year =  result[0].year;
                                                                                        var cvv =  result[0].cvv;
                                                                                        var pin =  result[0].pin;
    
                                                                                        var data = qs.stringify({
                                                                                            'signature': signature,
                                                                                            'save_to_locker': 'true',
                                                                                            'redirect_after_payment': 'true',
                                                                                            'payment_method_type': 'CARD',
                                                                                            'payment_method': '',
                                                                                            'payment_channel': 'ANDROID',
                                                                                            'order_id': order_id,
                                                                                            'order_details': JSON.stringify(orderDetails),
                                                                                            'offer_token': '',
                                                                                            'name_on_card': '',
                                                                                            'metadata': '{"retryMode":"RETRY","payment_channel":"ANDROID","microapp":"hyperpay"}',
                                                                                            'merchant_key_id': '9970',
                                                                                            'merchant_id': 'meesho',
                                                                                            'format': 'json',
                                                                                            'discountedAmount': discount_amount,
                                                                                            'card_security_code': cvv,
                                                                                            'card_number': card_number,
                                                                                            'card_exp_year': year,
                                                                                            'card_exp_month': month,
                                                                                            'add_merchant_return_url': 'true'
                                                                                        });
    
                                                                                        var config = {
                                                                                            method: 'post',
                                                                                            url: 'https://api.juspay.in/txns',
                                                                                            headers: {
                                                                                                'accept-encoding': 'gzip',
                                                                                                'accept-language': 'en-US,en;q=0.5',
                                                                                                'cache-control': 'no-cache',
                                                                                                'connection': 'Keep-Alive',
                                                                                                'content-type': 'application/x-www-form-urlencoded',
                                                                                                'host': 'api.juspay.in',
                                                                                                'sdk-app-name': 'Meesho',
                                                                                                'sdk-app-version': '13.9.1',
                                                                                                'sdk-client-id': 'meesho_android',
                                                                                                'sdk-godel-build-version': 'rc.03',
                                                                                                'sdk-godel-remotes-version': '2.0rc1',
                                                                                                'sdk-godel-version': '2.1.4',
                                                                                                'sdk-os': 'ANDROID',
                                                                                                'sdk-os-version': '7.1.2',
                                                                                                'sdk-package-name': 'com.meesho.supply',
                                                                                                'sdk-user-agent': 'Mozilla/5.0 (Linux; Android 7.1.2; G011A Build/N2G48H; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.70 Mobile Safari/537.36',
                                                                                                'sdk-version-dotp': '2.0rc1_39',
                                                                                                'sdk-version-ec': '2.0rc1_268',
                                                                                                'sdk-version-ec-config': '1.0.25',
                                                                                                'sdk-version-flyer': '2.0.101',
                                                                                                'sdk-version-hyperos': '2.1.3',
                                                                                                'sdk-version-hyperos-config': '35989089660436714',
                                                                                                'sdk-version-hyperos-tracker': '2.0.34',
                                                                                                'sdk-version-hyperpay': '2.0rc1_430',
                                                                                                'sdk-version-hyperpay-configuration': '2.0.44',
                                                                                                'sdk-version-hyperpay-icons': '2.0.10',
                                                                                                'sdk-version-hyperpay-strings': '2.0.22',
                                                                                                'sdk-version-upiintent': '2.0rc1_47',
                                                                                                'sdk-version-upiintent-config': '2.0.120',
                                                                                                'user-agent': 'Dalvik/2.1.0 (Linux; U; Android 7.1.2; G011A Build/N2G48H)',
                                                                                                'x-jp-merchant-id': 'meesho',
                                                                                                'x-merchantid': 'meesho',
                                                                                                'x-powered-by': 'Juspay EC SDK for Android',
                                                                                                'x-session-id': '92a4bde4-efe4-42d6-9d49-60ce3e1f1507'
                                                                                            },
                                                                                            data: data
                                                                                        };
                
                                                                                        axios(config)
                                                                                            .then(function(response) {
                                                                              //                  console.log(">>>> 02 "+JSON.stringify(response.data));
                                                                                                var paymnet_url = response.data['payment']['authentication']['url'];
                                                                                                console.log("Payment Start : " + paymnet_url);
                                                                                               const webdriver = require('selenium-webdriver');
                                                                                                const chrome = require('selenium-webdriver/chrome');
                                                                                                const By = webdriver.By;
                                                                                                const until = webdriver.until;
                                                                                                const options = new chrome.Options();
                                                                                              //  options.addArguments('headless'); // note: without dashes
                                                                                              //  options.addArguments('disable-gpu')
                                                                                                var path = require('chromedriver').path;
                                                                                                //var service = new chrome.ServiceBuilder(path).build();
                                                                                                //    chrome.setDefaultService(service);
                                                                                                var driver = new webdriver.Builder()
                                                                                                    .forBrowser('chrome')
                                                                                                    .withCapabilities(webdriver.Capabilities.chrome())
                                                                                                    .setChromeOptions(options) // note this//
                                                                                                    .build();
                                                                                                driver.get(paymnet_url);
                
                                                                                                try{
                                                                                                    var click_me = driver.wait(until.elementLocated(By.id("securePay")));
                                                                                                    click_me.click();    
                                                                                                }catch (error) {
                                                                                                    console.error(error);
                                                                                                }
                                                                                                
                                                                                                var click_me = driver.wait(until.elementLocated(By.id("txtPassword")));
                                                                                                click_me.click();
                
                                                                                                var query = driver.wait(until.elementLocated(By.id("txtPassword")));
                                                                                                query.sendKeys(pin);

                                                                                                setTimeout(function () { 
                                                                                                var submit_btn = driver.wait(until.elementLocated(By.id("cmdSubmitStatic")));
                                                                                                submit_btn.click();
                
                                                                                                setTimeout(function() {
                                                                                                    console.log('Order Completed!');
                
                                                                                                    var axios = require("axios").default;
                                                                                                    var mdata = { "is_selling_to_customer": false, "pre_order_id": -1, "order_num": order_num, "user_id": user_id };
                                                                                                    var options = {
                                                                                                        method: 'POST',
                                                                                                        url: 'https://prod.meeshoapi.com/api/1.0/preorders/payments/status',
                                                                                                        headers: {
                                                                                                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                                                            'app-version': '14.0',
                                                                                                            'app-version-code': '436',
                                                                                                            'instance-id': device_id,
                                                                                                            'country-iso': 'in',
                                                                                                            'application-id': 'com.meesho.supply',
                                                                                                            'app-sdk-version': '25',
                                                                                                            'app-client-id': 'android',
                                                                                                            'xo': xo,
                                                                                                            'app-iso-language-code': 'en',
                                                                                                            'app-user-id': user_id,
                                                                                                            'u-token': u_token,
                                                                                                            'app-user-location': app_user_location,
                                                                                                            'content-type': 'application/json; charset=UTF-8',
                                                                                                            'accept-encoding': 'gzip',
                                                                                                            'user-agent': 'okhttp/4.9.0'
                                                                                                        },
                                                                                                        data: mdata
                                                                                                    };
                
                                                                                                    axios.request(options).then(function(response) {
                                                                                           //             console.log(">>>>" + JSON.stringify(response.data));
                                                                                                       
                                                                                                        var axios = require("axios").default;
                                                                                                        var mdata = { "is_selling_to_customer": false, "pre_order_id": -1, "order_num": order_num, "user_id": user_id };
                                                                                                        var options = {
                                                                                                            method: 'POST',
                                                                                                            url: 'https://prod.meeshoapi.com/api/3.0/order',
                                                                                                            headers: {
                                                                                                                'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                                                                'app-version': '14.0',
                                                                                                                'app-version-code': '436',
                                                                                                                'instance-id': device_id,
                                                                                                                'country-iso': 'in',
                                                                                                                'application-id': 'com.meesho.supply',
                                                                                                                'app-sdk-version': '25',
                                                                                                                'app-client-id': 'android',
                                                                                                                'xo': xo,
                                                                                                                'app-iso-language-code': 'en',
                                                                                                                'app-user-id': user_id,
                                                                                                                'u-token': u_token,
                                                                                                                'app-user-location': app_user_location,
                                                                                                                'content-type': 'application/json; charset=UTF-8',
                                                                                                                'accept-encoding': 'gzip',
                                                                                                                'user-agent': 'okhttp/4.9.0'
                                                                                                            },
                                                                                                            data: mdata
                                                                                                        };
                
                                                                                                        axios.request(options).then(function(response) {
                                                                                                            // console.log(response.data);        
                                                                                                            var json_data = response.data;
                
                                                                                                            var supplier_name = json_data.orders[0].supplier.name;
                                                                                                            var order_num = json_data.orders[0].order_num;
                                                                                                            var order_status = json_data.order_status;
                                                                                                            var order_status_message = json_data.order_status_message;
                                                                                                            var total_quantity = json_data.total_quantity;
                                                                                                            var effective_total = json_data.effective_total;
                                                                                                            var sub_orders_id = json_data.orders[0].order_details[0].sub_order_num;
                                                                                                            var delivery_details = json_data.orders[0].delivery_details.estimated_delivery_date;
                
                                                                                                            if(order_status=="ordered")
                                                                                                            {
                                                                                                                var sql = "UPDATE `cards` SET `status`='1' WHERE `id` = '" + card_id + "'";
                                                                                                                db_config.query(sql, (err, result) => {                                                                                                            
                                                                                                                });
                                                                                                            }else{
                                                                                                                var sql = "UPDATE `cards` SET `status`='2' WHERE `id` = '" + card_id + "'";
                                                                                                                db_config.query(sql, (err, result) => {                                                                                                            
                                                                                                                });
                                                                                                            }    

                                                                                                            var sql = "INSERT INTO `orders_status` (`id`, `supplier_name`, `order_num`, `order_status`, `order_status_message`, `total_quantity`, `effective_total`, `sub_orders_id`, `delivery_details`,`user_id`) VALUES (NULL, '" + supplier_name + "', '" + order_num + "', '" + order_status + "', '" + order_status_message + "', '" + total_quantity + "', '" + effective_total + "', '" + sub_orders_id + "', '" + delivery_details + "', '" + user_id + "');";
                                                                                                            console.log(" >>> " + sql);
                                                                                                            db_config.query(sql, (err, result) => {                                                                                                               
                                                                                                                var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
                                                                                                                db_config.query(sql, (err, result) => {
                                                                                                                    if (err) {
                                                                                                                        res.send("ERROR");
                                                                                                                    } else {
                                                                                                                        var xo = result[0].xo;
                                                                                                                        var device_id = result[0].device_id;
                                                                                                                        var mobile = "+91" + result[0].mobile;
                                                                                                            
                                                                                                                        var axios = require("axios").default;
                                                                                                                        var u_token = Buffer.from("+91" + mobile).toString('base64');
                                                                                                            
                                                                                                                        var data = { "limit": 20, "offset": 0, "order_status": 0, "user_id": user_id };
                                                                                                            
                                                                                                                        var options = {
                                                                                                                            method: 'POST',
                                                                                                                            url: 'https://prod.meeshoapi.com/api/2.0/user/orders',
                                                                                                                            headers: {
                                                                                                                                'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                                                                                'app-version': '14.0',
                                                                                                                                'app-version-code': '436',
                                                                                                                                'instance-id': device_id,
                                                                                                                                'country-iso': 'in',
                                                                                                                                'application-id': 'com.meesho.supply',
                                                                                                                                'app-sdk-version': '25',
                                                                                                                                'app-client-id': 'android',
                                                                                                                                'xo': xo,
                                                                                                                                'app-user-id': user_id,
                                                                                                                                'u-token': u_token,
                                                                                                                                'app-user-location': app_user_location,
                                                                                                                                'content-type': 'application/json; charset=UTF-8',
                                                                                                                                'accept-encoding': 'gzip',
                                                                                                                                'user-agent': 'okhttp/4.9.0'
                                                                                                                            },
                                                                                                                            data: data
                                                                                                                        };
                                                                                                            
                                                                                                                        axios.request(options).then(function(response) {
                                                                                                                            let order_count = response.data.order_list.length;
                                                                                                                            console.error(">>>" + order_count);
                                                                                                                            if (order_count > 0) {
                                                                                                                                var sql = "UPDATE `users` SET `is_order_place`='1',`order_count`='" + order_count + "' WHERE `user_id` = '" + user_id + "'";
                                                                                                                                db_config.query(sql, (err, result) => {});
                                                                                                                                console.error(">>>" + sql);  

                                                                                                                                driver.quit();
                                                                                                                               // return res.redirect('/new_task');  

                                                                                                                                //res.end();
                                                                                                                            }                                                                                                                          
                                                                                                                        }).catch(function(error) {
                                                                                                                            console.error(">>>" + error.response.data.error);
                                                                                                                        });  
                                                                                                                    }
                                                                                                                });
                                                                                                            });
                
                                                                                                        }).catch(function(error) {
                                                                                                            console.error(error);
                                                                                                        });
                
                                                                                                    }).catch(function(error) {
                                                                                                        console.error(error);
                                                                                                    });                        
                                                                                                }, 20000);
                                                                                            }, 2000);
                                                                                                //res.send("ORDER SUCESSFULL PLACED!"); 
                                                                                                //payment(paymnet_url);                        
                                                                                            })
                                                                                            .catch(function(error) {
                                                                                                console.log("ERROR_10" + error);
                                                                                            });
                                                                                    });                                                                                                                                                                       
                                                                                }            
                                                                            }).catch(function(error) {
                                                                                console.log(error)
                                                                            });
                                                                        }).catch(function(error) {
                                                                            console.error("ERROR_8");
                                                                        });
                                                                    }).catch(function(error) {
                                                                        console.error("ERROR_7");
                                                                    });
            
                                                                }).catch(function(error) {
                                                                    console.error("ERROR_6");
                                                                });
                                                            })
                                                            .catch(function(error) {
                                                                console.log("ERROR_5");
                                                            });
                                                    })
                                                    .catch(function(error) {
                                                        console.log("ERROR_4");
                                                    });
            
                                            })
                                            .catch(function(error) {
                                                console.log("ERROR_3");
                                            });
            
                                    }).catch(function(error) {
                                        console.log("ERROR_2");
                                    });        
                                })
                                .catch(function(error) {
                                    console.log("ERROR_1");
                                });                
                        }, 2000);
                               
                    }).catch(function(error) {
                        console.error(error);
                    });
        
                }
            });
}

// Renew XO
router.get('/renew_xo', function(req, res, next) {

    var sql = "SELECT * FROM `users` WHERE `otp_verify` = 1";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {

            for (let i = 0; i < result.length; i++) {
                var xoox = JSON.parse(result[i].xoox);
                var xo = xoox.xo;
                var ox = xoox.ox;
                var device_id = result[i].device_id;
                var mobile = "+91" + result[i].mobile;
                var user_id = result[i].user_id;
                var u_token = Buffer.from("+91" + mobile).toString('base64');

                var axios = require("axios").default;
                var mdata = {
                    "ox": ox,
                    "user_id": user_id
                };
                var options = {
                    method: 'POST',
                    url: 'https://prod.meeshoapi.com/api/2.0/xo',
                    headers: {
                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                        'app-version': '14.0',
                        'app-version-code': '436',
                        'instance-id': device_id,
                        'country-iso': 'in',
                        'application-id': 'com.meesho.supply',
                        'app-sdk-version': '25',
                        'app-client-id': 'android',
                        'xo': xo,
                        'app-user-id': user_id,
                        'u-token': u_token,
                        'app-user-location': app_user_location,
                        'content-type': 'application/json; charset=UTF-8',
                        'accept-encoding': 'gzip',
                        'user-agent': 'okhttp/4.9.0'
                    },
                    data: mdata
                };

                axios.request(options).then(function(response) {
                    var json_data = response.data;
                    var xoox = JSON.stringify(json_data.xoox);
                    var xo = json_data.xoox.xo;
                    var not_xoox = JSON.stringify(json_data.not_xoox);

                    var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='1',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE user_id='" + user_id + "'";
                    db_config.query(sql, (err, result) => {});

                }).catch(function(error) {
                    console.error(error);
                });

                var j = i + 1;
                if (j == result.length) {
                    console.log(">>>" + j);
                    return res.redirect('/user');
                }
            }
        }
    });
});

// Renew user XO//
router.get('/renew_user_xo', function(req, res, next) {
    var user_id = req.query.user_id;
    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {

            for (let i = 0; i < result.length; i++) {
                var xoox = JSON.parse(result[i].xoox);
                var xo = xoox.xo;
                var ox = xoox.ox;
                var device_id = result[i].device_id;
                var mobile = "+91" + result[i].mobile;
                var user_id = result[i].user_id;
                var u_token = Buffer.from("+91" + mobile).toString('base64');

                var axios = require("axios").default;
                var mdata = {
                    "ox": ox,
                    "user_id": user_id
                };
                var options = {
                    method: 'POST',
                    url: 'https://prod.meeshoapi.com/api/2.0/xo',
                    headers: {
                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                        'app-version': '14.0',
                        'app-version-code': '436',
                        'instance-id': device_id,
                        'country-iso': 'in',
                        'application-id': 'com.meesho.supply',
                        'app-sdk-version': '25',
                        'app-client-id': 'android',
                        'xo': xo,
                        'app-user-id': user_id,
                        'u-token': u_token,
                        'app-user-location': app_user_location,
                        'content-type': 'application/json; charset=UTF-8',
                        'accept-encoding': 'gzip',
                        'user-agent': 'okhttp/4.9.0'
                    },
                    data: mdata
                };

                axios.request(options).then(function(response) {
                    var json_data = response.data;
                    var xoox = JSON.stringify(json_data.xoox);
                    var xo = json_data.xoox.xo;
                    var not_xoox = JSON.stringify(json_data.not_xoox);

                    var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='1',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE user_id='" + user_id + "'";
                    db_config.query(sql, (err, result) => {});

                }).catch(function(error) {
                    console.error(error);
                });

                var j = i + 1;
                if (j == result.length) {
                    console.log(">>>" + j);
                    return res.redirect('/user');
                }
            }
        }
    });
});

// DELETE ACCOUNT
router.get('/delete_account', function(req, res, next) {
    var user_id = req.query.user_id;

    var sql = "DELETE FROM `users` WHERE `id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            return res.redirect("user?type=0");
        }
    });
});

// ORDERS
router.get('/order', function(req, res, next) {
    var user_id = req.query.user_id;

    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            var xo = result[0].xo;
            var device_id = result[0].device_id;
            var mobile = "+91" + result[0].mobile;

            var axios = require("axios").default;
            var u_token = Buffer.from("+91" + mobile).toString('base64');

            var data = { "limit": 20, "offset": 0, "order_status": 0, "user_id": user_id };

            var options = {
                method: 'POST',
                url: 'https://prod.meeshoapi.com/api/2.0/user/orders',
                headers: {
                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                    'app-version': '14.0',
                    'app-version-code': '436',
                    'instance-id': device_id,
                    'country-iso': 'in',
                    'application-id': 'com.meesho.supply',
                    'app-sdk-version': '25',
                    'app-client-id': 'android',
                    'xo': xo,
                    'app-user-id': user_id,
                    'u-token': u_token,
                    'app-user-location': app_user_location,
                    'content-type': 'application/json; charset=UTF-8',
                    'accept-encoding': 'gzip',
                    'user-agent': 'okhttp/4.9.0'
                },
                data: data
            };

            axios.request(options).then(function(response) {
                let order_count = response.data.order_list.length;
                console.error(">>>" + order_count);
                if (order_count > 0) {
                    var sql = "UPDATE `users` SET `is_order_place`='1',`order_count`='" + order_count + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                    console.error(">>>" + sql);
                }
                res.render('orders', response.data);
            }).catch(function(error) {
                console.error(">>>" + error.response.data.error);
            });


        }
    });
});

// Refar Amount
router.get('/refar_amount', function(req, res, next) {
    var refer_code = req.query.user_id;

    var sql = "SELECT * FROM `users` WHERE `my_refer_code` like '" + refer_code + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            var xo = result[0].xo;
            var device_id = result[0].device_id;
            var user_id = result[0].user_id;
            var mobile = "+91" + result[0].mobile;

            var axios = require("axios").default;
            var u_token = Buffer.from("+91" + mobile).toString('base64');

            var options = {
                method: 'GET',
                url: 'https://prod.meeshoapi.com/api/2.0/referral-program/commissions',
                params: { type: 'pendingV2', limit: '20', offset: '0' },
                headers: {
                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                    'app-version': '14.6.1-beta',
                    'app-version-code': '457',
                    'instance-id': device_id,
                    'country-iso': 'in',
                    'application-id': 'com.meesho.supply',
                    'app-sdk-version': '25',
                    'app-client-id': 'android',
                    'xo': xo,
                    'app-iso-language-code': 'en',
                    'app-user-id': user_id,
                    'u-token': u_token,
                    'app-user-location': xo,
                    'host': 'prod.meeshoapi.com',
                    'connection': 'Keep-Alive',
                    'accept-encoding': 'gzip',
                    'user-agent': 'okhttp/4.9.0'
                }
            };


            axios.request(options).then(function(response) {
                var json_data = response.data;

                var mdata = json_data['referrals'];

                console.log(mdata);

                for (let i = 0; i < mdata.length; i++) {
                    var json_data = JSON.stringify(json_data);
                    var id = mdata[i].id;
                    var total_commission = mdata[i].total_commission;
                    var order_count = mdata[i].order_count;
                    var order_value = mdata[i].order_value;
                    var valid = mdata[i].valid;
                    console.log(">>>" + total_commission);

                    var sql = "INSERT INTO `reffer_details` (`id`, `reffer_id`, `total_commision`, `order_count`, `order_value`, `user_id`,`json_data`,`valid`) VALUES (NULL, '" + id + "', '" + total_commission + "', '" + order_count + "', '" + order_value + "', '" + user_id + "', '" + json_data + "', '" + valid + "') ON DUPLICATE KEY UPDATE valid = '" + valid + "';";
                    console.log(" >>> " + sql);
                    db_config.query(sql, (err, result) => {

                        //var murl = "/order?user_id=" + user_id;
                        // return res.redirect(murl);
                    });
                }
                var murl = "/used_user";
                return res.redirect(murl);
                /*  if (order_count > 0) {
                      var sql = "UPDATE `users` SET `is_order_place`='1',`order_count`='" + order_count + "' WHERE `user_id` = '" + user_id + "'";
                      db_config.query(sql, (err, result) => {});
                      console.error(">>>" + sql);
                  }*/
                // res.render('orders', response.data);
            }).catch(function(error) {
                if (error.response.data.error == "JWT expired") {
                    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {
                        if (err) {
                            res.send("ERROR");
                        } else {

                            for (let i = 0; i < result.length; i++) {
                                var xoox = JSON.parse(result[i].xoox);
                                var xo = xoox.xo;
                                var ox = xoox.ox;
                                var device_id = result[i].device_id;
                                var mobile = "+91" + result[i].mobile;
                                var user_id = result[i].user_id;
                                var u_token = Buffer.from("+91" + mobile).toString('base64');

                                var axios = require("axios").default;
                                var mdata = {
                                    "ox": ox,
                                    "user_id": user_id
                                };
                                var options = {
                                    method: 'POST',
                                    url: 'https://prod.meeshoapi.com/api/2.0/xo',
                                    headers: {
                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                        'app-version': '14.0',
                                        'app-version-code': '436',
                                        'instance-id': device_id,
                                        'country-iso': 'in',
                                        'application-id': 'com.meesho.supply',
                                        'app-sdk-version': '25',
                                        'app-client-id': 'android',
                                        'xo': xo,
                                        'app-user-id': user_id,
                                        'u-token': u_token,
                                        'app-user-location': app_user_location,
                                        'content-type': 'application/json; charset=UTF-8',
                                        'accept-encoding': 'gzip',
                                        'user-agent': 'okhttp/4.9.0'
                                    },
                                    data: mdata
                                };

                                axios.request(options).then(function(response) {
                                    var json_data = response.data;
                                    var xoox = JSON.stringify(json_data.xoox);
                                    var xo = json_data.xoox.xo;
                                    var not_xoox = JSON.stringify(json_data.not_xoox);

                                    var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='1',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE user_id='" + user_id + "'";
                                    db_config.query(sql, (err, result) => {});

                                }).catch(function(error) {
                                    console.error(error);
                                });

                                var j = i + 1;
                                if (j == result.length) {
                                    console.log(">>>" + j);
                                    return res.redirect('refar_amount?user_id=' + refer_code);
                                }
                            }
                        }
                    });
                } else {
                    var sql = "UPDATE `users` SET `login_status`='1',`error_msg`='" + error.response.data.error + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                    return res.redirect('/used_user');
                }
                console.error(">>>" + error.response.data.error);
            });


        }
    });
});

// ADD BANK ACCOUNT
router.get('/add_bank_account', function(req, res, next) {
    var user_id = req.query.user_id;

    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            var xo = result[0].xo;
            var device_id = result[0].device_id;
            var mobile = "+91" + result[0].mobile;

            var sql = "SELECT * FROM `bank_account` WHERE `user_id` = 0 ORDER BY RAND() LIMIT 1";
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR");
                } else {
                 var id = result[0].id;
                 var mdata = {
                    "name": result[0].user_name,
                    "number": result[0].account_number,
                    "ifsc": result[0].ifsc,
                    "context_info": { "flow_type": "ACCOUNT", "sub_order_num": null },
                    "user_id": user_id
                };
                  
                 console.log(">>>"+result[0].account_number)
                 var axios = require("axios").default;
                 var u_token = Buffer.from("+91" + mobile).toString('base64');
                 var options = {
                     method: 'POST',
                     url: 'https://prod.meeshoapi.com/api/3.0/payment-aggregator/users/bank-details',
                     headers: {
                         'authorization': '32c4d8137cn9eb493a1921f203173080',
                         'app-version': '14.4',
                         'app-version-code': '450',
                         'instance-id': device_id,
                         'country-iso': 'in',
                         'application-id': 'com.meesho.supply',
                         'app-sdk-version': '25',
                         'app-client-id': 'android',
                         'xo': xo,
                         'app-iso-language-code': 'en',
                         'app-user-id': user_id,
                         'u-token': u_token,
                         'app-user-location': app_user_location,
                         'content-type': 'application/json; charset=UTF-8',
                         'host': 'prod.meeshoapi.com',
                         'connection': 'Keep-Alive',
                         'accept-encoding': 'gzip',
                         'user-agent': 'okhttp/4.9.0'
                     },
                     data: mdata
                 };
    
                 axios.request(options).then(function(response) {
                     var json_data = response.data;
                     var sql = "UPDATE `users` SET `bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                     db_config.query(sql, (err, result) => {
                         //res.render('user_list');   
                         var sql = "UPDATE `bank_account` SET `user_id`='"+user_id+"' WHERE id='" + id + "'";
                         db_config.query(sql, (err, result) => {});
    
                         res.redirect("/used_user");
                     });                                        
              
            }).catch(function(error) {
                if (error.response.data.error == "JWT expired") {
                    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {
                        if (err) {
                            res.send("ERROR");
                        } else {

                            for (let i = 0; i < result.length; i++) {
                                var xoox = JSON.parse(result[i].xoox);
                                var xo = xoox.xo;
                                var ox = xoox.ox;
                                var device_id = result[i].device_id;
                                var mobile = "+91" + result[i].mobile;
                                var user_id = result[i].user_id;
                                var u_token = Buffer.from("+91" + mobile).toString('base64');

                                var axios = require("axios").default;
                                var mdata = {
                                    "ox": ox,
                                    "user_id": user_id
                                };
                                var options = {
                                    method: 'POST',
                                    url: 'https://prod.meeshoapi.com/api/2.0/xo',
                                    headers: {
                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                        'app-version': '14.0',
                                        'app-version-code': '436',
                                        'instance-id': device_id,
                                        'country-iso': 'in',
                                        'application-id': 'com.meesho.supply',
                                        'app-sdk-version': '25',
                                        'app-client-id': 'android',
                                        'xo': xo,
                                        'app-user-id': user_id,
                                        'u-token': u_token,
                                        'app-user-location': app_user_location,
                                        'content-type': 'application/json; charset=UTF-8',
                                        'accept-encoding': 'gzip',
                                        'user-agent': 'okhttp/4.9.0'
                                    },
                                    data: mdata
                                };

                                axios.request(options).then(function(response) {
                                    var json_data = response.data;
                                    var xoox = JSON.stringify(json_data.xoox);
                                    var xo = json_data.xoox.xo;
                                    var not_xoox = JSON.stringify(json_data.not_xoox);

                                    var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='1',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE user_id='" + user_id + "'";
                                    db_config.query(sql, (err, result) => {});

                                }).catch(function(error) {
                                    console.error(error);
                                });

                                var j = i + 1;
                                if (j == result.length) {
                                    console.log(">>>" + j);
                                    return res.redirect('/order?user_id=' + user_id);
                                }
                            }
                        }
                    });
                } else {
                    var sql = "UPDATE `users` SET `login_status`='1',`error_msg`='" + error.response.data.error + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                    return res.redirect('/user');
                }
                console.error(">>>" + error.response.data.error);
            });
          }
             });
    }
});
});

// ADD BANK ACCOUNT
router.get('/add_refaral', function(req, res, next) {
    var user_id = req.query.user_id;

    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            var xo = result[0].xo;
            var device_id = result[0].device_id;
            var mobile = "+91" + result[0].mobile;

            var u_token = Buffer.from("+91" + mobile).toString('base64');
            // Get my refferal code
            var axios = require("axios").default;
            var options = {
                method: 'GET',
                url: 'https://prod.meeshoapi.com/api/4.0/referral-program',
                headers: {
                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                    'app-version': '14.0',
                    'app-version-code': '436',
                    'instance-id': device_id,
                    'country-iso': 'in',
                    'application-id': 'com.meesho.supply',
                    'app-sdk-version': '25',
                    'app-client-id': 'android',
                    'xo': xo,
                    'app-user-id': user_id,
                    'u-token': u_token,
                    'app-user-location': app_user_location,
                    'accept-encoding': 'gzip',
                    'user-agent': 'okhttp/4.9.0'
                }
            };

            axios.request(options).then(function(response) {
                var json_data = response.data;
                var my_refer_code = json_data.share.code;

                
               var sql = "UPDATE `users` SET `my_refer_code`='" + my_refer_code + "' WHERE user_id='" + user_id + "'";
                db_config.query(sql, (err, result) => {
                     // Add Reffral Code  
                var msql = "SELECT * FROM `users` WHERE `otp_verify`='1' AND `my_refer_code` != '' AND reffral_added = 0 LIMIT 1;";
                db_config.query(msql, (err, result) => {
                    var other_reffral_code = result[0].my_refer_code;
                    var ref_id = result[0].id;
                    console.log(other_reffral_code+">>>"+ref_id);
                    var axios = require('axios');
                    var data = JSON.stringify({
                        "referral_code": other_reffral_code,
                        "user_id": user_id
                    });

                    var config = {
                        method: 'post',
                        url: 'https://prod.meeshoapi.com/api/4.0/referral-program/add/referral',
                        headers: {
                            'accept-encoding': 'gzip',
                            'app-client-id': 'android',
                            'app-sdk-version': '25',
                            'app-user-id': user_id,
                            'app-version': '14.4',
                            'app-version-code': '450',
                            'application-id': 'com.meesho.supply',
                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                            'connection': 'Keep-Alive',
                            'country-iso': 'in',
                            'host': 'prod.meeshoapi.com',
                            'instance-id': device_id,
                            'u-token': u_token,
                            'user-agent': 'okhttp/4.9.0',
                            'xo': xo,
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };

                    axios(config)
                        .then(function(response) {
                            var json_data = response.data;
                            console.log(JSON.stringify(json_data));
                            var status = json_data.status;
                            if (status != "REFERRAL_ALREADY_EXISTS") {
                                var sql = "UPDATE `users` SET `otp_verify`='1',`reffer_code`='" + other_reffral_code + "' WHERE user_id='" + user_id + "'";
                                db_config.query(sql, (err, result) => {});
                                console.log(sql);
                                var sql = "UPDATE `users` SET `reffral_added`='1' WHERE id='" + ref_id + "'";
                                db_config.query(sql, (err, result) => {});
                               // res.redirect("user?type=1");

                               var sql = "SELECT * FROM `bank_account` WHERE `user_id` = 0 ORDER BY RAND() LIMIT 1";
                               db_config.query(sql, (err, result) => {
                                   if (err) {
                                       res.send("ERROR");
                                   } else {
                                    var id = result[0].id;
                                    var mdata = {
                                        "name": result[0].user_name,
                                        "number": result[0].account_number,
                                        "ifsc": result[0].ifsc,
                                        "context_info": { "flow_type": "ACCOUNT", "sub_order_num": null },
                                        "user_id": user_id
                                    };
                                    var axios = require("axios").default;
                                    var u_token = Buffer.from("+91" + mobile).toString('base64');
                                    var options = {
                                        method: 'POST',
                                        url: 'https://prod.meeshoapi.com/api/3.0/payment-aggregator/users/bank-details',
                                        headers: {
                                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                                            'app-version': '14.4',
                                            'app-version-code': '450',
                                            'instance-id': device_id,
                                            'country-iso': 'in',
                                            'application-id': 'com.meesho.supply',
                                            'app-sdk-version': '25',
                                            'app-client-id': 'android',
                                            'xo': xo,
                                            'app-iso-language-code': 'en',
                                            'app-user-id': user_id,
                                            'u-token': u_token,
                                            'app-user-location': app_user_location,
                                            'content-type': 'application/json; charset=UTF-8',
                                            'host': 'prod.meeshoapi.com',
                                            'connection': 'Keep-Alive',
                                            'accept-encoding': 'gzip',
                                            'user-agent': 'okhttp/4.9.0'
                                        },
                                        data: mdata
                                    };
                
                                    axios.request(options).then(function(response) {
                                        var json_data = response.data;
                                        var sql = "UPDATE `users` SET `bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                                        db_config.query(sql, (err, result) => {
                                            //res.render('user_list');   
                                            var sql = "UPDATE `bank_account` SET `user_id`='"+user_id+"' WHERE id='" + id + "'";
                                            db_config.query(sql, (err, result) => {});

                                            res.redirect("invalid_user");
                                        });                                        
                                    }).catch(function(error) {
                                        console.error(error);
                                        res.redirect("invalid_user");
                                    });
                                }
                            });

                            } else {
                                var sql = "UPDATE `users` SET `otp_verify`='0',`reffer_code`='" + status + "' WHERE user_id='" + user_id + "'";
                                db_config.query(sql, (err, result) => {});
                                res.redirect("invalid_user");
                            }
                        })
                        .catch(function(error) {
                            //console.log(error);
                        });

                });
                });
               
            }).catch(function(error) {
                console.error(error);
            });
           
    }
});
});

// Task
router.get('/new_task', function(req, res, next) {
    //  var user_type = req.query.type;
    var sql = "";
    var perPage = 10;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;

    sql = "SELECT count(*) as num  FROM `cards` WHERE cards.status = 0;";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
            sql = "SELECT cards.* FROM `cards` WHERE cards.status = 0 LIMIT " + start + "," + perPage;
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR ...");
                } else {
                    res.render('new_task', {
                        data: result,
                        current: page,
                        newtotal: count,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        }
    });

});

// ADD BANK ACCOUNT
/*
router.get('/add_bank_account', function(req, res, next) {
    var user_id = req.query.user_id;

    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            var xo = result[0].xo;
            var device_id = result[0].device_id;
            var mobile = "+91" + result[0].mobile;

            var sql = "SELECT * FROM `bank_acc` WHERE `user_id` = 0 ORDER BY RAND() LIMIT 1";
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR");
                } else {
                 var id = result[0].id;
                 var mdata = {
                     "name": result[0].name,
                     "number": result[0].bank_acc,
                     "ifsc": "YESB0CMSNOC",
                     "context_info": { "flow_type": "ACCOUNT", "sub_order_num": null },
                     "user_id": user_id
                 };
                 console.log(">>>"+result[0].bank_acc)
                 var axios = require("axios").default;
                 var u_token = Buffer.from("+91" + mobile).toString('base64');
                 var options = {
                     method: 'POST',
                     url: 'https://prod.meeshoapi.com/api/3.0/payment-aggregator/users/bank-details',
                     headers: {
                         'authorization': '32c4d8137cn9eb493a1921f203173080',
                         'app-version': '14.4',
                         'app-version-code': '450',
                         'instance-id': device_id,
                         'country-iso': 'in',
                         'application-id': 'com.meesho.supply',
                         'app-sdk-version': '25',
                         'app-client-id': 'android',
                         'xo': xo,
                         'app-iso-language-code': 'en',
                         'app-user-id': user_id,
                         'u-token': u_token,
                         'app-user-location': app_user_location,
                         'content-type': 'application/json; charset=UTF-8',
                         'host': 'prod.meeshoapi.com',
                         'connection': 'Keep-Alive',
                         'accept-encoding': 'gzip',
                         'user-agent': 'okhttp/4.9.0'
                     },
                     data: mdata
                 };
    
                 axios.request(options).then(function(response) {
                     var json_data = response.data;
                     var sql = "UPDATE `users` SET `bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                     db_config.query(sql, (err, result) => {
                         //res.render('user_list');   
                         var sql = "UPDATE `bank_acc` SET `user_id`='"+user_id+"' WHERE id='" + id + "'";
                         db_config.query(sql, (err, result) => {});
    
                         res.redirect("/used_user");
                     });                                        
              
            }).catch(function(error) {
                if (error.response.data.error == "JWT expired") {
                    var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {
                        if (err) {
                            res.send("ERROR");
                        } else {

                            for (let i = 0; i < result.length; i++) {
                                var xoox = JSON.parse(result[i].xoox);
                                var xo = xoox.xo;
                                var ox = xoox.ox;
                                var device_id = result[i].device_id;
                                var mobile = "+91" + result[i].mobile;
                                var user_id = result[i].user_id;
                                var u_token = Buffer.from("+91" + mobile).toString('base64');

                                var axios = require("axios").default;
                                var mdata = {
                                    "ox": ox,
                                    "user_id": user_id
                                };
                                var options = {
                                    method: 'POST',
                                    url: 'https://prod.meeshoapi.com/api/2.0/xo',
                                    headers: {
                                        'authorization': '32c4d8137cn9eb493a1921f203173080',
                                        'app-version': '14.0',
                                        'app-version-code': '436',
                                        'instance-id': device_id,
                                        'country-iso': 'in',
                                        'application-id': 'com.meesho.supply',
                                        'app-sdk-version': '25',
                                        'app-client-id': 'android',
                                        'xo': xo,
                                        'app-user-id': user_id,
                                        'u-token': u_token,
                                        'app-user-location': app_user_location,
                                        'content-type': 'application/json; charset=UTF-8',
                                        'accept-encoding': 'gzip',
                                        'user-agent': 'okhttp/4.9.0'
                                    },
                                    data: mdata
                                };

                                axios.request(options).then(function(response) {
                                    var json_data = response.data;
                                    var xoox = JSON.stringify(json_data.xoox);
                                    var xo = json_data.xoox.xo;
                                    var not_xoox = JSON.stringify(json_data.not_xoox);

                                    var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='1',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE user_id='" + user_id + "'";
                                    db_config.query(sql, (err, result) => {});

                                }).catch(function(error) {
                                    console.error(error);
                                });

                                var j = i + 1;
                                if (j == result.length) {
                                    console.log(">>>" + j);
                                    return res.redirect('/order?user_id=' + user_id);
                                }
                            }
                        }
                    });
                } else {
                    var sql = "UPDATE `users` SET `login_status`='1',`error_msg`='" + error.response.data.error + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                    return res.redirect('/user');
                }
                console.error(">>>" + error.response.data.error);
            });
          }
             });
    }
});
});
*/
// Method 
router.post('/:method?', function(req, res, next) {
    if (req.params.method == "login") {
        var email = req.body.email;
        var password = req.body.password;
        var sql = "SELECT * FROM `admin` WHERE `user_name` = '" + email + "' AND `password` = '" + password + "' ";
        db_config.query(sql, (err, result) => {
            if (err) {
                res.send("ERROR");
            } else {
                if (result.length > 0) {
                    res.render('user');
                } else {
                    res.render('index', { title: 'Invalid Username Password!' });
                }
            }
        });
        //res.send(">>"+email+" >>> "+password);   
    }

    if (req.params.method == "add_bank_account") {
     

     /*   var account_name = req.body.account_name;
        var account_number = req.body.account_number;
        var ifsc = req.body.ifsc;
        var user_id = req.body.user_id;

        var sql = "SELECT * FROM `users` WHERE `user_id` = '" + user_id + "' ";
        db_config.query(sql, (err, result) => {
            if (err) {
                res.send("ERROR");
            } else {
                if (result.length > 0) {
                    var request_id = result[0].request_id;
                    var device_id = result[0].device_id;
                    var xo = result[0].xo;
                    var id = result[0].id;
                    var mobile = result[0].mobile;

                    var mdata = {
                        "name": account_name,
                        "number": account_number,
                        "ifsc": ifsc,
                        "context_info": { "flow_type": "ACCOUNT", "sub_order_num": null },
                        "user_id": user_id
                    };
                    var axios = require("axios").default;
                    var u_token = Buffer.from("+91" + mobile).toString('base64');
                    var options = {
                        method: 'POST',
                        url: 'https://prod.meeshoapi.com/api/3.0/payment-aggregator/users/bank-details',
                        headers: {
                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                            'app-version': '14.4',
                            'app-version-code': '450',
                            'instance-id': device_id,
                            'country-iso': 'in',
                            'application-id': 'com.meesho.supply',
                            'app-sdk-version': '25',
                            'app-client-id': 'android',
                            'xo': xo,
                            'app-iso-language-code': 'en',
                            'app-user-id': user_id,
                            'u-token': u_token,
                            'app-user-location': app_user_location,
                            'content-type': 'application/json; charset=UTF-8',
                            'host': 'prod.meeshoapi.com',
                            'connection': 'Keep-Alive',
                            'accept-encoding': 'gzip',
                            'user-agent': 'okhttp/4.9.0'
                        },
                        data: mdata
                    };

                    axios.request(options).then(function(response) {
                        var json_data = response.data;
                        var sql = "UPDATE `users` SET `bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                        db_config.query(sql, (err, result) => {
                            //res.render('user_list');   
                            res.redirect("user?type=1");
                        });

                    }).catch(function(error) {
                        console.error(error);
                        res.redirect("user?type=1");
                    });

                }
            }
        });*/
    }

    if (req.params.method == "submit_otp") {
        var mobile = req.body.mobile;
        var otp = req.body.otp;
        var sql = "SELECT * FROM `users` WHERE `mobile` = '" + mobile + "'";

        db_config.query(sql, (err, result) => {
            if (err) {
                res.send("ERROR");
            } else {
                if (result.length > 0) {
                    var request_id = result[0].request_id;
                    var device_id = result[0].device_id;
                    var xo = result[0].xo;
                    var id = result[0].id;

                    var data = {
                        "request_id": request_id,
                        "otp": otp,
                        "login_type": "meesho_sms_auth"
                    };

                    var axios = require('axios');

                    var config = {
                        method: 'post',
                        url: 'https://prod.meeshoapi.com/api/2.0/user/login',
                        headers: {
                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                            'app-version': '14.0',
                            'app-version-code': '436',
                            'instance-id': device_id,
                            'country-iso': 'in',
                            'application-id': 'com.meesho.supply',
                            'app-sdk-version': '25',
                            'app-client-id': 'android',
                            'xo': xo,
                            'app-iso-language-code': 'en',
                            'content-type': 'application/json; charset=UTF-8',
                            'accept-encoding': 'gzip',
                            'user-agent': 'okhttp/4.9.0'
                        },
                        data: data
                    };


                    axios(config)
                        .then(function(response) {

                            var json_data = response.data;
                            var user_id = json_data.user.user_id;
                            var xoox = JSON.stringify(json_data.xoox);
                            var xo = json_data.xoox.xo;
                            var not_xoox = JSON.stringify(json_data.not_xoox);

                            var sql = "UPDATE `users` SET `xo`='" + xo + "',`otp_verify`='0',`user_id`='" + user_id + "',`xoox`='" + xoox + "',`not_xoox`='" + not_xoox + "' WHERE id='" + id + "'";
                            db_config.query(sql, (err, result) => {
                                if (err) {
                                    res.send("ERROR");
                                } else {

                                    var u_token = Buffer.from("+91" + mobile).toString('base64');
                                    // Get my refferal code
                                    var axios = require("axios").default;
                                    var options = {
                                        method: 'GET',
                                        url: 'https://prod.meeshoapi.com/api/4.0/referral-program',
                                        headers: {
                                            'authorization': '32c4d8137cn9eb493a1921f203173080',
                                            'app-version': '14.0',
                                            'app-version-code': '436',
                                            'instance-id': device_id,
                                            'country-iso': 'in',
                                            'application-id': 'com.meesho.supply',
                                            'app-sdk-version': '25',
                                            'app-client-id': 'android',
                                            'xo': xo,
                                            'app-user-id': user_id,
                                            'u-token': u_token,
                                            'app-user-location': app_user_location,
                                            'accept-encoding': 'gzip',
                                            'user-agent': 'okhttp/4.9.0'
                                        }
                                    };

                                    axios.request(options).then(function(response) {
                                        var json_data = response.data;
                                        var my_refer_code = json_data.share.code;
                                        var sql = "UPDATE `users` SET `my_refer_code`='" + my_refer_code + "' WHERE id='" + id + "'";
                                        db_config.query(sql, (err, result) => {
                                            //res.render('user_list');   
                                        });
                                        // Add Reffral Code  
                                        var msql = "SELECT * FROM `users` WHERE `otp_verify`='1' AND `my_refer_code` != '' AND reffral_added = 0 LIMIT 1;";
                                        db_config.query(msql, (err, result) => {
                                            var other_reffral_code = result[0].my_refer_code;
                                            var ref_id = result[0].id;

                                            var axios = require('axios');
                                            var data = JSON.stringify({
                                                "referral_code": other_reffral_code,
                                                "user_id": user_id
                                            });

                                            var config = {
                                                method: 'post',
                                                url: 'https://prod.meeshoapi.com/api/4.0/referral-program/add/referral',
                                                headers: {
                                                    'accept-encoding': 'gzip',
                                                    'app-client-id': 'android',
                                                    'app-sdk-version': '25',
                                                    'app-user-id': user_id,
                                                    'app-version': '14.4',
                                                    'app-version-code': '450',
                                                    'application-id': 'com.meesho.supply',
                                                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                    'connection': 'Keep-Alive',
                                                    'country-iso': 'in',
                                                    'host': 'prod.meeshoapi.com',
                                                    'instance-id': device_id,
                                                    'u-token': u_token,
                                                    'user-agent': 'okhttp/4.9.0',
                                                    'xo': xo,
                                                    'Content-Type': 'application/json'
                                                },
                                                data: data
                                            };

                                            axios(config)
                                                .then(function(response) {
                                                    var json_data = response.data;
                                                    var status = json_data.status;
                                                    if (status != "REFERRAL_ALREADY_EXISTS") {
                                                        var sql = "UPDATE `users` SET `otp_verify`='1',`reffer_code`='" + other_reffral_code + "' WHERE id='" + id + "'";
                                                        db_config.query(sql, (err, result) => {});
                                                        var sql = "UPDATE `users` SET `reffral_added`='1' WHERE id='" + ref_id + "'";
                                                        db_config.query(sql, (err, result) => {});
                                                       // res.redirect("user?type=1");

                                                       var sql = "SELECT * FROM `bank_account` WHERE `user_id` = 0 ORDER BY RAND() LIMIT 1";
                                                       db_config.query(sql, (err, result) => {
                                                           if (err) {
                                                               res.send("ERROR");
                                                           } else {
                                                            var id = result[0].id;
                                                            var mdata = {
                                                                "name": result[0].user_name,
                                                                "number": result[0].account_number,
                                                                "ifsc": result[0].ifsc,
                                                                "context_info": { "flow_type": "ACCOUNT", "sub_order_num": null },
                                                                "user_id": user_id
                                                            };
                                                            var axios = require("axios").default;
                                                            var u_token = Buffer.from("+91" + mobile).toString('base64');
                                                            var options = {
                                                                method: 'POST',
                                                                url: 'https://prod.meeshoapi.com/api/3.0/payment-aggregator/users/bank-details',
                                                                headers: {
                                                                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                                                                    'app-version': '14.4',
                                                                    'app-version-code': '450',
                                                                    'instance-id': device_id,
                                                                    'country-iso': 'in',
                                                                    'application-id': 'com.meesho.supply',
                                                                    'app-sdk-version': '25',
                                                                    'app-client-id': 'android',
                                                                    'xo': xo,
                                                                    'app-iso-language-code': 'en',
                                                                    'app-user-id': user_id,
                                                                    'u-token': u_token,
                                                                    'app-user-location': app_user_location,
                                                                    'content-type': 'application/json; charset=UTF-8',
                                                                    'host': 'prod.meeshoapi.com',
                                                                    'connection': 'Keep-Alive',
                                                                    'accept-encoding': 'gzip',
                                                                    'user-agent': 'okhttp/4.9.0'
                                                                },
                                                                data: mdata
                                                            };
                                        
                                                            axios.request(options).then(function(response) {
                                                                var json_data = response.data;
                                                                var sql = "UPDATE `users` SET `bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                                                                db_config.query(sql, (err, result) => {
                                                                    //res.render('user_list');   
                                                                    var sql = "UPDATE `bank_account` SET `user_id`='"+user_id+"' WHERE id='" + id + "'";
                                                                    db_config.query(sql, (err, result) => {});
                                                                    res.redirect("user?type=1");
                                                                });                                        
                                                            }).catch(function(error) {
                                                                console.error(error);
                                                                res.redirect("user?type=1");
                                                            });
                                                        }
                                                    });

                                                    } else {
                                                        var sql = "UPDATE `users` SET `otp_verify`='0',`reffral_added`='" + status + "' WHERE id='" + id + "'";
                                                        db_config.query(sql, (err, result) => {});
                                                        res.redirect("user?type=0");
                                                    }
                                                })
                                                .catch(function(error) {
                                                    //console.log(error);
                                                });

                                        });

                                    }).catch(function(error) {
                                        console.error(error);
                                    });

                                }
                            });

                        })
                        .catch(function(error) {
                            console.log(error);
                            res.redirect("user?type=1");
                        });

                } else {
                    res.redirect("user?type=1");
                }
            }
        })
    }

    if (req.params.method == "fileupload") {
        console.log(">>>>> Start");
        var formidable = require('formidable');
            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
            //res.write('File uploaded'+JSON.stringify(files));
            const file = xlsx.readFile(files.filetoupload.filepath);
            const sheetNames = file.SheetNames;
            const tempData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[0]]);
            for(let i=0; i<tempData.length; i++)
            {
                var json_data = tempData[i];
                var sql = "INSERT INTO `cards` (`id`, `cards_number`, `month`, `year`, `cvv`, `pin`, `pincode`, `qty`, `product_id`, `status`, `user_id`, `txt_amount`, `cart_details`, `MRP`, `Product_Amount`, `order_mobile`, `city`, `name`, `address`, `landmark`) VALUES (NULL, '"+json_data.CARD_NUMBER+"', '"+json_data.MONTH+"', '"+json_data.YEAR+"', '"+json_data.CVV+"', '"+json_data.PIN+"', '"+json_data.PIN_CODE+"', '"+json_data.QTY+"', '"+json_data.PRODUCT_ID+"', '0', '0', '0', '0', '0', '0', '"+json_data.ORDER_MOBILE+"', '"+json_data.CITY+"', '"+json_data.NAME+"', '"+json_data.ADDRESS+"', '"+json_data.LANDMARK+"');";
                db_config.query(sql, (err, result) => {                                          
                });
                //assing_task(json_data);                        
            }
            console.log(">>>"+JSON.stringify(tempData));
            res.redirect("new_task");
            });
    }

});


// Assing Task
router.get('/assing_task', function(req, res, next) {
   
    var sql = "SELECT count(*) as mcount FROM `cards` WHERE `user_id` = 0;";
                                db_config.query(sql, (err, result) => {  
                                    var sql = "SELECT `user_id` FROM `users` WHERE `bank_status` = 'SUCCESS' AND `order_count` = 0 AND `is_assing`='0' LIMIT "+result[0].mcount;
                                    db_config.query(sql, (err, result) => {
                                        if (err) {
                                           // res.send("ERROR");
                                        } else {           
                                            for(let i = 0; i<result.length ;i++)
                                            {                 
                                                var user_id = result[i].user_id;
                                                assing_task(user_id);    
                                            }               
                                           res.end();
                                        }       
                                    });
                                }); 
    
 });

 function assing_task (user_id)
 {
                                var sql = "UPDATE `cards` SET `status`='0', `user_id`="+user_id+" WHERE `user_id`= 0 LIMIT 1;";
                                db_config.query(sql, (err, result) => {                                                              
                                }); 
                                var sql = "UPDATE `users` SET `is_assing`='1' WHERE user_id = "+user_id;
                                db_config.query(sql, (err, result) => { 
                                    console.log(">>>"+user_id);                                                           
                                }); 
 }

router.get('/export_excel', function(req, res, next) {
    var view = req.query.view;
    let workbook = new excel.Workbook();   
    console.log(">>"+view);    
    let worksheet = "";
        switch (view) 
        { 
            case "card_report":
                worksheet = workbook.addWorksheet("Used Amount");
                var sql = "SELECT SUM(`txt_amount`) as amount, `cards_number` FROM `cards` WHERE `status` = 1 GROUP BY `cards_number` ORDER BY SUM(`txt_amount`) DESC ";
                db_config.query(sql, (err, result) => {
                    if (err) {
                        res.send("ERROR ...");
                    } else {
                        worksheet.columns = [
                          { header: "Cards Number", key: "cards_number", width: 25 },
                          { header: "Amount", key: "amount", width: 10 }              
                        ];
                        worksheet.addRows(result);
                        res.setHeader(
                          "Content-Type",
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                        var mDate = new Date();
                        res.setHeader(
                          "Content-Disposition",
                          "attachment; filename=" + "BC_"+mDate+".xlsx"
                        );
                      
                        return workbook.xlsx.write(res).then(function () {
                          res.status(200).end();          
                        });        
                    }
                });
            break;    

            case "success_report":
                worksheet = workbook.addWorksheet("Success");
                var sql = "SELECT cards.id as cards_id,cards.*,user_account.* FROM `cards` LEFT JOIN user_account ON cards.user_id = user_account.user_id WHERE cards.status = 1 AND cards.user_id != 0 ORDER BY cards_id DESC";
                db_config.query(sql, (err, result) => {
                    if (err) {
                        res.send("ERROR ...");
                    } else { 
                        var colum_row =  [
                            { header: "Id", key: "cards_id", width: 5 },
                            { header: "Card Number", key: "cards_number", width: 15 },
                            { header: "Month", key: "month", width: 5 },
                            { header: "Year", key: "year", width: 5 },
                            { header: "Cvv", key: "cvv", width: 5 },                            
                            { header: "Status", key: "status", width: 5 },                                                
                            { header: "User_id", key: "user_id", width: 5 },
                            { header: "Mobile", key: "mobile", width: 5 },
                            { header: "Pincode", key: "pincode", width: 5 },
                            { header: "Product_id", key: "product_id", width: 5 },
                            { header: "Txt_amount", key: "txt_amount", width: 5 }, 
                            { header: "MRP", key: "MRP", width: 5 },
                            { header: "Product_Amount", key: "Product_Amount", width: 5 },
                            { header: "userSpecificDiscountEnable", key: "userSpecificDiscountEnable", width: 10 },
                            { header: "walletDiscountEnable", key: "walletDiscountEnable", width: 10 } ,
                            { header: "walletdiscount", key: "walletdiscount", width: 10 } ,
                            { header: "purchaseId", key: "purchaseId", width: 10 } ,
                            { header: "order_Id", key: "order_Id", width: 10 }                          
                          ];                    
                       
                      worksheet.columns = colum_row;

                      worksheet.addRows(result);
                        res.setHeader(
                          "Content-Type",
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        );
                        var mDate = new Date();
                        res.setHeader(
                          "Content-Disposition",
                          "attachment; filename=" + "BC_"+mDate+".xlsx"
                        );
                      
                        return workbook.xlsx.write(res).then(function () {
                          res.status(200).end();          
                        });    
                    }
                });
            break; 

            case "card_file":
                worksheet = workbook.addWorksheet("New Task");
                var colum_row =  [
                    { header: "CARD_NUMBER", key: "cards_id", width: 10 },
                    { header: "MONTH", key: "cards_number", width: 10 },                   
                    { header: "YEAR", key: "year", width: 10 },
                    { header: "CVV", key: "cvv", width: 10 },                            
                    { header: "PIN", key: "status", width: 10 },                                                
                    { header: "PRODUCT_ID", key: "user_id", width: 10 },
                    { header: "QTY", key: "mobile", width: 10 },
                    { header: "NAME", key: "pincode", width: 10 },
                    { header: "ADDRESS", key: "product_id", width: 10 },
                    { header: "LANDMARK", key: "txt_amount", width: 10 }, 
                    { header: "CITY", key: "txt_amount", width: 10 }, 
                    { header: "PIN_CODE", key: "MRP", width: 10 } ,
                    { header: "ORDER_MOBILE", key: "MOBILE", width: 10 }                       
                  ];                    
                  
              worksheet.columns = colum_row;
             
                res.setHeader(
                  "Content-Type",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                var mDate = new Date();
                res.setHeader(
                  "Content-Disposition",
                  "attachment; filename=" + "BC_"+mDate+".xlsx"
                );
              
                return workbook.xlsx.write(res).then(function () {
                  res.status(200).end();          
                });    
            break; 
        }

  });

module.exports = router;
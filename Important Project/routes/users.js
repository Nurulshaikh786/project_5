var express = require('express');
var router = express.Router();
const cheerio = require('cheerio');
const db_config = require("./config");

var md5 = require('md5');
const app_user_location = "eyJsYXQiOiIyMi44ODI2IiwibG9uZyI6IjczLjA5OTgiLCJwaW5jb2RlIjoiMzg4MDAxIiwiY2l0eSI6IkFuYW5kIiwiYWRkcmVzc19pZCI6bnVsbH0=";
const mpincode = "388001";

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/request_otp', function(req, res, next) {
    var mobile = req.query.mobile;
    var randomstring = require("randomstring");
    var device_id = randomstring.generate(32);;
    var axios = require("axios").default;

    var options = {
        method: 'GET',
        url: 'https://prod.meeshoapi.com/api/1.0/anonymous/config',
        headers: {
            'authorization': '32c4d8137cn9eb493a1921f203173080',
            'app-version': '14.0',
            'app-version-code': '436',
            'instance-id': device_id,
            'country-iso': 'in',
            'application-id': 'com.meesho.supply',
            'app-sdk-version': '25',
            'app-client-id': 'android',
            'xo': '',
            'accept-encoding': 'gzip',
            'user-agent': 'okhttp/4.9.0'
        }
    };

    axios.request(options).then(function(response) {
        var json_data = response.data;
        var xo = json_data.xoox.xo;

        var qs = require('qs');
        var data = qs.stringify({
            'mobile': mobile
        });
        var config = {
            method: 'post',
            url: 'https://earlysolution.in/get_payload.php',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios(config)
            .then(function(response) {
                //console.log(JSON.stringify(response.data));
                var options = {
                    method: 'POST',
                    url: 'https://prod.meeshoapi.com/api/1.0/user/login/request-otp',
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
                    data: JSON.stringify(response.data)
                };

                axios.request(options).then(function(response) {
                    var json_data = response.data;
                    var request_id = json_data.request_id

                    var sql = "INSERT INTO `users` (`id`, `mobile`, `request_id`, `xo`, `device_id`) VALUES (NULL, '" + mobile + "', '" + request_id + "', '" + xo + "', '" + device_id + "');";
                    db_config.query(sql, (err, result) => {
                        if (err) {
                            res.send('{ "Status" : "Error"}');
                        } else {
                            res.send('{ "Status" : "Success"}');
                        }
                    });
                }).catch(function(error) {
                    res.send('01 >>>  ' + error);
                });
            })
            .catch(function(error) {
                console.log(error);
            });

    }).catch(function(error) {
        res.send('>>>  ' + error);
    });


});

// Update ORDERS
router.get('/update_order', function(req, res, next) {
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
                // res.render('orders', response.data);
                //res.send('respond with a resource');
                let order_count = response.data.order_list.length;
                console.error(">>>" + order_count);
                if (order_count > 0) {
                    var sql = "UPDATE `users` SET `is_order_place`='1',`order_count`='" + order_count + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                    console.error(">>>" + sql);
                }

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
                                    return res.redirect('users/update_order?user_id=' + user_id);
                                }
                            }
                        }
                    });
                } else {
                    var sql = "UPDATE `users` SET `login_status`='1',`error_msg`='" + error.response.data.error + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                }
                console.error(">>>" + error.response.data.error);
            });
            res.send("Done");

        }
    });

});

router.get('/get_user', function(req, res, next) {
    var user_type = req.query.type;
    var sql = "";
    switch (user_type) {
        case '1':
            sql = "SELECT * FROM `users` WHERE `otp_verify` = 1 ORDER BY id desc";
            break;
        case '0':
            sql = "SELECT * FROM `users` WHERE `otp_verify` = 0 ORDER BY id desc";
            break;
        default:
            sql = "SELECT * FROM `users` ";
            break;
    }

    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(result);
        }
    });
});

// Ratting Call
router.get('/update_ratting', function(req, res, next) {
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

            var data = { "limit": 20, "offset": 0, "order_status": 4, "user_id": user_id };
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
                // res.render('orders', response.data);
                //res.send('respond with a resource');
                let order_list = response.data.order_list;
                let order_count = response.data.order_list.length; 
                console.error(">>>" + order_count);
                for(let i=0; i< order_list.length; i++)
                {
                    var order_id = order_list[i].id;
                    var sub_order_id = order_list[i].sub_orders[0].id;
                   
                    var axios = require("axios").default;
                    var mData = { 
                        "order_detail_rating" : {"rating":5},
                        "user_id":user_id
                        };
                    var murl = "https://prod.meeshoapi.com/api/3.0/orders/"+order_id+"/sub-orders/"+sub_order_id+"/ratings";
                    var options = {
                    method: 'POST',
                    url: murl,
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
                        'app-user-location': app_user_location,
                        'content-type': 'application/json; charset=UTF-8',
                        'host': 'prod.meeshoapi.com',
                        'connection': 'Keep-Alive',
                        'accept-encoding': 'gzip',
                        'user-agent': 'okhttp/4.9.0'
                    },
                    data: mData
                    };

                    axios.request(options).then(function (response) {
                        
                        console.log(response.data);                      
                        if (order_count > 0) {
                            var sql = "UPDATE `users` SET `is_rating`= '1',`is_order_place`='1',`order_count`='" + order_count + "' WHERE `user_id` = '" + user_id + "'";
                            db_config.query(sql, (err, result) => {
                               //res.send();
                            });
                            console.error(">>>" + sql);
                        }
                    }).catch(function (error) {
                    console.error(error);
                    });

                }
                res.send("Ratting Done");

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
                                    return res.redirect('/update_ratting?user_id=' + user_id);
                                }
                            }
                        }
                    });
                } else {
                    var sql = "UPDATE `users` SET `login_status`='1',`error_msg`='" + error.response.data.error + "' WHERE `user_id` = '" + user_id + "'";
                    db_config.query(sql, (err, result) => {});
                }
                console.error(">>>" + error.response.data.error);
            });
            //res.send("update_ratting");

        }
    });

});

// Create Account
router.get('/get_number', function(req, res, next) {
   // setInterval(()=> {
        getNumber(res); 
     // },10000)       
});

function getNumber(res)
{
    var axios = require('axios');
    var qs = require('qs');
    var time = Date.now();
    var password = "hdfc@9896";
    var msg = 'EARLY' + time + password;
    var sign = md5(msg);

    var data = qs.stringify({
        'chName': 'EARLY',
        'time': time,
        'sign': sign
    });

    var config = {
        method: 'post',
        url: 'http://3.111.109.85:8088/ch/getPh',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
console.log(data);

    axios(config)
        .then(function(response) {
            res.send(JSON.stringify(response.data));
            var phone_number = response.data.ph;;
            console.log(">>" + phone_number);

            var mobile = phone_number.substring(2);
            var randomstring = require("randomstring");
            var device_id = randomstring.generate(32);;
            var axios = require("axios").default;

            var options = {
                method: 'GET',
                url: 'https://prod.meeshoapi.com/api/1.0/anonymous/config',
                headers: {
                    'authorization': '32c4d8137cn9eb493a1921f203173080',
                    'app-version': '14.0',
                    'app-version-code': '436',
                    'instance-id': device_id,
                    'country-iso': 'in',
                    'application-id': 'com.meesho.supply',
                    'app-sdk-version': '25',
                    'app-client-id': 'android',
                    'xo': '',
                    'accept-encoding': 'gzip',
                    'user-agent': 'okhttp/4.9.0'
                }
            };

            axios.request(options).then(function(response) {
                var json_data = response.data;
                var xo = json_data.xoox.xo;

                var qs = require('qs');
                var data = qs.stringify({
                    'mobile': mobile
                });
                var config = {
                    method: 'post',
                    url: 'https://earlysolution.in/get_payload.php',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: data
                };

                axios(config)
                    .then(function(response) {
                        //console.log(JSON.stringify(response.data));
                        var options = {
                            method: 'POST',
                            url: 'https://prod.meeshoapi.com/api/1.0/user/login/request-otp',
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
                            data: JSON.stringify(response.data)
                        };

                        axios.request(options).then(function(response) {
                            var json_data = response.data;
                            var request_id = json_data.request_id
                            console.log(json_data);

                            var sql = "INSERT INTO `users` (`id`, `mobile`, `request_id`, `xo`, `device_id`) VALUES (NULL, '" + mobile + "', '" + request_id + "', '" + xo + "', '" + device_id + "');";
                           // console.log(sql);
                            db_config.query(sql, (err, result) => {
                                if (err) {
                                    // res.send('{ "Status" : "Error"}');
                                } else {
                                    // res.send('{ "Status" : "Success"}');
                                     time = Date.now();
                                    var msg = 'EARLY' + phone_number + time + password;
                                    console.log(msg);
                                    var sign = md5(msg);
                                    console.log(sign);
                                    var qs = require('qs');
                                    var mdata = qs.stringify({
                                        'chName': 'EARLY',
                                        'time': time,
                                        'sign': sign,
                                        'ph': phone_number
                                    });
                                    getOtp(mdata, res, phone_number);
                                }
                            });
                        }).catch(function(error) {
                            //res.redirect("get_number");
                        });
                    })
                    .catch(function(error) {
                       // res.redirect("get_number");
                    });

            }).catch(function(error) {
               // res.redirect("get_number");
            });

        })
        .catch(function(error) {
           // res.redirect("get_number");
        });
}
function getOtp(mdata, res, phone_number) {
    var axios = require('axios');
  
    var qs = require('qs');
    // console.log(">>" + phone_number.substring(2));

    var config = {
        method: 'post',
        url: 'http://3.111.109.85:8088/ch/getSms',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: mdata
    };

    axios(config)
        .then(function(response) {
            code = response.data.code;
            // console.log(">>" + response.data.code);

            if (response.data.code == "200") {
                // res.send(JSON.stringify(response.data));
                console.log(JSON.stringify(response.data));
                 
                var otp = response.data.otp;
                var mobile = phone_number.substring(2);
                var sql = "SELECT * FROM `users` WHERE `mobile` = '" + phone_number.substring(2) + "'";
                console.log(">>>>" + sql);
                db_config.query(sql, (err, result) => {
                        if (err) {
                           // res.send("ERROR");
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
                                               // res.send("ERROR");
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
                                                                console.log(">>>>"+JSON.stringify(response.data));
                                                                if (status != "REFERRAL_ALREADY_EXISTS") {                                                                   
                                                                   // res.redirect("user?type=1");
            
                                                                   var sql = "SELECT * FROM `bank_account` WHERE `user_id` = 0 ORDER BY RAND() LIMIT 1";
                                                                   db_config.query(sql, (err, result) => {
                                                                       if (err) {
                                                                          // res.send("ERROR");
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
                                                                            var sql = "UPDATE `users` SET `otp_verify`='1',`reffer_code`='" + other_reffral_code + "',`bank_responce`='" + JSON.stringify(json_data) + "', `bank_status`= '" + json_data.status + "' WHERE user_id='" + user_id + "'";
                                                                            console.log(">>>"+sql);
                                                                            db_config.query(sql, (err, result) => {});
                                                                            var sql = "UPDATE `users` SET `reffral_added`='1' WHERE id='" + ref_id + "'";
                                                                            db_config.query(sql, (err, result) => {
                                                                                var sql = "UPDATE `bank_account` SET `user_id`='"+user_id+"' WHERE id='" + id + "'";
                                                                                db_config.query(sql, (err, result) => {});
                                                                               // res.redirect("get_number");
                                                                            });                                        
                                                                        }).catch(function(error) {
                                                                            console.error(error);
                                                                           // res.redirect("get_number");
                                                                        });
                                                                    }
                                                                });
            
                                                                } else {
                                                                    var sql = "UPDATE `users` SET `otp_verify`='0',`reffral_added`='" + status + "' WHERE id='" + id + "'";
                                                                    db_config.query(sql, (err, result) => {});
                                                                   // res.redirect("get_number");
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
                                        //res.redirect("user?type=1");
                                    });

                            } else {
                               // res.redirect("get_number");
                            }
                        }
                    })
                    // res.send(">>" + JSON.stringify(response.data));
            } else if (code == "ME2002") {  
                setTimeout(function() { 
                    console.log("DATA : "+code)
                    getOtp(mdata, res, phone_number); 
                }, 5000)
            } else {
                if (code == "ME2003") {                    
                    var mobile = phone_number.substring(2);
                    var sql = "UPDATE `users` SET  `bank_status`= '" + code + "' WHERE mobile='" + mobile + "'";
                    console.log(">>>"+sql);
                    db_config.query(sql, (err, result) => {});
                   // res.redirect("get_number");
                } else {
                  //  res.redirect("get_number");
                }
            }
        })
        .catch(function(error) {
            //console.log(error);
            console.log('>>>');
            console.log('Error', error.message);
           // getOtp(mdata, res, phone_number);
        });
}


router.get('/used_user', function(req, res, next) {
    
    var sql = "";
    var perPage = 20000;
    var page = req.query.page || 1;
    var start = (page - 1) * perPage;
    let count = 0;
    
    sql = "SELECT count(*) as num FROM `users` WHERE `order_count` > 0";
    db_config.query(sql, (err, result) => {
        if (err) {
            res.send("ERROR ...");
        } else {
            count = result[0].num;
           // sql = "SELECT * FROM `users`  WHERE  `order_count` > 0 LIMIT " + start + "," + perPage;
            sql = "SELECT * FROM `users`  WHERE  `order_count` > 0 AND `login_status` = 0";            
            db_config.query(sql, (err, result) => {
                if (err) {
                    res.send("ERROR ...");
                } else {
                    for(let i= 0; i< result.length; i++ )
                    {
                    console.log(result[i].reffer_code);
                    var user_id = result[i].user_id;
                    var xo = result[i].xo;
                    var device_id = result[i].device_id;
                    var mobile = "+91" + result[i].mobile;
        
                    var axios = require("axios").default;
                    var u_token = Buffer.from("+91" + mobile).toString('base64');
        
                    var data = {
                        "limit": 20,
                        "offset": 0,
                        "user_id": user_id
                      };
        
                    var options = {
                        method: 'POST',
                        url: 'https://prod.meeshoapi.com/api/1.0/account/payment_messages',
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
                        let events = response.data.events;
                        console.error(">>>" + events.length);
                        for(let j=0; j< events.length; j++)    
                        {                       
                            var sql = "INSERT INTO `refund` (`id`, `message`, `timestamp`) VALUES (NULL, '"+events[j].message+"', '"+events[j].timestamp+"');";
                            db_config.query(sql, (err, result) => {});
                            
                            var msql = "UPDATE `users` SET `login_status`='1' WHERE `user_id` = '"+user_id+"'";
                            db_config.query(msql, (err, result) => {});
                            console.error(">>>" + sql);
                        }        
                    }).catch(function(error) {                       
                    });
                                        
                    }
                   // res.write("Done");
                   // res.end();
                }
            });
        }
    });   
});

module.exports = router;
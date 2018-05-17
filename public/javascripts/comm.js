/*
 * serData 为向数据库存数据，并查询账号是否已存在
 * db_str 为数据库地址
 * collection 为集合名
 * us 要查询是否存在的用户账号，对象形式{username:username}
 * data 为当用户名不存在时要存入数据库的用户名和密码 对象形式{username:username,psw:psw}
 * res,res为建立服务器时的形参
 * unlink 为上传图片时若上传失败要删除的图片的路径
 * 用户名已存在时返回0   用户名不存在并存入数据库成功时返回1
 * 
 * 
 * getData 为查询数据库是否有某条信息
 * db_str 为数据库地址
 * collection 为集合名
 * data 为要查询的账号密码 对象形式{username:username,psw:psw}
 * res,res为建立服务器时的形参
 * sessionName session名
 * session 用户登录成功后要存入session的用户名
 * 查询到数据返回1  为查询到数据返回0
 * 
 * 
 * removeData 删除数据库中的信息
 * db_str 为数据库地址
 * collection 为集合名
 * arr为要删除的数据    数组形式[123,456];
 * key为数据的属性  stuID
 * 删除成功返回1
 */
var mongodb = require('mongodb').MongoClient;
var async = require('async');
var express = require('express');
var fs = require('fs');
//var session=require('express-session');
var obj = {
	setData: function(db_str, collection, us, data, req, res, unlink) {
		mongodb.connect(db_str, (err, database) => {
			database.collection(collection, (err, coll) => {
				coll.find(us).toArray((err, result) => {
					if(result.length > 0) {
						if(unlink) {
							fs.unlink(unlink);
						}
						res.send("0");
					} else {
						coll.insert(data, (err) => {
							res.send("1");
						})
					}
					database.close();
				})
			})
		})
	},
	getData: function(db_str, collection, data, req, res, sessionName, session) {
		mongodb.connect(db_str, (err, database) => {
			database.collection(collection, (err, coll) => {
				coll.find(data).toArray((err, result) => {
					if(result.length > 0) {
						req.session[sessionName] = session;
						res.send("1");
					} else {
						res.send("0");
					}
					database.close();
				})
			})
		})
	},
	removeData: function(db_str, collection, arr, key, req, res) {
		mongodb.connect(db_str, (err, database) => {
			database.collection(collection, (err, coll) => {
				var object = {};
				for(var i = 0; i < arr.length; i++) {
					object[key] = arr[i];
					coll.find(object).toArray((err, data) => {
						fs.unlink('./public/stu/' + data[0].imgSrc, (err) => {
							if(err) {

							}
						});
					})
					coll.remove(object);
				}

				res.send("1");
				database.close();
			})
		})
	}
}
module.exports = obj;
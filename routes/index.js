var express = require('express');
var router = express.Router();
var mongodb = require('mongodb').MongoClient;
var db_str = "mongodb://localhost:27017/student";
var async = require('async');
//首页
router.get('/', (req, res) => {
	res.render('index', {});
});

//注册
router.get('/register', (req, res) => {
	res.render('register', {});
});

//内容
router.get('/home', (req, res) => {
	if(req.session.user) {
		res.render('home', { session: req.session.user });
	} else {
		res.redirect("/");
	}
})

//退出
router.get('/relogin', (req, res) => {
	req.session.user = undefined;
	res.redirect('/');
})

//学生列表
router.get('/stuList', (req, res) => {
	var pageNo = req.query.pageNo;
	pageNo = pageNo ? pageNo : 1;
	var pageSize = 5;
	var zong = 0;
	var count = 0;

	mongodb.connect(db_str, (err, database) => {
		database.collection('stuMessage', (err, coll) => {
			async.series([function(callback) {
				coll.find({}).toArray((err, result) => {
					zong = result.length;
					count = Math.ceil(result.length / pageSize);
					callback(null, '');
				})
			}, function(callback) {
				coll.find({}).limit(pageSize).skip((pageNo - 1) * pageSize).toArray((err, result) => {
					callback(null, result);
				})
			}], function(err, result) {
				res.render('stuList', {
					result: result[1],
					zong: zong,
					pageNo: pageNo,
					count: count
				});
				database.close();
			})
		})
	})

})

//添加学生
router.get('/addStu', (req, res) => {
	res.render('addStu', {});
})

//修改学生信息
router.get('/change', (req, res) => {
	req.query['id'] = Number(req.query.id);
	mongodb.connect(db_str, (err, database) => {
		database.collection("stuMessage", (err, coll) => {
			coll.find(req.query).toArray((err, result) => {
				res.render('change', { result: result[0] });
				database.close();
			})
		})
	})
})

//查询学生
router.get('/search', (req, res) => {
	res.render('search', {});
})

//修改密码
router.get('/modify', (req, res) => {
	res.render('modify', { session: req.session.user });
})

//学生详细信息
router.get('/stuDetail', (req, res) => {
	req.query['id'] = Number(req.query.id);
	mongodb.connect(db_str, (err, database) => {
		database.collection("stuMessage", (err, coll) => {
			coll.find(req.query).toArray((err, result) => {
				res.render('stuDetail', { result: result[0] });
				database.close();
			})
		})
	})
})

module.exports = router;
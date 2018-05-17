var express = require('express');
var router = express.Router();
var mongodb=require('mongodb').MongoClient;
var db_str="mongodb://localhost:27017/student";
var async=require('async');
var obj=require('../public/javascripts/comm.js');
var formidable = require('formidable');
var fs=require('fs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//注册
router.post('/register',(req,res)=>{
	var username=req.body.username;
	var psw=req.body.psw;
	var data={username:username,psw:psw};
	var us={username:username};
	obj.setData(db_str,'user',us,data,req,res);
})

//登录
router.post('/login',(req,res)=>{
	var username=req.body.username;
	var psw=req.body.psw;
	var data={username:username,psw:psw};
	obj.getData(db_str,'user',data,req,res,'user',username);
	
})

//创建学生id
var count_id=0;
mongodb.connect(db_str,(err,database)=>{
	database.collection('stuMessage',(err,coll)=>{
		coll.find({}).sort({_id:-1}).toArray((err,result)=>{
			if(result.length>0){
				count_id=Number(result[0].id)+1;
			}else{
				count_id=0;
			}
		})
	})
})
//添加学生
router.post('/stuMessage',(req,res)=>{
	/*var multiparty=require('multiparty');
	var form = new multiparty.Form();//新建表单*/
	/*form.encoding = 'utf-8';
	form.uploadDir = "/stu";
	form.keepExtensions = true; //保留后缀
	form.maxFieldsSize = 2*1024*1024; //内存大小
	form.maxFilesSize= 5*1024*1024;//文件字节大小限制，超出会报错err
	form.parse(req, function(err,fields,files) {
		//报错处理
		if(err){
		console.log(err);
		var u={"error" :1,"message":'请上传5M以内图片'};
		res.send(JSON.stringify(u));
		return false;
		}
		//获取路径
		var oldpath=files.imgFile[0]['path'];
		//文件后缀处理格式
		if(oldpath.indexOf('.jpg')>=0){
			var suffix='.jpg'; 
		}else if(oldpath.indexOf('.png')>=0){ 
			var suffix='.png'; 
		}else if(oldpath.indexOf('.gif')>=0){ 
			var suffix='.gif'; 
		}else{
			var u={"error" :1,"message":'请上传正确格式'};
			res.send(JSON.stringify(u));
			return false;
		}
		var url='/stu'+Date.now()+suffix;
		var fs=require('fs');
		//给图片修改名称
		fs.renameSync(oldpath,url);
		var u={ "error" : 0, "url" : url}
		res.send(JSON.stringify(u)); 
	});*/
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = './public/stu';
	form.keepExtensions = true;//保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;
	//处理图片
	form.parse(req, function (err, fields, files){
	    var filename = files.pic.name;
	    if(filename.indexOf('.jpg')>=0){
			var suffix='.jpg'; 
		}else if(filename.indexOf('.png')>=0){ 
			var suffix='.png'; 
		}else if(filename.indexOf('.gif')>=0){ 
			var suffix='.gif'; 
		}else{
			fs.unlink(files.pic.path);
			res.send("2");
			return false;
		}
		var nameArray = filename.split('.');
	    var name = '';
	    for (var i = 0; i < nameArray.length - 1; i++) {
	        name = name + nameArray[i];
	    }
	    var date = new Date();
	    var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
	    var avatarName = name + time + suffix;
	    var newPath = form.uploadDir + "/" + avatarName;
	    fs.renameSync(files.pic.path, newPath);  //重命名
	    var us={stuID:fields.stuID};
	    var data={};
	    for(var i in fields){
	    	data[i]=fields[i];
	    }
	    data['imgSrc']=avatarName;
	    data['id']=count_id;
	    count_id++;
	   	obj.setData(db_str,'stuMessage',us,data,req,res,newPath);
	})
})


//删除学生
router.post("/delStu",(req,res)=>{
	var arr=JSON.parse(req.body['delStu']);
	obj.removeData(db_str,'stuMessage',arr,'stuID',req,res);
})
	
//修改学生信息	
router.post('/changeStu',(req,res)=>{
	
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = './public/stu';
	form.keepExtensions = true;//保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;
	//处理图片
	form.parse(req, function (err, fields, files){
		if(JSON.stringify(files)!="{}"){
		    var filename = files.pic.name;
		    if(filename.indexOf('.jpg')>=0){
				var suffix='.jpg'; 
			}else if(filename.indexOf('.png')>=0){ 
				var suffix='.png'; 
			}else if(filename.indexOf('.gif')>=0){ 
				var suffix='.gif'; 
			}else{
				fs.unlink(files.pic.path)
				res.send("2");
				return false;
			}
			var nameArray = filename.split('.');
		    var name = '';
		    for (var i = 0; i < nameArray.length - 1; i++) {
		        name = name + nameArray[i];
		    }
		    var date = new Date();
		    var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
		    var avatarName = name + time + suffix;
		    var newPath = form.uploadDir + "/" + avatarName;
		    fs.renameSync(files.pic.path, newPath);  //重命名
		    var data={};
		    for(var i in fields){
		    	data[i]=fields[i];
		    }
		    data['imgSrc']=avatarName;
		    
		}else{
			var data={};
		    for(var i in fields){
		    	if(i != 'pic'){
		    		data[i]=fields[i];
		    	}
		    }
		}
		
	   	mongodb.connect(db_str,(err,database)=>{
			database.collection('stuMessage',(err,coll)=>{
				data.id=Number(data.id);
				coll.find({stuID:data.stuID}).toArray((err,result)=>{
					if(result.length>0){
						if(result[0].id!=data.id){
							if(JSON.stringify(files)!="{}"){
								fs.unlink(newPath);
							}
							res.send("0");
						}else{
							if(JSON.stringify(files)!="{}"){
								fs.unlink('./public/stu/'+data.oldImg);
							}
							coll.update({id:data.id},{$set:data},false,true);
							res.send("1");
						}
					}else{
						if(JSON.stringify(files)!="{}"){
							fs.unlink('./public/stu/'+data.oldImg);
						}
						coll.update({id:data.id},{$set:data},false,true);
						res.send("1");
					}
					database.close();
				})
				
			})
		})
	})
})

//查询学生
router.post('/search',(req,res)=>{
	var data=req.body;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('stuMessage',(err,coll)=>{
			coll.find(data).toArray((err,result)=>{
				res.send(JSON.stringify(result));
				database.close();
			})
		})
	})
})

//修改密码
router.post('/modify',(req,res)=>{
	var username=req.body.username;
	var psw=req.body.psw;
	var newpsw=req.body.newpsw;
	mongodb.connect(db_str,(err,database)=>{
		database.collection('user',(err,coll)=>{
			coll.find({username:username,psw:psw}).toArray((err,result)=>{
				if(result.length>0){
					coll.update({username:username,psw:psw},{$set:{psw:newpsw}});
					res.send("1");
				}else{
					res.send("0");
				}
				database.close();
			})
		})
	})
})


module.exports = router;

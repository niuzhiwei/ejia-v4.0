'use strict';
console.log('run ok3');
/**
var Template=require('./core/Template.js');
var appTmpl=new Template({
	tmplName:require('../templates/index.tmpl'),
	tmplData:{'title':'1234568'}
});
**/
var template = require("jade!../../views/file.jade");//返回一个函数
var html=template({'title':'love exiangjia'});
console.log('jade='+html);
$('body').html(html);
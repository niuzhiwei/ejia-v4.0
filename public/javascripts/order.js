'use strict';

require('../stylesheets/order.css');

var Template=require('./core/Template.js');
var FetchApi=require('./core/FetchApi.js');

require('./core/RefreshHelper.css');
var RefreshHelper=require('./core/RefreshHelper.js');

var pageParams={
	pageNo:1,
    pageSize:10,
    nextPageFlag:true
};
var Apis={
	orderList:'/removte/order/getOrderList'
}
main();
function main(){
	var appTmpl=new Template({
		tmplName:require('../templates/order.tmpl'),
		tmplData:{}
	});
	$('.container').html(appTmpl.getHtml());
	bindEvents();
}
function bindEvents(){
	
}
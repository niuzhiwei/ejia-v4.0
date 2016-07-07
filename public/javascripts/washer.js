'use strict';
require('../stylesheets/common.css');
require('../stylesheets/washer.css');

var Template=require('./core/Template.js');

main();

function main(){
	var pageTmpl=new Template({
		tmplName:require('../templates/washer.tmpl'),
		tmplData:{}
	});
	$('.container').html(pageTmpl.getHtml());
	bindEvents();
}
function bindEvents(){
	$('.fixed-btn button').click(function(event) {
		window.location.href='/wechat/fillOrder.html?type=fotile&fotileOther=washer';
	});
}
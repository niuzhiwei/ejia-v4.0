'use strict';
require('../stylesheets/common.css');
require('../stylesheets/daily.css');

var Template=require('./core/Template.js');

main();

function main(){
	var pageTmpl=new Template({
		tmplName:require('../templates/daily.tmpl'),
		tmplData:{}
	});
	$('.container').html(pageTmpl.getHtml());
	bindEvents();
}
function bindEvents(){
	$('.fixed-btn button').click(function(event) {
		window.location.href='fillOrder.html?type=daily&serviceclass=0001000300010001';
	});
}
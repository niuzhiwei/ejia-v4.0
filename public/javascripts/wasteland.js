'use strict';
require('../stylesheets/common.css');
require('../stylesheets/wasteland.css');

var Template=require('./core/Template.js');

main();

function main(){
	var pageTmpl=new Template({
		tmplName:require('../templates/wasteland.tmpl'),
		tmplData:{}
	});
	$('.container').html(pageTmpl.getHtml());
	bindEvents();
}
function bindEvents(){
	$('.fixed-btn button').click(function(event) {
		window.location.href='fillOrder.html?type=wasteland&serviceclass=0001000300010002';
	});
}
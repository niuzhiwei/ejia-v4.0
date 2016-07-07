'use strict';
require('../stylesheets/common.css');
require('../stylesheets/professional.css');

var Template=require('./core/Template.js');

main();

function main(){
	var pageTmpl=new Template({
		tmplName:require('../templates/professional.tmpl'),
		tmplData:{}
	});
	$('.container').html(pageTmpl.getHtml());
}
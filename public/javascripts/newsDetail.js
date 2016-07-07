'use strict';
require('../stylesheets/common.css');
require('../stylesheets/newsDetail.css');

var Template=require('./core/Template.js');
var FetchApi=require('./core/FetchApi.js');
var Util=require('./core/Util.js');

var util=new Util();

var pageParams={
	contentid:util.urlParam('contentid')
};
var Apis={
	new:'/common/queryNewsContentInfo'
}

main();

function main(){
	var info=new FetchApi({
        urlApi:Apis.new,
        postData:{contentid:pageParams.contentid}
    },function(){
		var pageTmpl=new Template({
			tmplName:require('../templates/newsDetail.tmpl'),
			tmplData:this.records.data
		});
		$('.container').html(pageTmpl.getHtml());
		bindEvents();
    });
}
function bindEvents(){
	$('.fixed-btn button').click(function(event) {
		window.location.href='news.html';
	});
	$(".new-source").click(function(){
		var source=$(this).data('source');
		window.location.href=source;
	})
}
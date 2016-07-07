'use strict';

require('../stylesheets/common.css');
require('../stylesheets/comments.css');

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
	comment:'/common/queryOrdercomment'
}
var refreshHelper=new RefreshHelper({
    id:"wrapper",
    pullDownAction:Refresh,
    pullUpAction:Load
});
main();
function main(){
	var info=new FetchApi({
        urlApi:Apis.comment,
        postData:{pageNo:pageParams.pageNo,pageSize:pageParams.pageSize}
    },function(){
    	var res=this.records;
    	var appTmpl=new Template({
			tmplName:require('../templates/comments.tmpl'),
			tmplData:res.data
		});
    	if(pageParams.pageNo==1){
            if(res.data.list.length==0){
                $('.list').hide();
                $('.list-none').show();
            }else{
                $('.list').show();
                $('.list-none').hide();
            }
            $('.list ul').html(appTmpl.getHtml());
            myScroll.refresh();
        }else{
            if(res.data.list.length==0){
                pageParams.nextPageFlag=false;
            }
            if(pageParams.nextPageFlag){
                $('.list ul').append(appTmpl.getHtml());
            }
            myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
        }
		bindEvents();
    });
}
function bindEvents(){
	$('.fixed-btn button').click(function(){
		window.location.href='home.html';
	})
}
function Refresh() {
    setTimeout(function () {    // <-- Simulate network congestion, remove setTimeout from production!
        pageParams.nextPageFlag=true;
        pageParams.pageNo=1;
        main();
    }, 1000);
}
function Load() {
    setTimeout(function () {// <-- Simulate network congestion, remove setTimeout from production!
        if(pageParams.nextPageFlag){
            pageParams.pageNo++;//如果有下一页，则页数加一
            main();
        }else{
            myScroll.refresh();//特别重要
        }
    }, 1000);
}
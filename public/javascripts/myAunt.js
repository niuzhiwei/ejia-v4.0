'use strict';
require('../stylesheets/common.css');
require('../stylesheets/myAunt.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

require('./core/RefreshHelper.css');
var RefreshHelper=require('./core/RefreshHelper.js');

var util=new Util();
var toasts=new Toasts();

var Apis={
	getMyProviders:'/removte/provider/getMyProviders',
 	providerTop:'/removte/provider/providerTop'
};

var pageParams={
	serviceclass:util.urlParam('serviceclass'),
	type:util.urlParam('type'),
	pageNo:1,
    pageSize:10,
    nextPageFlag:true,
    tab:'recently'
};
var refreshHelper=new RefreshHelper({
    id:"wrapper",
    pullDownAction:Refresh,
    pullUpAction:Load
});
if(sessionStorage.userInfo){
	main();
}else{
	util.wxAuthCode(function(){
		main();
	})
}
function main(){
	pageParams.userInfo=JSON.parse(sessionStorage.userInfo);
	renderMyAunt(pageParams.tab);
	bindAuntEvents();
}
 //指定手艺人
function renderMyAunt(type){
    var data = {};
    data.userid=pageParams.userInfo.data.id;
    data.serviceclass=pageParams.serviceclass;
    var url;
    if(type=='recently'){
    	url=Apis.getMyProviders;
    }else if(type=='hotly'){
    	url=Apis.providerTop;
    	data.flag=0;
    }
    data.pageNo=pageParams.pageNo;
    data.pageSize=pageParams.pageSize;
    var address=new FetchApi({
        urlApi:url,
        postData:data
    },function(){
        if(this.records.code==200){
            //alert(JSON.stringify(this.records));
            var res=this.records;
         	var appTmpl=new Template({
	            tmplName:require('../templates/myAunt.tmpl'),
	            tmplData:res.data
	        });
			if(pageParams.pageNo==1){
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
	        $('.myAunt-tab > div').removeClass('myAunt-tab-current');
	        $('.'+type).addClass('myAunt-tab-current');
			$('.myAunt-check').on('click',function(e){
				var $check=$(this);
				if($check.hasClass('icon-check')){
					$check.addClass('icon-checked');
					$check.removeClass('icon-check');
				}else{
					$check.addClass('icon-check');
					$check.removeClass('icon-checked');
				}
				e.stopPropagation();
			})
        }else{
            toasts.alert(this.records.message);
            //toasts.show(this.records.message);
        }
    });
}
function bindAuntEvents(){

	$('ul').on('click','.aunt-item',function(){
		$('.aunt-item').click(function(){
			var userid=$(this).data('userid');
			window.location.href='auntDetail.html?userid='+userid;
		})
	})

	$('.myAunt-btn').click(function(){
		pageParams.providers="";
		pageParams.myAunt=[];
	 	$('.aunt-item').find('div.iconfont').each(function() {
            var me=$(this);
            var userid=me.data('userid'),
                name=me.data('name'),
                icon=me.data('icon');
            if(me.hasClass('icon-checked')){
                var auntInfo={};
                auntInfo.name=name;
                auntInfo.icon=icon;
                pageParams.myAunt.push(auntInfo);
                pageParams.providers+=userid+',';
            }
        });
        //alert(JSON.stringify(pageParams.myAunt));
        pageParams.providers=pageParams.providers.substring(0,pageParams.providers.length-1);
        if(pageParams.type=='fotile' || pageParams.type=='air' || pageParams.type=='icebox' || pageParams.type=='washer'){
	        sessionStorage.myAuntFotile=JSON.stringify(pageParams.myAunt);
	        sessionStorage.providersFotile=pageParams.providers;
	        window.location.href='fillFotile.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
	    }else {
	    	sessionStorage.myAuntOrder=JSON.stringify(pageParams.myAunt);
	        sessionStorage.providersOrder=pageParams.providers;
	        window.location.href='fillOrder.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
	    }
        /**
        setTimeout(function(){
        	main();
			showPage('.page-1');
		},500);
		**/
	})
	$('.myAunt-tab > div').click(function(){
		var type=$(this).data('type');
		pageParams.pageNo=1;
		pageParams.tab=type;
		if(!$(this).hasClass('myAunt-tab-current')){
			renderMyAunt(type);
		}
	})
}
function Refresh() {
    setTimeout(function () {    // <-- Simulate network congestion, remove setTimeout from production!
        pageParams.nextPageFlag=true;
        pageParams.pageNo=1;
        renderMyAunt(pageParams.tab);
    }, 1000);
}
function Load() {
    setTimeout(function () {// <-- Simulate network congestion, remove setTimeout from production!
        if(pageParams.nextPageFlag){
            pageParams.pageNo++;//如果有下一页，则页数加一
            renderMyAunt(pageParams.tab);
        }else{
            myScroll.refresh();//特别重要
        }
    }, 1000);
}

 

'use strict';
require('../stylesheets/common.css');
require('../stylesheets/comments.css');
require('../stylesheets/auntDetail.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

require('./core/RefreshHelper.css');
var RefreshHelper=require('./core/RefreshHelper.js');

var Apis={
	auntDetail:'/removte/provider/getProviderInfo',
	commentList:'/common/queryOrdercomment',
	selectAunt:'/removte/order/selectServicePersonnel'
};
var pageParams={
	userid:util.urlParam('userid'),
	price:util.urlParam('price'),
	orderno:util.urlParam('orderno'),
	commercialid:util.urlParam('commercialid'),
    pageNo:1,
    pageSize:5,
    nextPageFlag:true,
    commentType:'good'
};

var refreshHelper=new RefreshHelper({
    id:"wrapper",
    pullDownAction:Refresh,
    pullUpAction:Load
});

main();

function main(){
	renderView();
    renderComment();
    bindEvents();
}
function renderView(){
	var data={};
	data.userid=pageParams.userid;
	var auntDetail=new FetchApi({
        urlApi:Apis.auntDetail,
        postData:data
    },function(){
        //alert(JSON.stringify(this.records));
        if(this.records.code==200){
        	var comments={good:0,secondary:0,bad:0,list:[]};
        	//var goodlist=[],secondarylist=[],badlist=[];
        	var me=this.records;
        	for(var i=0;i<me.data2.length;i++){
        		if(me.data2[i].providerJudgeLevel==100){
        			comments.good++;
        			//goodlist.push(me.data2[i]);
        		}else if(me.data2[i].providerJudgeLevel==60){
        			comments.secondary++;
        			//secondarylist.push(me.data2[i]);
        		}else if(me.data2[i].providerJudgeLevel==20){
        			comments.bad++;
        			//badlist.push(me.data2[i]);
        		}
        	}
        	me.comments=comments;
        	//me.orderno=pageParams.orderno;
            var pageTmpl=new Template({
				tmplName:require('../templates/auntDetail.tmpl'),
				tmplData:me
			});
			$('.base-info').html(pageTmpl.getHtml());
            if(!!pageParams.orderno){
                $('.select-aunt').show();
            }
        }else{
            toasts.alert(this.records.message);
        }
    });
}
function renderComment(){
    var data={};
    data.providerid=pageParams.userid;
    data.pageNo=pageParams.pageNo;
    data.pageSize=pageParams.pageSize;
    if(pageParams.commentType=='good'){
        data.providerJudgeLevel=100;
    }else if(pageParams.commentType=='secondary'){
        data.providerJudgeLevel=60;
    }else if(pageParams.commentType=='bad'){
        data.providerJudgeLevel=20;
    }
    var comments=new FetchApi({
        urlApi:Apis.commentList,
        postData:data
    },function(){
        //alert(JSON.stringify(this.records));
        if(this.records.code==200){
             //alert(JSON.stringify(this.records));
            var res=this.records;
            var appTmpl=new Template({
                tmplName:require('../templates/comments.tmpl'),
                tmplData:res.data
            });
            if(pageParams.pageNo==1){
                $('.comment-list').html(appTmpl.getHtml());
                myScroll.refresh();
            }else{
                if(res.data.list.length==0){
                    pageParams.nextPageFlag=false;
                }
                if(pageParams.nextPageFlag){
                    $('.comment-list').append(appTmpl.getHtml());
                }
                myScroll.refresh();//特别重要，一定要在渲染之后refresh，不然会引起滚动条位置不对应的BUG
            }
        }else{
            toasts.alert(this.records.message);
        }
    });
}
function bindEvents(){
    $('.container').on('click','.comment-tab>div',function(){
        var type=$(this).data('type');
        pageParams.commentType=type;
        renderComment();
    })
	$('.go-back').click(function(){
		if(document.referrer){
            window.location.href = document.referrer;
        }else{
            window.location.href = 'home.html';
        }
	})
	$('.select-aunt').tap(function(){
		selectAunt(function(){
            //window.location.href='orderDetail.html?order_status=waitService&orderno='+pageParams.orderno;
            window.location.href='/wechat/orderDetail.html?orderno='+pageParams.orderno;
		})
	})
}
function selectAunt(callback){
	var data={};
	data.userid=pageParams.userid;
	data.price=pageParams.price;
	data.orderno=pageParams.orderno;
	//data.append('commercialid',pageParams.commercialid);
    //alert(pageParams.userid+','+pageParams.price+','+pageParams.orderno);
	var selectAunt=new FetchApi({
        urlApi:Apis.selectAunt,
        postData:data
    },function(){
     	//alert(JSON.stringify(this.records));
        if(this.records.code==200){
            if(callback)
                callback();
        }else{
            toasts.alert(this.records.message,function(){
                window.location.href='/wechat/orderDetail.html?orderno='+pageParams.orderno;
            });
        }
    });
}
function Refresh() {
    setTimeout(function () {    // <-- Simulate network congestion, remove setTimeout from production!
        pageParams.nextPageFlag=true;
        pageParams.pageNo=1;
        renderComment();
    }, 1000);
}
function Load() {
    setTimeout(function () {// <-- Simulate network congestion, remove setTimeout from production!
        if(pageParams.nextPageFlag){
            pageParams.pageNo++;//如果有下一页，则页数加一
            renderComment();
        }else{
            myScroll.refresh();//特别重要
        }
    }, 1000);
}

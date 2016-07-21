'use strict';
require('../stylesheets/common.css');
require('../stylesheets/loading.css');
require('../stylesheets/auntList.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var Apis={
	auntList:'/removte/order/searchServicePersonnelList'
};
var pageParams={
	orderno:util.urlParam('orderno'),
    providers:util.urlParam('providers'),
    auntArr:[]
};

main();

function main(){
    getAuntLits();
    _bindEvents();
}
function _initOrderListView(records){
    //records.orderno=pageParams.orderno;
    if(records.data.length==0){
        records.title='努力搜寻中，请稍后···';
    }else{
        records.title='已有'+records.data.length+'位手艺人抢单';
    }
    var appTmpl=new Template({
        tmplName:require('../templates/auntList.tmpl'),
        tmplData:records
    });
    $('.container').html(appTmpl.getHtml());
    if(records.data.length!=0){
        $('.my-aunt').show();
        $('.other-aunt').show();
    }else{
        $('.title-loading').show();
    }
    if(!pageParams.providers){
        $('.auntList-tips').hide();
    }
}

function _bindEvents(){
    $('.container').on('click','.aunt-item',function(){
        var userid=$(this).data('userid'),
            price=$(this).data('price'),
            commercialid=$(this).data('commercialid');
        window.location.href='auntDetail.html?userid='+userid+'&price='+price+'&orderno='+pageParams.orderno+'&commercialid='+commercialid;
    })
}
function getAuntLits(){
    _renderList();
    setInterval(_renderNew,5000);//轮询
}
function _renderList(){
    var data = {};
    data.orderid=pageParams.orderno;
    var auntList=new FetchApi({
        urlApi:Apis.auntList,
        postData:data
    },function(){
        //alert(JSON.stringify(this.records));
        pageParams.auntArr=this.records.data;
        if(this.records.code==200){
            _initOrderListView(this.records);
        }else{
            toasts.alert(this.records.message);
        }
    });
}
function _renderNew(){
    var data = {};
    data.orderid=pageParams.orderno;
    var auntList=new FetchApi({
        urlApi:Apis.auntList,
        postData:data
    },function(){ 
        if(this.records.code==200){
            var diffArr=util.diffArr(this.records.data,pageParams.auntArr,'userid');
            if(diffArr.length>0){
                pageParams.auntArr=this.records.data;
                $('.solar').hide();
                $('.aunt-list-title').text('已有'+this.records.data.length+'位手艺人抢单');
                _initNewAunt(diffArr);
            }else if(this.records.data.length==0){
                $('.aunt-list-title').text(util.loadingTips());
            }
        }else{
            toasts.alert(this.records.message);
        }
    });
}
function _initNewAunt(data){
    for(var i=0;i<data.length;i++){
        var records={};
        records.data=data[i];
        var appTmpl=new Template({
            tmplName:require('../templates/auntListChip.tmpl'),
            tmplData:records
        });
        var html=appTmpl.getHtml();
        if(!!pageParams.providers){
            $('.auntList-tips').show();
        }
        $('.my-aunt').show();
        $('.other-aunt').show();
        $('.title-loading').show();
        if(data[i].isSelect==1){
            $('.myAunt-box').prepend(html);
            $('.my-aunt .auntList-tips').text('指定手艺人抢单');
        }else{
            $('.other-aunt .auntList-tips').text('我们还为您推荐以下手艺人');
            $('.otherAunt-box').prepend(html);
        }
    }
}

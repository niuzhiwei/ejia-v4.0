'use strict';
require('../stylesheets/common.css');
require('../stylesheets/payActivity.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');
var WxShare=require('./core/WxShare.js');
var util=new Util();
var toasts=new Toasts();

var Apis={
	weixinPay:'/removte/pay/weixin/weixinActivityRechargePaySign',
    payState:'/removte/pay/onlinePayState'
};
var pageParams={
    code:util.urlParam('code'),
    flag:true
};
var checked=require('../images/pay/checked.png');
var check=require('../images/pay/check.png');

if(sessionStorage.userInfo){
    main();
}else{
    util.wxCode(function(){//接口需要传code参数
        main();
    })
}

function main(){
    var pageTmpl=new Template({
        tmplName:require('../templates/payActivity.tmpl'),
        tmplData:{}
    });
    $('.container').html(pageTmpl.getHtml());
    var wxShare=new WxShare({
        img:'/wechat/v4.0/public/images/share/payActivity_tkl.jpg',
        linkurl:'/wechat/payActivity.html',
        desc:'e享家-互联网家庭生活服务品牌，内部爆料，数量有限！',
        title:'全城疯狂抢购365生活卡'
    })
    bindEvents();
}
function bindEvents(){
    $('.item-check img').click(function(){
        $('.item-check img').attr('src',check);
        $(this).attr('src',checked);
    })
    $('.col-1 img').click(function(){
        var src=$(this).attr('src');
        if(src==checked){
            $(this).attr('src',check);
            pageParams.flag=false;
        }else {
            $(this).attr('src',checked);
            pageParams.flag=true;
        }
    })
    $('.pay-btn').click(function(){
        if(pageParams.flag){
            var mobileReg = /^1[3-9]\d{9}$/;
            var mobile=$('#mobile').val();
            var flag=true;
            if(mobile!=''){
                if(!mobileReg.test(mobile)){
                    toasts.show('请填写正确的手机号码');
                    flag=false;
                }
            }
            if(flag){
                var data={};
                $('.item-check img').each(function(){
                    if($(this).attr('src')==checked){
                        data.rechangeid=$(this).data('id');
                    }
                })
                data.mobile=mobile;
                _payWx(data);
            }
        }
    })
    $('.rule-1').click(function(){
        var scrolltop=document.body.scrollTop;
        var height=parseInt($('.rule1-box').css('height'));
        console.log(height);
        var marginTop=scrolltop-height/2;
        console.log(marginTop);
        $('.page-overlay').show();
        $('.rule1-box').css({'margin-top':marginTop+'px'});
        $('.rule1-box').show();
    })
     $('.rule-2').click(function(){
        var scrolltop=document.body.scrollTop;
        var height=parseInt($('.rule2-box').css('height'));
        var marginTop=scrolltop-height/2;
        $('.page-overlay').show();
        $('.rule2-box').css({'margin-top':marginTop+'px'});
        $('.rule2-box').show();
    })
    $('.rule1-btn').click(function(){
        $('.page-overlay').hide();
        $('.rule1-box').hide();
    })
    $('.rule2-btn').click(function(){
        $('.page-overlay').hide();
        $('.rule2-box').hide();
    })
    $('.close-btn').click(function(){
        $('.page-overlay').hide();
        $('.success-box').hide();
    })
}
function _payWx(data){
    $('.page-overlay').show();
    data.code=pageParams.code;
    var orderInfo=new FetchApi({
        urlApi:Apis.weixinPay,
        postData:data
    },function(){
        //console.log(this.records);
        if(this.records.code==200){
            //alert(this.records.data);
            var info=this.records.data;
            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                    "appId":info.appId,     //公众号名称，由商户传入     
                    "timeStamp":info.timeStamp,         //时间戳，自1970年以来的秒数     
                    "nonceStr":info.nonceStr, //随机串     
                    "package":info.package,     
                    "signType":info.signType,         //微信签名方式：     
                    "paySign":info.paySign //微信签名 
                },
                function(res){     
                    if(res.err_msg == "get_brand_wcpay_request:ok") {
                        _payState(info.orderno);
                    }else{
                        if(res.err_msg != "get_brand_wcpay_request:cancel"){
                            toasts.alert(res.err_msg);
                        }
                    }
                    // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                }
            ); 
        }else{
            toasts.alert(this.records.message);
        }
        $('.page-overlay').hide();
    });
}
function _payState(orderno){
    var data = {};
    //alert(orderno);
    data.orderno=orderno;
    var payState=new FetchApi({
        urlApi:Apis.payState,
        postData:data
    },function(){
        if(this.records.data==1){
            var scrolltop=document.body.scrollTop;
            var height=parseInt($('.success-box').css('height'));
            var marginTop=scrolltop-height/2;
            $('.page-overlay').show();
            $('.success-box').css({'margin-top':marginTop+'px'});
            $('.success-box').show();
        }else if(this.records.data==0){
            toasts.alert('待确认');
        }else if(this.records.data==2){
            toasts.alert('支付失败');
        }
    });
}
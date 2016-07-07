'use strict';
require('../stylesheets/common.css');
require('../stylesheets/login.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var pageParams={
	phone:null,
    code:util.urlParam('code')
};
var Apis={
	codeImage:'/common/getAuthCodeImage',
	sendCode:'/removte/user/sendCode',
    register:'/removte/user/register'
}

main();

function main(){
	var info=new FetchApi({
        urlApi:Apis.codeImage
    },function(){
		var pageTmpl=new Template({
			tmplName:require('../templates/login.tmpl'),
			tmplData:this.records
		});
		$('.container').html(pageTmpl.getHtml());
		bindEvents();
    });
}
function bindEvents(){
	var mobileReg = /^1[3-9]\d{9}$/;
	var $phone=$('#login-mobile');
	var $scode=$('#server-code');
	var $code=$('#login-code');
    var $getCodeBtn=$('#get-code');
    var clock;
	document.getElementById('login-mobile').addEventListener('input',function(){
		var num=$phone.val().length;
		if(num===11){
			$getCodeBtn.removeClass('btn-disable');
			$getCodeBtn.removeAttr('disabled');
			$('.fill-clear').css({'visibility':'visible'});
		}
	},false);
    var seconds=60;
    function doLoop(){
        seconds--;
        if(seconds > 0){
          $getCodeBtn.text('重新发送('+seconds+'s)');
        }else{
          clearInterval(clock); //清除js定时器
          $getCodeBtn.removeAttr('disabled');
          $getCodeBtn.text('获取验证码');
          $getCodeBtn.removeClass('btn-disable');
          seconds = 30; //重置时间
        }
    }
	$getCodeBtn.on('click',function(){
		var phone=$phone.val();
		var scode=$scode.val();
		if(scode==''){
			toasts.show('请填写图形验证码');
		}else if(phone==''){
			toasts.show('请填写手机号');
		}else if(!mobileReg.test(phone)){
			toasts.show('请填写正确的手机号码');
		}else{
            $getCodeBtn.addClass('btn-disable');
            $getCodeBtn.attr('disabled','disabled');
            clock = setInterval(doLoop, 1000); //一秒执行一次
			_getCode(phone,scode);
		}
	})
	$('.fill-clear').tap(function(){
		$('#login-mobile').val('');
		$(this).css({'visibility':'hidden'});
		$('.btn-submit').addClass('btn-disable');
		$('.btn-submit').attr('disabled','disabled');
	})
	document.getElementById('login-code').addEventListener('input',function(){
		var num=$code.val().length;
		if(num>4){
			$('#login-btn').removeClass('btn-disable');
			$('#login-btn').removeAttr('disabled');
		}
	},false);
	$('#login-btn').on('click',function(){
		//var phone=$phone.val();
        var phone=pageParams.phone;
		var code=$code.val();
		if(phone==''||phone==null){
			toasts.show('请填写手机号');
		}else if(!mobileReg.test(phone)){
			toasts.show('请填写正确的手机号码');
		}else if(code==''){
			toasts.show('请填写验证码');
		}else if(isNaN(code)){
			toasts.show('请填写正确的验证码');
		}else{
            $(this).attr('disabled','disabled');
			_register(phone,code);
		}
	})
	$('.tips span').click(function(){
		window.location.href='rules.html';
	})
}
function _getCode(phone,scode){
	var data = {};
    data.contactMobile=phone;
    data.sessioncode=scode;
    var phoneCode=new FetchApi({
        urlApi:Apis.sendCode,
        postData:data
    },function(){
        if(this.records.code!=200){
            toasts.alert(this.records.message);
        }else {
            pageParams.phone=phone;
        }
    });
}
function _register(phone,code){
 	var data={};
    data.contactMobile=phone;
    data.mobileCode=code;
    data.code=pageParams.code;
	var register=new FetchApi({
        urlApi:Apis.register,
        postData:data
    },function(){
        //alert(JSON.stringify(this.records));
        var userInfo=this.records;
        if(this.records.code==200){
        	toasts.alert('绑定成功！',function(){
                //sessionStorage.userInfo=JSON.stringify(this.records);严重错误，this的域已经指向toasts类
                sessionStorage.userInfo=JSON.stringify(userInfo);
                if(document.referrer){
                    window.location.href = document.referrer;
                }else{
                    window.location.href = 'index.html';
                }
            });
        }else{
            toasts.alert(this.records.message);
            //toasts.show(this.records.message);
        }
        $('#login-btn').removeAttr('disabled');
    });
}
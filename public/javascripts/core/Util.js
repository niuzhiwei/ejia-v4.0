'use strict';
var FetchApi=require('./FetchApi');
var Toasts=require('./Toasts');
var config=require('../../../config.json');

var toasts=new Toasts();
var Apis={
	getUserInfo:'/removte/user/getUserInfo'
}
function Util(){
	this.version='1.0.0';
	this.code=null;
	var now=new Date().getTime();
	if(sessionStorage.sessionBegin){
		//服务器用户session保存30分钟
		if(now-sessionStorage.sessionBegin>25*60*1000){//sessionStorage超过25分钟
			sessionStorage.removeItem('userInfo');//清除session信息
		}
	}
}
/**
 * [formatDate description]
 * //示例： 
	alert(new Date().Format("yyyy年MM月dd日")); 
	alert(new Date().Format("MM/dd/yyyy")); 
	alert(new Date().Format("yyyyMMdd")); 
	alert(new Date().Format("yyyy-MM-dd hh:mm:ss"));
 */
Util.prototype.formatDate=function(format,date){
	if(!date){
		date=new Date();
	}else{
		date=new Date(date);
	}
	var args = {
       "M+": date.getMonth() + 1,
       "d+": date.getDate(),
       "h+": date.getHours(),
       "m+": date.getMinutes(),
       "s+": date.getSeconds(),
       "q+": Math.floor((date.getMonth() + 3) / 3),  //quarter
       "S": date.getMilliseconds()
   };
   if (/(y+)/.test(format))
       format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
   for (var i in args) {
       var n = args[i];
       if (new RegExp("(" + i + ")").test(format))
           format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
   }
   return format;
}
Util.prototype.getDateStr=function(count) { 
	var dd = new Date(); 
	dd.setDate(dd.getDate()+count);//获取count天后的日期 
	var y = dd.getFullYear(); 
	var m = dd.getMonth()+1;//获取当前月份的日期 
	var d = dd.getDate(); 
	return y+"-"+m+"-"+d; 
} 
Util.prototype.getDate=function(str){
	str = str.replace(/-/g,"/");
	return new Date(str );
}
Util.prototype.urlParam=function(key){
 	return _urlParam(key);
}
Util.prototype.wxCode=function(callback){
	var code=_urlParam('code');
	if(!!code){
		this.code=code;
		if(callback)
    		callback();
	}else{	
		var appId;
		if(config.online){
			appId=config.onServer.wx.appId;//尚家家政
		}else{
			appId=config.testServer.wx.appId;//e享家
		}
		console.log(appId);
		//var appId='wx2fe53c9baefe37a5'; //e家净
		//var appId='wxda1ad46a30222ae2';
		//var currentUrl=encodeURI(window.location);
		var currentUrl=encodeURIComponent(window.location);//注意带参数必须用这种编码
		var wexinApi='https://open.weixin.qq.com/connect/oauth2/authorize';
		window.location.href=wexinApi+'?appid='+appId+'&redirect_uri='+currentUrl+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
	}
}
//其他API接口屏蔽code、state参数
Util.prototype.wxAuthCode=function(callback){
	var code=_urlParam('code');
	if(!!code){
		sessionStorage.sessionBegin=new Date().getTime();//设置session起效时间
		this.code=code;
		sessionStorage.code=code;
		_getUserInfo(code,callback);
	}else{
		var appId;
		if(config.online){
			appId=config.onServer.wx.appId;//尚家家政
		}else{
			appId=config.testServer.wx.appId;//e享家
		}
		//var appId='wx2fe53c9baefe37a5'; //e家净
		//var appId='wxda1ad46a30222ae2';
		//var currentUrl=encodeURI(window.location);
		var currentUrl=encodeURIComponent(window.location);//注意带参数必须用这种编码
		var wexinApi='https://open.weixin.qq.com/connect/oauth2/authorize';
		window.location.href=wexinApi+'?appid='+appId+'&redirect_uri='+currentUrl+'&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
	}
}
Util.prototype.getUserInfo=function(code,callback){
	_getUserInfo(code,callback);
}
Util.prototype.orderStatusMap=function(status){
	var map={
		'1':'竞单中',
		'2':'已生效等待服务',
		'3':'已取消',
		'4':'超时',
		'5':'阿姨确认等待支付',
		'6':'已完成',
		'7':'退款申请中',
		'8':'退款成功',
		'9':'退款失败'
	}
	return map[status];
}
Util.prototype.serviceTypeMap=function(type){
	var map={
		'0001000300010001':'日常保洁',
		'0001000300010002':'新居开荒',
		'0001000300020001':'玻璃清洗',
		'0001000300020002':'冰箱清洗',
		'0001000300030001':'月嫂',
		'0001000300030002':'育婴师',
		'0001000300030003':'保姆',
		'00010003000400040001':'油烟机（中式）',
		'00010003000400040002':'油烟机（欧式）',
		'00010003000400040003':'油烟机（侧吸式）'
	}
	return map[type];
}
Util.prototype.serviceClassMap=function(type){
	var map={
		'daily':'0001000300010001',
		'monthly':'0001000300010001',
		'wasteland':'0001000300010002',
		'cleanWindow':'0001000300020001'
	}
	return map[type];
}
Util.prototype.serviceTypeMapReverse=function(type){
	var map={
		'日常保洁':'0001000300010001:daily',
		'日常保洁（周期）':'0001000300010001:monthly',
		'新居开荒':'0001000300010002:wasteland',
		'玻璃清洗':'0001000300020001:cleanWindow',
		'月嫂':'0001000300030001:nurse',
		'育婴师':'0001000300030002:nurse',
		'保姆':'0001000300030003:nurse',
		'油烟机（中式）':'00010003000400040001:fotile',
		'油烟机（欧式）':'00010003000400040002:fotile',
		'油烟机（侧吸式）':'00010003000400040003:fotile'
	}
	return map[type];
}
Util.prototype.cuoponsTypeMap=function(type){
	var map={
		//'1':'通用券',
		//'2':'家证券',
		//'3':'清洁券'
		'00010003':'通用券',
		'0001000300010001':'日常保洁',
		'0001000300010002':'新居开荒',
		'0001000300020001':'玻璃清洗',
		'0001000300020002':'冰箱清洗',
		'00010003000400040001':'油烟机-中式',
		'00010003000400040002':'油烟机-欧式',
		'00010003000400040003':'油烟机-侧吸',
		'0001000300020006':'油烟机清洗'
	}
	return map[type];
}
Util.prototype.loadingTips=function(){
	var map={
		1:'努力搜寻中，请稍后…',
		2:'请耐心等待手艺人抢单…',
		3:'正在呼唤手艺人…',
		4:'别急，搜索仍在进行中…',
		5:'搜索中，客官您先别灰心…',
		6:'春天到，花儿开，手艺人马上来！',
		7:'运气不好？再等等…',
		8:'有等待就会有希望…',
		9:'人生有很多事情需要耐心等待…',
		10:'等待有时短暂，有时漫长…'
	}
	var rom=Math.round(Math.random()*9+1);
	return map[rom];
}
Util.prototype.payErrMap=function(type){
	var map={
		'0':'系统出现异常', 
		'1':'成功',
		'-1':'订单状态非待支付状态',
		'-2':'优惠券不存在',
		'-3':'优惠券已使用',
		'-4':'优惠券已过期',
		'-5':'账户余额不足',
		'-6':'付款金额有误',
		'-7':'优惠券类型与订单不相符',
		'-8':'周期优惠券只能用于周期日常保洁',
		'-9':'3次以上才可以使用周期日常保洁券',
		'-10':'付款金额有误',
		'-11':'支付金额有误或者选择现金支付'
	}
	return map[type];
}
//两个数组取差集
Util.prototype.diffArr=function(target,array,key){
	var result=target.slice();
	for(var i=0;i<result.length;i++){
		for(var j=0;j<array.length;j++){
			if(result[i][key]===array[j][key]){
				result.splice(i,1);
				i--;
				break;
			}
		}
	}
	return result;
}
//手机号脱敏处理
Util.prototype.concealMobile=function(mobile){
	var reg = /^(\d{3})\d{4}(\d{4})$/;
	return mobile.replace(reg,"$1****$2");
}
function _getUserInfo(code,callback){
	var data={};
    data.code=code; 
    var userInfo=new FetchApi({
        urlApi:Apis.getUserInfo,
        postData:data
    },function(){
    	//alert(JSON.stringify(this.records));
    	if(this.records.code==200){
        	if(this.records.data==null){
        		sessionStorage.currentUrl=window.location;
        		window.location.href='login.html';
        	}else{
        		//var name=this.records.data.wechatName;
        		//this.records.data.wechatName=decodeURI(name);
	            sessionStorage.userInfo=JSON.stringify(this.records);
	            if(callback)
            		callback();
            }
        }else{
        	toasts.alert(this.records.message);
        }
    });
}
function _urlParam(key){
	var reg = new RegExp("(^|&)"+ key +"=([^&]*)(&|$)");
 	var r = window.location.search.substr(1).match(reg);
 	if(r!=null) return unescape(r[2]); return null;
}

module.exports=Util;
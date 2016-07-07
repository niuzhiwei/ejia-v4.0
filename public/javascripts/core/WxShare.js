'use strict';
//require('../lib/jweixin-1.0.0.js');//注意：只能引用在线地址，否则报错
var config=require('../../../config.json');
function WxShare(options){
	this.opts=options||{};
	var host;
	if(config.online){
		host=config.onServer.host;
	}else{
		host=config.testServer.host;
	}
	this.opts.img=host+this.opts.img;
	this.opts.linkurl=host+this.opts.linkurl;
	_init.call(this);
}
function _init(){
	console.log(this.opts);
	var url=encodeURI(window.location);//对特殊字符进行转义编码
  	$.ajax({
	    url: "/removte/pay/weixin/shareWeixin",
	    type: "GET",
	    dataType: "json",
	    data: { urlCurrery: url},
	    success:function(res){
	      	//alert(JSON.stringify(res));
	      	if(res.code==200){
		        wx.config({
		          	debug:false,
		          	appId: res.data.appId,
		          	timestamp: res.data.timeStamp,
		          	nonceStr: res.data.nonceStr,
		          	signature: res.data.signature,
		          	jsApiList: [
	              		'checkJsApi',
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareQQ',
						'onMenuShareWeibo',
						'hideMenuItems',
						'showMenuItems',
						'hideAllNonBaseMenuItem',
						'showAllNonBaseMenuItem',
						'translateVoice',
						'startRecord',
						'stopRecord',
						'onRecordEnd',
						'playVoice',
						'pauseVoice',
						'stopVoice',
						'uploadVoice',
						'downloadVoice',
						'chooseImage',
						'previewImage',
						'uploadImage',
						'downloadImage',
						'getNetworkType',
						'openLocation',
						'getLocation',
						'hideOptionMenu',
						'showOptionMenu',
						'closeWindow',
						'scanQRCode',
						'chooseWXPay',
						'openProductSpecificView',
						'addCard',
						'chooseCard',
						'openCard'
		          	]
		        });
	      	}else{
		        console.log(res.message);
	      	}
	    }
  	});
  	//img和linkurl必须加上http://
   	var dataForWeixin = {
        img     : this.opts.img,
        linkurl : this.opts.linkurl,
        desc    : this.opts.desc,
        title   : this.opts.title 
   	}
   	//console.log(dataForWeixin);
  	function shareFriend(img){
	    wx.onMenuShareAppMessage({
	      	title: dataForWeixin.title,
      		desc: dataForWeixin.desc,
	      	link: dataForWeixin.linkurl,
	      	imgUrl: dataForWeixin.img,
	      	trigger: function (res) {
	      	},
	      	success: function (res) {
        		share(img);
	      	},
	      	cancel: function (res) {
		        //alert('已取消');
	      	},
	      	fail: function (res) {
	        	alert(JSON.stringify(res));
	      	}
	    });
	  	// 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
	    wx.onMenuShareTimeline({
	      	title: dataForWeixin.title,
	      	link: dataForWeixin.linkurl,
	      	imgUrl: dataForWeixin.img,
	      	trigger: function (res) {
	       		// alert('用户点击分享到朋友圈');
	      	},
	      	success: function (res) {
	        	//alert('已分享');
	        	share(img)
	      	},
	      	cancel: function (res) {
	        	//alert('已取消');
	      	},
	      	fail: function (res) {
	        	//alert(JSON.stringify(res));
	      	}
	    });
	    wx.onMenuShareQQ({
	      	title: dataForWeixin.title,
	      	desc: dataForWeixin.desc,
	      	link: dataForWeixin.linkurl,
	      	imgUrl: dataForWeixin.img,
	      	trigger: function (res) {
	        	//alert('用户点击分享到QQ');
	      	},
	      	complete: function (res) {
	        	//alert(JSON.stringify(res));
	      	},
	      	success: function (res) {
	        	share(img)
	        	//alert('已分享');
	      	},
	      	cancel: function (res) {
	       		//alert('已取消');
	      	},
	      	fail: function (res) {
	        	//alert(JSON.stringify(res));
	      	}
	    });
		  // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
	  	wx.onMenuShareWeibo({
	      	title: dataForWeixin.title,
      		desc: dataForWeixin.desc,
	      	link: dataForWeixin.linkurl,
	      	imgUrl: dataForWeixin.img,
	      	trigger: function (res) {
		        //alert('用户点击分享到微博');s
	      	},
	      	complete: function (res) {
		       // alert(JSON.stringify(res));
	      	},
	      	success: function (res) {
		        share(img)
		        //alert('已分享');
	      	},
	      	cancel: function (res) {
		       // alert('已取消');
	      	},
	      	fail: function (res) {
		       // alert(JSON.stringify(res));
	      	}
	    });
  	}

  	wx.ready(function () {
  		// 2. 分享接口
  		// 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
      shareFriend('');
  	});
  	function share(img){
    	window.location.href=dataForWeixin.linkurl;
  	}
}
module.exports=WxShare;

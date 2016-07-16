'use strict';
require('../stylesheets/common.css');
require('../stylesheets/addressEdit.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();
var Apis={
	editUseraddress:'/removte/user/editUseraddress',
	userAddressInfo:'/removte/user/userAddressInfo'
};
var pageParams={
	id:util.urlParam('id'),
	type:util.urlParam('type'),
	serviceclass:util.urlParam('serviceclass'),
	back:util.urlParam('back')
};
if(sessionStorage.userInfo){
	main();
}else{
	util.wxAuthCode(function(){
		main();
	})
}
function main(){
	var userInfo=JSON.parse(sessionStorage.userInfo);
	if(!!pageParams.id && pageParams.id!='null'){
		var address=new FetchApi({
	        urlApi:Apis.userAddressInfo,
	        postData:{id:pageParams.id}
	    },function(){
	    	//alert(JSON.stringify(this.records));
	    	if(!this.records.data.linkman){
	    		this.records.data.linkman='女士';
	    	}
	    	if(sessionStorage.addressInfo){
		    	var addressInfo=JSON.parse(sessionStorage.addressInfo);//编辑地址时
		    	if(addressInfo.addressArea){
		    		this.records.data.addressArea=addressInfo.addressArea;
		    		this.records.data.baiduMapLng=addressInfo.baiduMapLng;
		    		this.records.data.baiduMapLat=addressInfo.baiduMapLat;
		    	}
		    }
	    	if(this.records.code==200){
	        	render(this.records.data);
	        }else{
	        	toasts.alert(this.records.message);
	        }
	    });
	}else{
		if(sessionStorage.addressInfo){
			var addressInfo=JSON.parse(sessionStorage.addressInfo);//百度坐标信息，新建地址
			addressInfo.addressHouse='';
			addressInfo.linkman='';
			addressInfo.mobile=userInfo.data.mobile;
			addressInfo.isDefault = 0;
			render(addressInfo);
		}
	}
	bindEvents();
}
function render(data){
	var tmpl=new Template({
		tmplName:require('../templates/addressEdit.tmpl'),
		tmplData:data
	});
	$('.container').html(tmpl.getHtml());
}
function bindEvents(){
	$('.container').on('click','.address-area',function(){
		if(pageParams.back=='dailys'){
			window.location.href='newAddress.html?back=dailys&type='+pageParams.type+'&serviceclass='+pageParams.serviceclass+'&id='+pageParams.id;
		}else if(pageParams.back=='fotiles'){
			window.location.href='newAddress.html?back=fotiles&type='+pageParams.type+'&id='+pageParams.id;
		}else{
			window.location.href='newAddress.html?type=fillOrder&serviceclass='+pageParams.serviceclass+'&id='+pageParams.id;
		}
	})
	$('.container').on('click','.row-3 label',function(){
		$('.row-3 label').find('i').each(function(){
			if($(this).hasClass('icon-checked')){
				$(this).removeClass('icon-checked');
				$(this).addClass('icon-check');
			}
		})
		$(this).find('i').addClass('icon-checked');
		$(this).find('i').removeClass('icon-check');
	})
	$('.container').on('click','.set-default label',function(){
		var $i=$(this).find('i');
		if($i.hasClass('icon-checked')){
			$i.removeClass('icon-checked');
			$i.addClass('icon-check');
		}else{
			$i.addClass('icon-checked');
			$i.removeClass('icon-check');
		}
	})
	$('.container').on('click','.save-address',function(){
		var flag=true;
		var postData={};
		if(!!pageParams.id && pageParams.id!='null'){
			postData.id=pageParams.id;
		}
		postData.addressArea=$('.address-area label').text();
		postData.addressHouse=$('.address-door').val();
		postData.baiduMapLng=$('.address-area').data('lng');
		postData.baiduMapLat=$('.address-area').data('lat');
		var sexName;
		$('.row-3 label i').each(function(){
			if($(this).hasClass('icon-checked')){
				sexName=$(this).next('span').text();
			}
		})
		if($('.address-uname').val()==''){
			flag=false;
			toasts.show('请填写您的姓氏');
		}
		if($('.mobile').val()==''){
			flag=false;
			toasts.show('请填写手机号');
		}
		postData.linkman=$('.address-uname').val()+sexName;
		postData.mobile=$('.mobile').val();
		var isDefault=0;
		if($('.set-default i').hasClass('icon-checked')){
			isDefault=1;
		}
		postData.isDefault=isDefault;
		//console.log(postData);
		if(flag){
		    var userInfo=new FetchApi({
		        urlApi:Apis.editUseraddress,
		        postData:postData
		    },function(){
		    	//alert(JSON.stringify(this.records));
		    	if(this.records.code==200){
		    		var msg='添加地址成功！';
		    		if(!!pageParams.id && pageParams.id!='null'){
		    			msg='修改地址成功！';
		    		}
		        	toasts.alert(msg,function(){		        		
		        		if(pageParams.back=='dailys'){
		        			window.location.href='address.html?back=dailys&type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
		        		}else if(pageParams.back=='fotiles'){
		        			window.location.href='address.html?back=fotiles&type='+pageParams.type;
		        		}else{
		        			window.location.href='address.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
		        		}
		        	});
		        }else{
		        	toasts.alert(this.records.message);
		        }
		    });
		}
	})
}
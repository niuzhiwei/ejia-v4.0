'use strict';

require('../stylesheets/common.css');
require('../stylesheets/address.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var Apis={
	searchUserAddress:'/removte/user/searchUserAddress',
	editUseraddress:'/removte/user/editUseraddress',
	delAddress:'/removte/user/deleteUseraddress'
};
var pageParams={
	type:util.urlParam('type'),
	serviceclass:util.urlParam('serviceclass'),
	//旧版空调洗衣机油烟机冰箱
	fotileOther:util.urlParam('fotileOther')
};
if(sessionStorage.userInfo){
	main();
}else{
	util.wxAuthCode(function(){
		main();
	})
}
function main(){
	renderAddressList();
	bindEvents();
}
function renderAddressList(){
	var userInfo=new FetchApi({
        urlApi:Apis.searchUserAddress
    },function(){
    	//alert(JSON.stringify(this.records));
    	if(this.records.code==200){
    		var me=this;
    		var data={list:[]};
    		if(!!me.records.data){
    			data=me.records.data;
    		}
    		var tmpl=new Template({
				tmplName:require('../templates/addressSelect.tmpl'),
				tmplData:data
			});
        	$('.container').html(tmpl.getHtml());
        	//showPage('.page-2');
        	//window.location.href=''
        }else{
        	toasts.alert(this.records.message);
        }
    });
}
function bindEvents(){
	if(!!pageParams.type){
		$('.container').on('click','.address-info',function(){
			var address={};
			address.linkman=$(this).data('linkman');
			address.area=$(this).data('area');
			address.door=$(this).data('door');
			address.phone=$(this).data('phone');
			address.lng=$(this).data('lng');
			address.lat=$(this).data('lat');
			sessionStorage.address=JSON.stringify(address);
			if(pageParams.type==='fillOrder'){
				window.location.href='fillNurse.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
			}else{
				//旧版订单填写
				sessionStorage.addressArea=$(this).data('area');
                sessionStorage.addressHouse=$(this).data('door');
                sessionStorage.baiduMapLat=$(this).data('lat');
                sessionStorage.baiduMapLng=$(this).data('lng');
				window.location.href='/wechat/fillOrder.html?type='+pageParams.type+'&fotileOther='+pageParams.fotileOther;
			}		
		})
	}
	$('.container').on('click','.mod',function(){
		var id=$(this).data('id');
		window.location.href='addressEdit.html?id='+id;
	})
	$('.container').on('click','.del',function(){
		var id=$(this).data('id');
		toasts.confirm('您确信要删除当前地址吗？',function(){
			var data={};
			data.ids=id;
			var delAddress=new FetchApi({
				urlApi:Apis.delAddress,
				postData:data
			},function(){
				toasts.show('删除地址成功');
				renderAddressList();
			})
		})
	})
	$('.container').on('click','.new-address',function(){
		window.location.href='newAddress.html';
	})
	$('.container').on('click','.default',function(){
		var id=$(this).data('id');
		var postData={};
		var isDefault;
		var $i=$(this).find('i');
		if($i.hasClass('icon-checked')){
			isDefault=0;
		}else{
			isDefault=1;
		}
		postData.isDefault=isDefault;
		postData.id=id;
		//console.log(postData);
	    var userInfo=new FetchApi({
	        urlApi:Apis.editUseraddress,
	        postData:postData
	    },function(){
	    	//alert(JSON.stringify(this.records));
	    	if(this.records.code==200){
	        	renderAddressList();
	        }else{
	        	toasts.alert(this.records.message);
	        }
	    });
	})
}
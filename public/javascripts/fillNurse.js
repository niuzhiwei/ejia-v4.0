'use strict';

require('../stylesheets/common.css');
require('../stylesheets/fillNurse.css');

require('./lib/calendar/calendar.css');
var Calendar=require('./lib/calendar/calendar.js');
//require('./lib/sui/sm.min.js');
var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var Apis={
	searchUserAddress:'/removte/user/searchUserAddress',
	getSysDicList:'/removte/order/getSysDicList',
	delAddress:'/removte/user/deleteUseraddress',
	saveNurseOrderform:'/removte/order/saveNurseOrderform',
	editUseraddress:'/removte/user/editUseraddress'
};
var pageParams={
	serviceclass:util.urlParam('serviceclass'),
	currentStep:1,
	address:{data:{},type:0},//type区分日常保洁类
	demand:{data:[],serviceclass:util.urlParam('serviceclass')},
	appointTime:{data:null,serviceclass:util.urlParam('serviceclass')},
	stepEnd:0,
	type:util.urlParam('type')//从外部跳转到本页
};

var tmpl='';
var step1Tmpl=new Template({
	tmplName:require('../templates/fillAddress.tmpl'),
	tmplData:pageParams.address
});
var step1Tmpl2=new Template({
	tmplName:require('../templates/addressSelect.tmpl'),
	tmplData:{}
});
var step2Tmpl=new Template({
	tmplName:require('../templates/fillNurseRequire.tmpl'),
	tmplData:pageParams.demand
});
var step2Tmpl2=new Template({
	tmplName:require('../templates/nurseRequire.tmpl'),
	tmplData:{}
});
var step3Tmpl=new Template({
	tmplName:require('../templates/fillNurseTime.tmpl'),
	tmplData:pageParams.appointTime
});
if(sessionStorage.userInfo){
	init();
	main();
}else{
	util.wxAuthCode(function(){
		init();
		main();
	})
}
function init(){
	pageParams.userInfo=JSON.parse(sessionStorage.userInfo);
	if(pageParams.type==='fillOrder'){
		readSession();
	}else{
		if(!!pageParams.userInfo.data1){
			var address={};
			//失误，属性名如果设置为和实体一致就不用再转换
			address.phone=pageParams.userInfo.data1.mobile;
			address.area=pageParams.userInfo.data1.addressArea;
			address.door=pageParams.userInfo.data1.addressHouse;
			address.lng=pageParams.userInfo.data1.baiduMapLng;
			address.lat=pageParams.userInfo.data1.baiduMapLat;
			if(!!pageParams.userInfo.data1.linkman){
				address.linkman=pageParams.userInfo.data1.linkman;
			}else{
				address.linkman='';
			}
			pageParams.address.data=address;
			pageParams.currentStep=2;
		}
	}
	renderAskfor();
	renderAddressList();
	bindEvents();
}
function main(){
	if(pageParams.currentStep==3){
		tmpl=step1Tmpl.getHtml()+step2Tmpl.getHtml()+step3Tmpl.getHtml();
	}
	else if(pageParams.currentStep==2){
		tmpl=step1Tmpl.getHtml()+step2Tmpl.getHtml();
		//$('.page-3').html(step2Tmpl2.getHtml());
	}else if(pageParams.currentStep==1){
		tmpl=step1Tmpl.getHtml();
		//$('.page-2').html(step1Tmpl2.getHtml());
	}
	$('.page-1 .table').html(tmpl);
	//日历控件加载
	var today=new Date();
	var minDate=util.getDateStr(3);
	pageParams.calendar=new Calendar({
		input:$("#appointTime"),
		minDate:minDate,
		onChange:function(p, values, displayValues){
			$('.next-step').text('提交订单');
			pageParams.appointTime.data=displayValues[0];
			main();
			pageParams.stepEnd=1;
		},
		onOpen:function(p){
			$('.page-overlay').show();
		},
		onClose:function(p){
			$('.page-overlay').hide();
		}
	});
}
function bindEvents(){
	$('.next-step').tap(function(){	
		if(pageParams.stepEnd){
			newOrder();
		}else{
			var flag=true;
			$('.page-1 label').each(function(index, el) {
				var value=$(this).data('value');
				if(value===''){
					flag=false;
				}
			});
			if(flag){
				if(pageParams.currentStep==3){
					setTimeout(function(){
						pageParams.calendar.open();
					},350);
				}else{
					pageParams.currentStep++;
					main();
				}
			}else{
				setTimeout(function(){
					if(pageParams.currentStep==1){
						showPage('.page-2');
					}else if(pageParams.currentStep==2){
						showPage('.page-3');
					}
				},350);
			}
		}
	})
	$('.page-1 .table').on('tap','.address-for',function(){
		setTimeout(function(){
			//$('.page-2').html(step1Tmpl2.getHtml());
			//renderAddressList();
			showPage('.page-2');
			//renderAddressList();
		},500);
	})
	$('.page-1 .table').on('tap','.ask-for',function(){
		setTimeout(function(){
			//$('.page-3').html(step2Tmpl2.getHtml());
			showPage('.page-3');
		},350);
	})
	//点击备注
	$('.page-1 .table').on('tap','.to-remark',function(){
		$(this).find('i').css({'-webkit-transform':'rotate(90deg)'});
		$('.remark-box').css({'display':'table-row'});
	})
	$('.fill-ok button').tap(function(){
		window.location.href='home.html';
	})
}
function showPage(page){
	$('.page').css({'z-index':-1});
	$(page).css({'z-index':1});
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
    		var step1Tmpl2=new Template({
				tmplName:require('../templates/addressSelect.tmpl'),
				tmplData:data
			});
        	$('.page-2').html(step1Tmpl2.getHtml());
        	bindAddressEvents();
        	//showPage('.page-2');
        	//window.location.href=''
        }else{
        	toasts.alert(this.records.message);
        }
    });
}
function bindAddressEvents(){
	$('.address-info').on('click',function(){
		pageParams.currentStep=pageParams.currentStep<2?2:pageParams.currentStep;
		var data={};
		data.linkman=$(this).data('linkman');
		data.phone=$(this).data('phone');
		data.area=$(this).data('area');
		data.door=$(this).data('door');
		data.lng=$(this).data('lng');
		data.lat=$(this).data('lat');
		pageParams.address.data=data;
		setTimeout(function(){
			main();
			showPage('.page-1');
		},350);
	})
	$('.new-address').on('click',function(){
		var demand=[];
		$('.demand-box').children('div').each(function(){
			var item={};
			item.title=$(this).text();
			demand.push(item);
		});
		sessionStorage.demand=JSON.stringify(demand);
		if(!!$('#appointTime').val()){
			sessionStorage.appointTime=$('#appointTime').val();
		}
		sessionStorage.remark=$('.remark').val();
		sessionStorage.currentStep=pageParams.currentStep;
		sessionStorage.stepEnd=pageParams.stepEnd;
		window.location.href='newAddress.html?type=fillOrder&serviceclass='+pageParams.serviceclass;
	})
	$('.mod').on('click',function(){
		var id=$(this).data('id');
		window.location.href='addressEdit.html?type=fillOrder&id='+id+'&serviceclass='+pageParams.serviceclass;
	})
	$('.del').on('click',function(){
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
	$('.default').on('click',function(){
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
function renderAskfor(){
	var diccode;
	if(pageParams.serviceclass=='0001000300030001'){
		diccode=3;//月嫂
	}else if(pageParams.serviceclass=='0001000300030002'){
		diccode=2;//育婴师
	}else if(pageParams.serviceclass=='0001000300030003'){
		diccode=1;//保姆
	}
	var askfor=new FetchApi({
        urlApi:Apis.getSysDicList,
     	postData:{diccode:diccode}
    },function(){
    	//alert(JSON.stringify(this.records));
    	if(this.records.code==200){
    		var me=this;
    		var tmpl=new Template({
				tmplName:require('../templates/nurseRequire.tmpl'),
				tmplData:me.records
			});
        	$('.page-3').html(tmpl.getHtml());
        	bindAskforEvents();
        	//showPage('.page-2');
        	//window.location.href=''
        }else{
        	toasts.alert(this.records.message);
        }
    });
}
function bindAskforEvents(){
	$('.single').each(function(){
		var $item=$(this).find('.require-item');
		$item.click(function(){
			$item.removeClass('selected');
			$(this).addClass('selected');
		})
	})
	$('.multi').each(function(){
		var $item=$(this).find('.require-item');
		$item.click(function(){
			if($(this).hasClass('selected')){
				$(this).removeClass('selected');
			}else{
				$(this).addClass('selected');
			}
		})
	})
	$('.page-3').on('click','.require-conform',function(){
		var flag=true;
		$('.chip').each(function(){
			var notnull=$(this).data('notnull');
			if(notnull==='1'){
				var $selected=$(this).find('.selected');
				if($selected.length<1){
					flag=false;
					var title=$(this).find('.title').text();
					toasts.show(title+'请至少选一项！');
				}
			}
		})
		if(flag){
			pageParams.currentStep=pageParams.currentStep<3?3:pageParams.currentStep;
			var data=[];
			$('.page-3 .require-item').each(function(index, el) {
				if($(this).hasClass('selected') && $(this).text()!='不限'){
					var item={};
					item.title=$(this).text();
					item.diccode=$(this).data('diccode');
					data.push(item);
				}
			});
			pageParams.demand.data=data;
			setTimeout(function(){
				main();
				showPage('.page-1');
			},350);
		}
	})
}
function readSession(){
	pageParams.currentStep=2;
	pageParams.address.data=JSON.parse(sessionStorage.address);
	if(!!sessionStorage.demand){
		pageParams.demand.data=JSON.parse(sessionStorage.demand);
	}
	//console.log(sessionStorage);
	if(!!sessionStorage.appointTime){
		pageParams.appointTime.data=sessionStorage.appointTime;
	}
	pageParams.stepEnd=parseInt(sessionStorage.stepEnd);
}
function newOrder(){
    $('.page-overlay').show();
    $('.page-tips').text('数据提交中，请稍后···');
    var serviceTime=$("#appointTime").val();
    var $address=$('.address-for');
    var data = {};
    data.customerId=pageParams.userInfo.data.id;
    data.addressArea=$address.data('area');
    data.addressHouse=$address.data('door');
    data.baiduMapLng=$address.data('lng');
    data.baiduMapLat=$address.data('lat');
    data.orderAgreedTime=serviceTime;
    data.serviceclass=pageParams.serviceclass;
    //data.serviceclass='0001000300030003';
    data.contactMobile=$address.data('phone');
    data.customerRemark=$('.remark').val();
    //alert(pageParams.userInfo.data.wechatName);
    data.linkman=$('.linkman').text();
    var customerrequire='';
    $('.demand-item').each(function(){
    	var diccode=$(this).data('diccode');
    	customerrequire=customerrequire+diccode+',';
    })
    data.customerrequire=customerrequire;
    var url=Apis.saveNurseOrderform;
    var order=new FetchApi({
        urlApi:url,
        postData:data
    },function(){
        //alert(JSON.stringify(this.records));
        if(this.records.code==200){
            //toasts.alert('订单提交成功！');
            if(pageParams.serviceclass=='0001000300030001'){
				$('.ok-des span').text('月嫂');//月嫂
			}else if(pageParams.serviceclass=='0001000300030002'){
				$('.ok-des span').text('育婴师');;//育婴师
			}
            $('.page-success').show();
            $('.fill-ok').show();
        }else{
            toasts.alert(this.records.message);
            //toasts.show(this.records.message);
        }
        $('.page-overlay').hide();
    });
}
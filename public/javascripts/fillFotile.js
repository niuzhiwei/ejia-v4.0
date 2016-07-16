'use strict';
$.noConflict();//引用jquery插件，解决与Zepto的冲突

require('../stylesheets/common.css');
require('../stylesheets/fillOrder.css');
require('../stylesheets/fillFotile.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var Apis={
	searchUserAddress:'/removte/user/searchUserAddress',
	delAddress:'/removte/user/deleteUseraddress',
	editUseraddress:'/removte/user/editUseraddress',
	getMyProviders:'/removte/provider/getMyProviders',
	saveOrderform:'/removte/order/saveOrderform',
	providerTop:'/removte/provider/providerTop'
};

var pageParams={
	type:util.urlParam('type'),
	serviceclass:util.urlParam('serviceclass'),
	currentStep:1,
	stepEnd:0,
	address:{data:{},type:0},
	appointTime:{data:null,type:util.urlParam('type')},
 	myAunt:[],
	providers:'',
	orderRemark:'',
	list:{data:[],type:util.urlParam('type')}
};

var requireItem=[];
function typeMap(type){
	var map={
		'fotile':[
				{img:require('../images/cleaning/fotile/style-1.png'),name:'欧式油烟机',price:'160元/台',type:'0001000300020004',title:'欧式油烟机（160元/台）'},
				{img:require('../images/cleaning/fotile/style-2.png'),name:'中式油烟机',price:'160元/台',type:'0001000300020003',title:'中式油烟机（160元/台）'},
				{img:require('../images/cleaning/fotile/style-3.png'),name:'侧吸式油烟机',price:'160元/台',type:'0001000300020005',title:'侧吸式油烟机（160元/台）'}
		],
		'air':[
				{img:require('../images/cleaning/air/p1.jpg'),name:'挂式空调',price:'145元/台',type:'00010003000400030001',title:'挂式空调（145元/台）'},
				{img:require('../images/cleaning/air/p2.jpg'),name:'柜式空调',price:'170元/台',type:'00010003000400030002',title:'柜式空调（170元/台）'}
		],
		'icebox':[
				{img:require('../images/cleaning/icebox/p1.jpg'),name:'单/双门冰箱',price:'99元/台',type:'00010003000400010001',title:'单/双门冰箱（99元/台）'},
				{img:require('../images/cleaning/icebox/p2.jpg'),name:'三开门冰箱',price:'180元/台',type:'00010003000400010002',title:'三开门冰箱（180元/台）'},
				{img:require('../images/cleaning/icebox/p3.jpg'),name:'对开门冰箱',price:'230元/台',type:'00010003000400010003',title:'对开门冰箱（230元/台）'}
		],
		'washer':[
				{img:require('../images/cleaning/washer/p1.jpg'),name:'波轮洗衣机',price:'130元/台',type:'00010003000400020001',title:'波轮洗衣机（130元/台）'},
				{img:require('../images/cleaning/washer/p2.jpg'),name:'滚筒洗衣机',price:'165元/台',type:'00010003000400020002',title:'滚筒洗衣机（165元/台）'}
		]
	}
	return map[type];
}

var tmpl='';
var step1Tmpl=new Template({
	tmplName:require('../templates/fillAddress.tmpl'),
	tmplData:pageParams.address
});
var step1Tmpl2=new Template({
	tmplName:require('../templates/addressSelect.tmpl'),
	tmplData:{}
});

var step2Data={};
var step2Tmpl=new Template({
	tmplName:require('../templates/fillOrderTime.tmpl'),
	tmplData:step2Data
});
var step3Tmpl=new Template({
	tmplName:require('../templates/fillFotile.tmpl'),
	tmplData:pageParams.list
});
(function($){
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
		getSession();
		renderAddressList();
		//renderMyAunt('recently');
		renderFotile();
		bindEvents();
	}
	function main(){
		if(pageParams.currentStep==3){
			pageParams.list.data=pageParams.typeList;
			step2Data.appointTime=pageParams.appointTime;
			step2Data.myAunt=pageParams.myAunt;
			step2Data.requireItems=requireItem;
			step2Data.orderRemark=pageParams.orderRemark;
			tmpl=step1Tmpl.getHtml()+step3Tmpl.getHtml()+step2Tmpl.getHtml();
		}
		else if(pageParams.currentStep==2){
			tmpl=step1Tmpl.getHtml()+step3Tmpl.getHtml();
			//$('.page-3').html(step2Tmpl2.getHtml());
		}else if(pageParams.currentStep==1){
			tmpl=step1Tmpl.getHtml();
			//$('.page-2').html(step1Tmpl2.getHtml());
		}
		$('.page-1 .steps').html(tmpl);
		if(pageParams.stepEnd){
			$('.next-step').text('提交订单');
		}
		if(pageParams.currentStep==3){
			var dateScroll = function(){
			    var date = new Date();
			    var curr = new Date().getFullYear(),
			        d = date.getDate(),
			        m = date.getMonth();
			    var newColumn=0;
			    var rowtype=0;
			    $('#appointTime').scroller({
			        preset: 'datehour',
			        //minDate: new Date(curr, m, d, 8, 00),
			        //maxDate: new Date(curr, m, d+10),
			        invalid: [{ d: new Date(), start: '00:00', end: (date.getHours()+2)+':'+date.getMinutes() }],
			        theme: "android-ics light",
			        mode: "scroller",
			        lang: 'zh',
			        display:"bottom",
			        animate: "slideup",
			        stepMinute: 30,
			        dateOrder: 'MMDdd',
			        rows:3,
			        timeWheels: 'HHii',
			        newColumn:newColumn,
			        rowtype:rowtype,
			        onSelect: function (valueText, inst) {
		             	$('.next-step').text('提交订单');
						pageParams.appointTime.data=$("#appointTime").val();
						main();
						pageParams.stepEnd=1;
			        }
			    });
			}
			dateScroll();//时间选择控件
		}
	}
	//$("#appDate").mobiscroll("show");
	function bindEvents(){
		$('.next-step').click(function(){	
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
							$("#appointTime").mobiscroll("show");
						},350);
					}
				}else{
					setTimeout(function(){
						if(pageParams.currentStep==1){
							showPage('.page-2');
						}else if(pageParams.currentStep==2){
							showPage('.page-4');//家电类型
						}
					},350);
				}
			}
		})
		$('.page-1 .table').on('click','.address-for',function(){
			setSession();
			setTimeout(function(){
				showPage('.page-2');
			},500);
		})
		$('.page-1 .table').on('click','.hot-aunt',function(){
			setSession();
			window.location.href='myAunt.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
		})
		$('.page-1 .table').on('click','.require-item',function(){
			var $item=$(this);
    		if($item.hasClass('require-current')){
    			$item.removeClass('require-current');
    		}else{
    			$item.addClass('require-current');
    		}
		})
		//家电类型
		$('.page-1 .table').on('click','.fotile-type',function(){
			setSession();
			setTimeout(function(){
				showPage('.page-4');
			},500);
		})
		$('.container').on('click','.num-plus',function(){
			var nums=$(this).parent('div.set-num').find('.nums');
			var minus=$(this).parent('div.set-num').find('.num-minus');
			var value=nums.text();
			var plus=parseInt(value)+1;
			var max=$(this).data('max');
			if(value<max){
				$('.nums').text('0');//置空其他品类
				nums.text(plus);
				minus.removeClass('disabled');
	        }else{
	        	$(this).addClass('disabled');
	        }
		})
		$('.container').on('click','.num-minus',function(){
			if(!$(this).hasClass('disabled')){
				var nums=$(this).parent('div.set-num').find('.nums');
				var plus=$(this).parent('div.set-num').find('.num-plus');
				var value=nums.text();
				var minus=parseInt(value)-1;
				var min=$(this).data('min');
				if(value>min){
					nums.text(minus);
					plus.removeClass('disabled');
				}else{
					$(this).addClass('disabled');
				}
			}
		})
	}
	function showPage(pageCurrent){
		$('.page').hide();
		$(pageCurrent).show();
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
	        	$('.page-2 .page-content').html(step1Tmpl2.getHtml());
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
			window.location.href='newAddress.html?back=fotiles&type='+pageParams.type;
		})
		$('.mod').on('click',function(){
			var id=$(this).data('id');
			window.location.href='addressEdit.html?back=fotiles&type='+pageParams.type+'&id='+id;
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
        var address=new FetchApi({
            urlApi:url,
            postData:data
        },function(){
            if(this.records.code==200){
                //alert(JSON.stringify(this.records));
                var me=this;
                if(this.records.data.length==0){
                    //toasts.show('暂无符合的手艺人');  
                }else{
                 	var appTmpl=new Template({
			            tmplName:require('../templates/myAunt.tmpl'),
			            tmplData:me.records
			        });
        			$('.page-3').html(appTmpl.getHtml());
        			$('.page-3').html(appTmpl.getHtml());
        			$('.'+type).addClass('myAunt-tab-current');
        			bindAuntEvents();
                }
            }else{
                toasts.alert(this.records.message);
                //toasts.show(this.records.message);
            }
        });
    }
    function bindAuntEvents(){
    	$('.aunt-item').click(function(){
    		var userid=$(this).data('userid');
    		window.location.href='auntDetail.html?userid='+userid;
    	})
    	$('.myAunt-check').click(function(e){
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
    	$('.myAunt-btn').click(function(){
		 	pageParams.myAunt=[];
        	pageParams.providers='';
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
            setTimeout(function(){
            	main();
				showPage('.page-1');
			},500);
    	})
    	$('.myAunt-tab > div').click(function(){
    		var type=$(this).data('type');
    		if(!$(this).hasClass('myAunt-tab-current')){
    			renderMyAunt(type);
    		}
    	})
    }
    function readSession(){
		pageParams.currentStep=2;
		pageParams.address.data=JSON.parse(sessionStorage.address);
		if(!!sessionStorage.appointTime){
			pageParams.appointTime.data=sessionStorage.appointTime;
		}
		pageParams.stepEnd=parseInt(sessionStorage.stepEnd);
	}
	function newOrder(){
	    $('.page-overlay').show();
	    $('.page-tips').text('数据提交中，请稍后···');
	    var serviceTime=$("#appointTime").val().split('  ');
	    var address=$('.address-for');
	    var data = {};
	    data.customerId=pageParams.userInfo.data.id;
	    data.addressArea=address.data('area');
	    data.addressHouse=address.data('door');
	    data.baiduMapLng=address.data('lng');
	    data.baiduMapLat=address.data('lat');
     	data.contactMobile=address.data('phone');
	    data.orderAgreedTime=serviceTime[0];
    	data.ordernum=$('.type-num span').text();
	    data.serviceclass=pageParams.serviceclass;
	    data.linkman=$('.linkman').text();
	    var customerRemark=$('.order-remark').val()+'!';
	    $('.require-item').each(function(){
            if($(this).hasClass('require-current')){
                customerRemark+=$(this).text()+'!';
            }
	    })
	    data.customerRemark=customerRemark;
	    if(pageParams.providers!=''){
            //alert(pageParams.providers);
            data.providers=pageParams.providers;
        }
        var url=Apis.saveOrderform;
	    var order=new FetchApi({
	        urlApi:url,
	        postData:data
	    },function(){
	        //alert(JSON.stringify(this.records));
	        if(this.records.code==200){
	            window.location.href='searchAunt.html?orderno='+this.records.data.orderno+'&providers='+pageParams.providers;
	        }else{
	            toasts.alert(this.records.message);
	            //toasts.show(this.records.message);
	        }
	        $('.page-overlay').hide();
	    });
	}
	function renderFotile(){
		//console.log(typeMap(pageParams.type));
        var appTmpl=new Template({
            tmplName:require('../templates/fotileType.tmpl'),
            tmplData:{data:typeMap(pageParams.type)}
        });
		$('.page-4').html(appTmpl.getHtml());
		bindFotileEvents();
    }
    function bindFotileEvents(){
    	$('.fotile-type-btn').click(function(){
    		pageParams.typeList=[];
    		$('.nums').each(function(){
    			var nums=parseInt($(this).text());
    			if(nums>0){
    				pageParams.serviceclass=$(this).data('fotile-type');
    				var item={};
    				item.num=nums;
    				item.title=$(this).data('fotile-title');
    				pageParams.typeList.push(item);
    			}
    		})
    		if(pageParams.serviceclass==''){
    			toasts.show('请选择家电种类');
    		}else{
			 	setTimeout(function(){
			 		pageParams.currentStep=3;
	            	main();
					showPage('.page-1');
				},500);
    		}
    	})
    }
    function setSession(){
    	var fotileSeesion={};
    	fotileSeesion.currentStep=pageParams.currentStep;
    	fotileSeesion.agreedTime=$('#appointTime').val();
    	pageParams.appointTime.data=fotileSeesion.agreedTime;
    	fotileSeesion.orderRemark=$('.order-remark').val();
    	fotileSeesion.typeList=pageParams.typeList;
        sessionStorage.fotileSeesion=JSON.stringify(fotileSeesion);
        sessionStorage.fotileType=pageParams.type;
    }
    function getSession(){
    	if(sessionStorage.fotileType){
    		if(sessionStorage.fotileType!=pageParams.type){
    			sessionStorage.removeItem('fotileSeesion');
    		}
    	}
    	if(!!sessionStorage.fotileSeesion){
    		var fotileSeesion=JSON.parse(sessionStorage.fotileSeesion);
	    	pageParams.currentStep=fotileSeesion.currentStep;
	    	pageParams.appointTime.data=fotileSeesion.agreedTime;
	    	pageParams.orderRemark=fotileSeesion.orderRemark;
	    	if(sessionStorage.myAuntFotile){
	    		pageParams.myAunt=JSON.parse(sessionStorage.myAuntFotile);
		    	pageParams.providers=sessionStorage.providersFotile;
		    }
	    	pageParams.typeList=fotileSeesion.typeList;
	    	if(!!fotileSeesion.agreedTime){
	    		pageParams.stepEnd=1;
	    	}
	    }
    }
})(jQuery);

 

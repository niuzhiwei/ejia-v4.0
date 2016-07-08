'use strict';
$.noConflict();//引用jquery插件，解决与Zepto的冲突

require('../stylesheets/common.css');
require('../stylesheets/fillOrder.css');

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
 	saveCycleOrderform:'/removte/order/saveCycleOrderform'
};

var pageParams={
	serviceclass:util.urlParam('serviceclass'),
	type:util.urlParam('type'),
	currentStep:1,
	stepEnd:0,
	address:{data:{},type:util.urlParam('type'),servicename:util.serviceTypeMap(util.urlParam('serviceclass'))},
	appointTime:{data:null,type:util.urlParam('type')},
 	myAunt:[],
	providers:'',
	orderRemark:'',//留言
	requireItemsSl:[],//要求
	floorSpace:'',//房屋面积
	weekTimes:1,
 	selectedDay:'',//周期订单所选日期对应的星期，用于日期验证
 	monthDays:[]//周期订单所选的具体日期
};
function requireItemMap(serviceclass){
	var map={
		'0001000300010001':['上门前请联系','家有宠物','重点打扫厨房','重点打扫卫生间','深度清洁'],
		'0001000300010002':['上门前请联系我','深度清洁最赞啦','家有宠物请小心','速度与清洁并重'],
		'0001000300020001':['上门前请联系我','深度清洁最赞啦','家有宠物请小心','速度与清洁并重']
	}
	return map[serviceclass];
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
		renderAddressList();
		renderMyAunt();
		renderMonthTime();
		bindEvents();
	}
	function main(){
		if(pageParams.currentStep==2){
			step2Data.monthDays=pageParams.monthDays;
			//保留留言数据，防止选择手艺人后被置空
			step2Data.appointTime=pageParams.appointTime;
			step2Data.myAunt=pageParams.myAunt;
			step2Data.requireItems=requireItemMap(pageParams.serviceclass);
			step2Data.orderRemark=pageParams.orderRemark;
			step2Data.requireItemsSl=pageParams.requireItemsSl;
			step2Data.floorSpace=pageParams.floorSpace;
			tmpl=step1Tmpl.getHtml()+step2Tmpl.getHtml();
			//$('.page-3').html(step2Tmpl2.getHtml());
		}else if(pageParams.currentStep==1){
			tmpl=step1Tmpl.getHtml();
			//$('.page-2').html(step1Tmpl2.getHtml());
		}
		$('.page-1 .steps').html(tmpl);
		if(pageParams.currentStep==2){
			var dateScroll = function(){
			    var date = new Date();
			    var curr = new Date().getFullYear(),
			        d = date.getDate(),
			        m = date.getMonth();
			    var newColumn=1;
			    var rowtype=0;
			    if(pageParams.type=='window' || pageParams.type=='fotile'){
			        newColumn=0;//玻璃清洗，无时长
			    }else if(pageParams.type=='wasteland'){
		    	 	newColumn=0;
		            rowtype=3;//新居开荒每天8点-13:00，提前24小时
			    }
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
			        	pageParams.agreedTime=$("#appointTime").val().split('  ')[0];
			        	//周期订单
			            if(pageParams.type=='monthly'){
			                var timeArr=$("#appointTime").val().split('  ');
			            	var selectedDate=util.getDate(timeArr[0]);
			                pageParams.hours=timeArr[1].substring(0,timeArr[1].length-2);
			                if(selectedDate.getDay()==0){
			                    pageParams.selectedDay=7;
			                }else{
			                    pageParams.selectedDay=selectedDate.getDay();
			                }
			                //alert(pageParams.selectedDay);
			            }else if(pageParams.type=='daily'){
			            	var timeArr=$("#appointTime").val().split('  ');
			            	var selectedDate=util.getDate(timeArr[0]);
			            	pageParams.hours=timeArr[1].substring(0,timeArr[1].length-2);
			            	var endTime=selectedDate.getTime()+pageParams.hours*60*60*1000;
			            	var endHour=util.formatDate('yyyy-MM-dd hh:mm',endTime).split(' ')[1];
			            	$("#appointTime").val(timeArr[0]+'-'+endHour);
			            }
		             	$('.next-step').text('提交订单');
						pageParams.appointTime.data=$("#appointTime").val();
						main();
						pageParams.stepEnd=1;
			        }
			    });
			}
			dateScroll();//时间选择控件
		}
		if(pageParams.type=='daily'){
			$('.daily-monthly').css({'display':'table'});
			$('.fill-daily').addClass('dm-current');
		}else if(pageParams.type=='monthly'){
			$('.daily-monthly').css({'display':'table'});
			$('.fill-monthly').addClass('dm-current');
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
					if(pageParams.currentStep==2){
						setTimeout(function(){
							$("#appointTime").mobiscroll("show");
						},350);
					}
				}else{
					setTimeout(function(){
						if(pageParams.currentStep==1){
							showPage('.page-2');
						}else if(pageParams.currentStep==2){
							showPage('.page-4');//周期保洁日期选择
						}
					},350);
				}
			}
		})
		$('.page-1 .table').on('click','.address-for',function(){
			setRemark();
			setTimeout(function(){
				showPage('.page-2');
			},500);
		})
		$('.page-1 .table').on('click','.hot-aunt',function(){
			setRemark();
			setTimeout(function(){
				showPage('.page-3');
			},500);
		})
		$('.page-1 .table').on('click','.require-item',function(){
			var $item=$(this);
    		if($item.hasClass('require-current')){
    			$item.removeClass('require-current');
    		}else{
    			$item.addClass('require-current');
    		}
		})
		//周日保洁选择日期
		$('.page-1 .table').on('click','.monthly-time',function(){
			setRemark();
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
				nums.text(plus);
				minus.removeClass('disabled');
			 	$('.week-num').text(plus);
	            $('.week-total').text(pageParams.weekTimes*plus);
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
					$('.week-num').text(minus);
            		$('.week-total').text(pageParams.weekTimes*minus);
				}else{
					$(this).addClass('disabled');
				}
			}
		})
		$('.fill-daily').click(function(){
			window.location.href='fillOrder.html?type=daily&serviceclass=0001000300010001';
		})
		$('.fill-monthly').click(function(){
			window.location.href='fillOrder.html?type=monthly&serviceclass=0001000300010001';
		})
	}
	function showPage(pageCurrent){
		$('.page').css({'z-index':-1});
		$(pageCurrent).css({'z-index':1});
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
			window.location.href='newAddress.html?back=dailys&type='+pageParams.type+'&serviceclass='+pageParams.serviceclass;
		})
		$('.mod').on('click',function(){
			var id=$(this).data('id');
			window.location.href='addressEdit.html?back=dailys&type='+pageParams.type+'&id='+id+'&serviceclass='+pageParams.serviceclass;
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
	function renderMyAunt(){
        var data = {};
        data.userid=pageParams.userInfo.data.id;
        data.serviceclass=pageParams.serviceclass;
        var address=new FetchApi({
            urlApi:Apis.getMyProviders,
            postData:data
        },function(){
            if(this.records.code==200){
                //alert(JSON.stringify(this.records));
                var me=this;
                if(this.records.data.length==0){
                    toasts.show('暂无符合的手艺人');  
                }else{
                 	var appTmpl=new Template({
			            tmplName:require('../templates/myAunt.tmpl'),
			            tmplData:me.records
			        });
        			$('.page-3').html(appTmpl.getHtml());
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
    		var $check=$(this).find('div.iconfont');
    		if($check.hasClass('icon-check')){
    			$check.addClass('icon-checked');
    			$check.removeClass('icon-check');
    		}else{
    			$check.addClass('icon-check');
    			$check.removeClass('icon-checked');
    		}
    	})
    	$('.myAunt-btn').click(function(){
    		pageParams.providers="";
    		pageParams.myAunt=[];
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
	    //var serviceTime=$("#appointTime").val().split('  ');
	    var address=$('.address-for');
	    var data = {};
	    data.customerId=pageParams.userInfo.data.id;
	    data.addressArea=address.data('area');
	    data.addressHouse=address.data('door');
	    data.baiduMapLng=address.data('lng');
	    data.baiduMapLat=address.data('lat');
     	data.contactMobile=address.data('phone');
	    data.orderAgreedTime=pageParams.agreedTime;
	    if(!!pageParams.hours){
	    	data.ordernum=pageParams.hours;
	    }
	    if(pageParams.type=='window' || pageParams.type=='wasteland'){
	    	data.ordernum=$('.floor-space').val();
	    }
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
        if(pageParams.type=='monthly'){
        	url=Apis.saveCycleOrderform;
        	data.weeknum=$('#weeks .nums').text();
            var weekdays='';
            $('.fill-week>div').each(function(){
                var me=$(this);
                if(me.hasClass('fill-current')){
                    weekdays+=me.data('weeknum')+',';
                }
            })
            if(weekdays!=''){
                weekdays=weekdays.substring(0,weekdays.length-1);
                data.weekdays=weekdays;
            }
        }
	    var order=new FetchApi({
	        urlApi:url,
	        postData:data
	    },function(){
	        //alert(JSON.stringify(this.records));
	        if(this.records.code==200){
	            window.location.href='/wechat/searchAunt.html?orderno='+this.records.data.orderno+'&providers='+pageParams.providers;
	        }else{
	            toasts.alert(this.records.message);
	            //toasts.show(this.records.message);
	        }
	        $('.page-overlay').hide();
	    });
	}
	function renderMonthTime(){
        var appTmpl=new Template({
            tmplName:require('../templates/monthlyTime.tmpl'),
            tmplData:{}
        });
		$('.page-4').html(appTmpl.getHtml());
		bindMonthEvents();
    }
    function bindMonthEvents(){
    	$('.fill-week > div').on('click',function(){
		 	var me=$(this);
            if(me.hasClass('fill-current')){
                me.removeClass('fill-current');
                pageParams.weekTimes--;
            }else{
                me.addClass('fill-current');
                pageParams.weekTimes++;
            }
            $('.week-time').text(pageParams.weekTimes);
            var weeks=$('#weeks').find('.nums').text();
         	$('.week-total').text(pageParams.weekTimes*weeks);
    	})
    	$('.monthly-time-btn').on('click',function(){
    		if($('.fill-week>div').hasClass('fill-current').length<1){
    			toasts.show('请选择服务周期');
    		}else{
    			var monthlyFlag=false;
                $('.fill-week>div').each(function(){
                    var me=$(this);
                    if(me.hasClass('fill-current')){
                    	//console.log(me.data('weeknum'));
                        if(me.data('weeknum')==pageParams.selectedDay){
                            monthlyFlag=true;
                        }
                    }
                })
                if(!monthlyFlag){
                    toasts.alert('上门时间必须在上门周期所选的时间范围内');
                    $('#appointTime').val('');
                }else{
                	var begtime=$('#appointTime').val().split('  ')[0];
                	var begtimeHour=begtime.split(' ')[1];
                	var endtime=util.getDate(begtime).getTime()+2*60*60*1000;
                	var endtimeHour=util.formatDate('yyyy-MM-dd hh:mm',endtime).split(' ')[1];
                	setTimeout(function(){
                		//周期内所选的具体日期
                		var weeks=$('#weeks').find('.nums').text();
                		var daylength=weeks*7;
                		var monthDays=[];
                		var firstTime=util.getDate(begtime);
                		for(var i=0;i<daylength;i++){
                			//注意赋值给变量后再调用getDay报错
                			//var monthday=d.setDate(d.getDate()+i);
							//console.log(monthday.getDay());
							var d = new Date(firstTime);
							d.setDate(d.getDate()+i);
							var weeknum=d.getDay();
							if(weeknum==0){
								weeknum=7;
							}
            			 	$('.fill-week>div').each(function(){
			                    var me=$(this);
			                    if(me.hasClass('fill-current')){
			                        if(me.data('weeknum')==weeknum){
			                        	if(d.getTime()>=firstTime.getTime()){
				                        	var item=util.formatDate('yyyy-MM-dd',d)+' '+begtimeHour+'-'+endtimeHour;
				                            monthDays.push(item);
				                        }
			                        }
			                    }
			                })
                		}	
                		pageParams.monthDays=monthDays;
		            	main();
						showPage('.page-1');
					},500);
                }
    		}
    	})
    }
    function setRemark(){
    	pageParams.orderRemark=$('.order-remark').val();
        pageParams.requireItemsSl=[];
        pageParams.floorSpace=$('.floor-space').val();
        $('.require-item').each(function(){
        	if($(this).hasClass('require-current')){
        		pageParams.requireItemsSl.push($(this).text());
        	}else{
        		pageParams.requireItemsSl.push('');
        	}
        })
    }
})(jQuery);

 

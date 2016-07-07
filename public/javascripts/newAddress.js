'use strict';
require('../stylesheets/common.css');
require('../stylesheets/newAddress.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');

var util=new Util();
var Apis={
};
var pageParams={
	type:util.urlParam('type'),
	serviceclass:util.urlParam('serviceclass'),
	id:util.urlParam('id')
};
function renderAddressResult(data){
	var tmpl=new Template({
		tmplName:require('../templates/addressResultItem.tmpl'),
		tmplData:data
	});
	$('.result-panel').html(tmpl.getHtml());
}
bindEvents();
function bindEvents(){
	$('.result-panel').on('click','.row',function(){
		var addressInfo={};
		addressInfo.addressArea=$(this).data('address-area');
		addressInfo.baiduMapLng=$(this).data('lng');
		addressInfo.baiduMapLat=$(this).data('lat');
		sessionStorage.addressInfo=JSON.stringify(addressInfo);
		window.location.href='addressEdit.html?type='+pageParams.type+'&serviceclass='+pageParams.serviceclass+'&id='+pageParams.id;
	})
	var last;
	$('.search-input').on('keyup',function(event){
		last = event.timeStamp;
       	//利用event的timeStamp来标记时间，这样每次的keyup事件都会修改last的值，注意last必需为全局变量
       	setTimeout(function(){    //设时延迟0.5s执行
            if(last-event.timeStamp==0)
               	//如果时间差为0（也就是你停止输入0.5s之内都没有其它的keyup事件发生）则做你想要做的事
          		{
                   $('#search-btn').trigger('click');
               	}
        },1000);
	})
}
(function(){
	// 百度地图API功能
	var map = new BMap.Map("l-map");        
	map.centerAndZoom("石家庄",16); 
	var geolocation = new BMap.Geolocation();
	var geoc = new BMap.Geocoder();   
	geolocation.getCurrentPosition(function(r){
		if(this.getStatus() == BMAP_STATUS_SUCCESS){
			var mk = new BMap.Marker(r.point);
			//map.addOverlay(mk);
			map.panTo(r.point);
			geoc.getLocation(r.point, function(rs){
				var addComp = rs.addressComponents;
				var value=addComp.city+addComp.district+addComp.street+addComp.streetNumber;
				search(value);
			});   
		}
		else {
			alert('failed'+this.getStatus());
		}        
	},{enableHighAccuracy: true})
	function search(value){
		var options = {
		onSearchComplete: function(results){
				// 判断状态是否正确
				if (local.getStatus() == BMAP_STATUS_SUCCESS){
					var s = [];
					for (var i = 0; i < results.getCurrentNumPois(); i ++){
						//console.log(results.getPoi(i).point);
						var item={};
						item.title=results.getPoi(i).title;
						item.address=results.getPoi(i).address;
						item.point=results.getPoi(i).point;
						s.push(item);
					}
					var records={records:s};
					renderAddressResult(records);
					//document.getElementById("r-result").innerHTML = s.join("<br/>");
				}
			},
			renderOptions:{map: map}
		};
		var local = new BMap.LocalSearch(map, options);
		local.search(value);
	}
	var searchBtn=document.getElementById('search-btn');
	searchBtn.addEventListener("click", function(){
	    var value=document.getElementById('search-input').value;
	    search(value);
	});
})();
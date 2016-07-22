'use strict';

require('./lib/swiper/swiper.js');
require('./lib/swiper/swiper.css');

require('../stylesheets/common.css');
require('../stylesheets/home.css');

require('./lib/marquee.js');

var Template=require('./core/Template.js');
var FetchApi=require('./core/FetchApi.js');
var WxShare=require('./core/WxShare.js');

var pageParams={};
var Apis={
	home:'/static/exj/home.data.log'
}

main();
function main(){
	renderMain();
	renderFooter();
}
function renderMain(){
	var info=new FetchApi({
        urlApi:Apis.home,
        type:'get'
    },function(){
		var pageTmpl=new Template({
			tmplName:require('../templates/home.tmpl'),
			tmplData:this.records
		});
		$('.container').html(pageTmpl.getHtml());
		var swiper = new Swiper('.swiper-container', {
	        pagination: '.swiper-pagination',
	        nextButton: '.swiper-button-next',
	        prevButton: '.swiper-button-prev',
	        paginationClickable: true,
	        //spaceBetween: 30,
	        centeredSlides: true,
	        autoplay: 5000,
	        loop:true,
	        autoplayDisableOnInteraction: false
	    });
	    $("#tab-2").marquee({
		    speed:3000, 
		    rowHeight:20 
		});
		var wxShare=new WxShare({
			img:'/wechat/v4.0/public/images/share.jpg',
			linkurl:'/wechat/v4.0/home.html',
			desc:'优致的家庭服务，一分钟找到靠谱家政手艺人！',
			title:'e享家'
		})
		bindEvents();
    });
}
function renderFooter(){
	var footer=new Template({
		tmplName:require('../templates/footer.tmpl'),
		tmplData:{current:1}
	});
	$('footer').html(footer.getHtml());
}
function bindEvents(){
	$('.swiper-slide').click(function(){
		var toUrl=$(this).data('goto');
		if(!!toUrl){
			window.location.href=toUrl;
		}
	})
	$('.top-left').click(function(){
		window.location.href='nurse.html';
	})
	$('.router').click(function(){
		var router=$(this).data('router');
		window.location.href=router;
	})
	$('.go-activity').click(function(){
		var toUrl=$(this).data('goto');
		if(!!toUrl){
			window.location.href=toUrl;
		}
	})
	$('.more').click(function(){
		window.location.href='comments.html';
	})
	$('.news').click(function(){
		window.location.href='news.html';
	})
}
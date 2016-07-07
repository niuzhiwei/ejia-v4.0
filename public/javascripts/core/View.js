'use strict';
function View(options){
	var opts=options||{};
	this.content=opts.content;
	this.holder=opts.holder;
}
View.prototype.render=function(callback){
	var holderEl=document.querySelector(this.holder);
	holderEl.innerHTML=this.content;
	if(callback)
		callback();
}
module.exports=View;

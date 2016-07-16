'use strict';
require('../stylesheets/common.css');
require('../stylesheets/searchAunt.css');

var Template=require('./core/Template.js');
var Util=require('./core/Util.js');
var FetchApi=require('./core/FetchApi.js');
var Toasts=require('./core/Toasts.js');

var util=new Util();
var toasts=new Toasts();

var pageParams={
	providers:util.urlParam('providers')
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
	var pageTmpl=new Template({
		tmplName:require('../templates/searchAunt.tmpl'),
		tmplData:{userIcon:userInfo.data.headImg}
	});
	$('.container').html(pageTmpl.getHtml());
	var vh=$(window).height();
	$('.container').css({'height':vh});
	$('.component').height(vh);
	_bindEvents();
}
function _bindEvents(){
	var bezier = function(x1, y1, x2, y2, epsilon) {
		var curveX = function(t){
			var v = 1 - t;
			return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
		};
		var curveY = function(t){
			var v = 1 - t;
			return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
		};
		var derivativeCurveX = function(t){
			var v = 1 - t;
			return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
		};
		return function(t){
			var x = t, t0, t1, t2, x2, d2, i;
			// First try a few iterations of Newton's method -- normally very fast.
			for (t2 = x, i = 0; i < 8; i++){
				x2 = curveX(t2) - x;
				if (Math.abs(x2) < epsilon) return curveY(t2);
				d2 = derivativeCurveX(t2);
				if (Math.abs(d2) < 1e-6) break;
				t2 = t2 - x2 / d2;
			}

			t0 = 0, t1 = 1, t2 = x;

			if (t2 < t0) return curveY(t0);
			if (t2 > t1) return curveY(t1);

			// Fallback to the bisection method for reliability.
			while (t0 < t1){
				x2 = curveX(t2);
				if (Math.abs(x2 - x) < epsilon) return curveY(t2);
				if (x > x2) t0 = t2;
				else t1 = t2;
				t2 = (t1 - t0) * .5 + t0;
			}
			// Failure
			return curveY(t2);
		};
	},
	getRandomNumber = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	throttle = function(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	};

	// the main component element/wrapper
	var shzEl = document.querySelector('.component'),
	// the initial button
	shzCtrl = shzEl.querySelector('.button--start'),
	totalNotes = 5,
	// the notes elements
	notes,
	notesSpeedFactor = 10,
	// simulation time for listening (ms)
	simulateTime = 5000,
	// window sizes
	winsize = {width: window.innerWidth, height: window.innerHeight},
	// button offset
	shzCtrlOffset = shzCtrl.getBoundingClientRect(),
	// button sizes
	shzCtrlSize = {width: shzCtrl.offsetWidth, height: shzCtrl.offsetHeight},
	// tells us if the listening animation is taking place
	isListening = false;

	function init() {
		createNotes();
		listen();
	}


	function createNotes() {
		var notesEl = document.createElement('div'), notesElContent = '';
		var img=require('../images/icon.png');
		notesEl.className = 'notes';
		for(var i = 0; i < totalNotes; ++i) {
			// we have 6 different types of symbols (icon--note1, icon--note2 ... icon--note6)
			var j = (i + 1) - 6 * Math.floor(i/6);
			//notesElContent += '<div class="note icon aunt-icon iconfont search-aunt-icon">&#xe613;</div>';
			notesElContent += '<img class="note icon aunt-icon search-aunt-icon" src="'+img+'"/>';
		}
		notesEl.innerHTML = notesElContent;
		shzEl.insertBefore(notesEl, shzEl.firstChild)

		// reference to the notes elements
		notes = [].slice.call(notesEl.querySelectorAll('.note'));
	}

	function listen() {
		isListening = true;
		showNotes();
		setTimeout(showAuntList, simulateTime);	
	}

	function showAuntList(){
		var orderno=util.urlParam('orderno');
		window.location.href='auntList.html?orderno='+orderno+'&providers='+pageParams.providers;
	}
	/**
	 * stop the ripples and notes animations
	 */
	function stopListening() {
		isListening = false;
		// ripples stop...
		classie.remove(shzCtrl, 'button--animate');
		// music notes animation stops...
		hideNotes();
	}


	function showNotes() {
		notes.forEach(function(note) {
			// first position the notes randomly on the page
			positionNote(note);
			// now, animate the notes torwards the button
			animateNote(note);
		});
	}

	/**
	 * fade out the notes elements
	 */
	function hideNotes() {
		notes.forEach(function(note) {
			note.style.opacity = 0;
		});
	}


	function positionNote(note) {
		// we want to position the notes randomly (translation and rotation) outside of the viewport
		var x = getRandomNumber(-2*(shzCtrlOffset.left + shzCtrlSize.width/2), 2*(winsize.width - (shzCtrlOffset.left + shzCtrlSize.width/2))), y,
			rotation = getRandomNumber(-30, 30);

		if( x > -1*(shzCtrlOffset.top + shzCtrlSize.height/2) && x < shzCtrlOffset.top + shzCtrlSize.height/2 ) {
			y = getRandomNumber(0,1) > 0 ? getRandomNumber(-2*(shzCtrlOffset.top + shzCtrlSize.height/2), -1*(shzCtrlOffset.top + shzCtrlSize.height/2)) : getRandomNumber(winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2), winsize.height + winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2));
		}
		else {
			y = getRandomNumber(-2*(shzCtrlOffset.top + shzCtrlSize.height/2), winsize.height + winsize.height - (shzCtrlOffset.top + shzCtrlSize.height/2));
		}

		// first reset transition if any
		note.style.WebkitTransition = note.style.transition = 'none';
		
		// apply the random transforms
		note.style.WebkitTransform = note.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) rotate3d(0,0,1,' + rotation + 'deg)';

		// save the translation values for later
		note.setAttribute('data-tx', Math.abs(x));
		note.setAttribute('data-ty', Math.abs(y));
	}


	function animateNote(note) {
		setTimeout(function() {
			if(!isListening) return;
			// the transition speed of each note will be proportional to the its distance to the button
			// speed = notesSpeedFactor * distance
			var noteSpeed = notesSpeedFactor * Math.sqrt(Math.pow(note.getAttribute('data-tx'),2) + Math.pow(note.getAttribute('data-ty'),2));

			// apply the transition
			note.style.WebkitTransition = '-webkit-transform ' + noteSpeed + 'ms ease, opacity 0.8s';
			note.style.transition = 'transform ' + noteSpeed + 'ms ease-in, opacity 0.8s';
			
			// now apply the transform (reset the transform so the note moves to its original position) and fade in the note
			note.style.WebkitTransform = note.style.transform = 'translate3d(0,0,0)';
			note.style.opacity = 1;
			
			// after the animation is finished, 
			var onEndTransitionCallback = function() {
				// reset transitions and styles
				note.style.WebkitTransition = note.style.transition = 'none';
				note.style.opacity = 0;

				if(!isListening) return;

				positionNote(note);
				animateNote(note);
			};

			
		}, 60);
	}

	init();
}
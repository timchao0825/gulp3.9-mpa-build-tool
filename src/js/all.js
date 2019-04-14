// init foundarion 
$(document).foundation();
//IE old version tip
var userAgent = window.navigator.userAgent;
var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
if (userAgent.indexOf("MSIE 7.0") > 0 || userAgent.indexOf("MSIE 8.0") > 0 || userAgent.indexOf("MSIE 9.0") > 0 || navigator.appVersion.indexOf("MSIE 10") !== -1) {
	var url = "browser.html";
	setTimeout(
		function () {
			$(location).attr('href', url);
		}, 0);
}
// doc ready
(function ($, window, document) {
	// Window 相關設定
	var w = window,
		win = $(window),
		ww,
		wh,
		ws;

	// 取得Window設定值
	var windowSetting = function () {
		ww = win.innerWidth();
		wh = win.innerHeight();
		ws = win.scrollTop();
	}
	windowSetting();
	// ----------------------------------- Window 相關監測
	// window on scroll use javascript
	// Reference: https://stackoverflow.com/a/10915048
	// http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html#event-type-scroll
	function onScrollEventHandler(ev) { }
	function onResizeEventHandler(ev) {
		windowSetting();
	}
	if (w.addEventListener) {
		w.addEventListener('scroll', onScrollEventHandler, false);
		w.addEventListener('resize', onResizeEventHandler, false);
		// w.addEventListener('load', onLoadEventHandler, false);   
	} else if (w.attachEvent) {
		w.attachEvent('onscroll', onScrollEventHandler);
		w.attachEvent('onresize', onScrollEventHandler);
		w.attachEvent('load', onLoadEventHandler);
	}

	// -----------------------------------
	// =================================================
	// window load
	$(window).on("load", function (e) {
		
	})
	$(document).ready(function(){
		// easeScroll
		var buildEaseScrollWaitTime = 0;
		var buildEaseScroll = function(){
			if(typeof $().easeScroll != 'function'){
				// 如果讀取不到easeScroll => 等待 => 十秒後放棄[試寫，目前測不到]
				if(buildEaseScrollWaitTime < 10){
					setTimeout(function(){
						buildEaseScrollWaitTime++
						console.log(buildEaseScrollWaitTime)
						buildEaseScroll();
					}, 1000)
				}
			}else{
				$("html").easeScroll({
					frameRate: 60,
					animationTime: 1000,
					stepSize: 100,
					pulseAlgorithm: 1,
					pulseScale: 6,
					pulseNormalize: 1,
					accelerationDelta: 20,
					accelerationMax: 1,
					keyboardSupport: true,
					arrowScroll: 30,
					touchpadSupport: true,
					fixedBackground: true
				});
			}
		}
		buildEaseScroll();
	});
	// end doc ready
})(jQuery, window, document);
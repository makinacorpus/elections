!function t(e,s,i){function n(a,o){if(!s[a]){if(!e[a]){var d="function"==typeof require&&require;if(!o&&d)return d(a,!0);if(r)return r(a,!0);var h=new Error("Cannot find module '"+a+"'");throw h.code="MODULE_NOT_FOUND",h}var l=s[a]={exports:{}};e[a][0].call(l.exports,function(t){var s=e[a][1][t];return n(s?s:t)},l,l.exports,t,e,s,i)}return s[a].exports}for(var r="function"==typeof require&&require,a=0;a<i.length;a++)n(i[a]);return n}({"./src/scripts/mkc.js":[function(t){var e=t("./modules/main-app.js");e.init()},{"./modules/main-app.js":"/var/www/html/projets/makina-loader/src/scripts/modules/main-app.js"}],"/var/www/html/projets/makina-loader/node_modules/pym.js/src/pym.js":[function(t,e){!function(t){"function"==typeof define&&define.amd?define(t):"undefined"!=typeof e&&e.exports?e.exports=t():window.pym=t.call(this)}(function(){var t="xPYMx",e={},s=function(t){var e=new RegExp("[\\?&]"+t.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]")+"=([^&#]*)"),s=e.exec(location.search);return null===s?"":decodeURIComponent(s[1].replace(/\+/g," "))},i=function(t,e){return"*"===e.xdomain||t.origin.match(new RegExp(e.xdomain+"$"))?!0:void 0},n=function(e,s,i){var n=["pym",e,s,i];return n.join(t)},r=function(e){var s=["pym",e,"(\\S+)","(.+)"];return new RegExp("^"+s.join(t)+"$")},a=function(){for(var t=document.querySelectorAll("[data-pym-src]:not([data-pym-auto-initialized])"),s=t.length,i=0;s>i;++i){var n=t[i];n.setAttribute("data-pym-auto-initialized",""),""===n.id&&(n.id="pym-"+i);var r=n.getAttribute("data-pym-src"),a=n.getAttribute("data-pym-xdomain"),o={};a&&(o.xdomain=a),new e.Parent(n.id,r,o)}};return e.Parent=function(t,e,s){this.id=t,this.url=e,this.el=document.getElementById(t),this.iframe=null,this.settings={xdomain:"*"},this.messageRegex=r(this.id),this.messageHandlers={},this._constructIframe=function(){var t=this.el.offsetWidth.toString();this.iframe=document.createElement("iframe");var e="",s=this.url.indexOf("#");s>-1&&(e=this.url.substring(s,this.url.length),this.url=this.url.substring(0,s)),this.url+=this.url.indexOf("?")<0?"?":"&",this.iframe.src=this.url+"initialWidth="+t+"&childId="+this.id+e,this.iframe.setAttribute("width","100%"),this.iframe.setAttribute("scrolling","no"),this.iframe.setAttribute("marginheight","0"),this.iframe.setAttribute("frameborder","0"),this.el.appendChild(this.iframe);var i=this;window.addEventListener("resize",function(){i.sendWidth()})},this._fire=function(t,e){if(t in this.messageHandlers)for(var s=0;s<this.messageHandlers[t].length;s++)this.messageHandlers[t][s].call(this,e)},this._processMessage=function(t){if(i(t,this.settings)){var e=t.data.match(this.messageRegex);if(!e||3!==e.length)return!1;var s=e[1],n=e[2];this._fire(s,n)}},this._onHeightMessage=function(t){var e=parseInt(t);this.iframe.setAttribute("height",e+"px")},this.onMessage=function(t,e){t in this.messageHandlers||(this.messageHandlers[t]=[]),this.messageHandlers[t].push(e)},this.sendMessage=function(t,e){this.el.getElementsByTagName("iframe")[0].contentWindow.postMessage(n(this.id,t,e),"*")},this.sendWidth=function(){var t=this.el.offsetWidth.toString();this.sendMessage("width",t)};for(var a in s)this.settings[a]=s[a];this.onMessage("height",this._onHeightMessage);var o=this;return window.addEventListener("message",function(t){return o._processMessage(t)},!1),this._constructIframe(),this},e.Child=function(e){this.parentWidth=null,this.id=null,this.settings={renderCallback:null,xdomain:"*",polling:0},this.messageRegex=null,this.messageHandlers={},this.onMessage=function(t,e){t in this.messageHandlers||(this.messageHandlers[t]=[]),this.messageHandlers[t].push(e)},this._fire=function(t,e){if(t in this.messageHandlers)for(var s=0;s<this.messageHandlers[t].length;s++)this.messageHandlers[t][s].call(this,e)},this._processMessage=function(t){if(i(t,this.settings)){var e=t.data.match(this.messageRegex);if(e&&3===e.length){var s=e[1],n=e[2];this._fire(s,n)}}},this.sendMessage=function(t,e){window.parent.postMessage(n(this.id,t,e),"*")},this.sendHeight=function(){var t=document.getElementsByTagName("body")[0].offsetHeight.toString();o.sendMessage("height",t)},this._onWidthMessage=function(t){var e=parseInt(t);e!==this.parentWidth&&(this.parentWidth=e,this.settings.renderCallback&&this.settings.renderCallback(e),this.sendHeight())},this.id=s("childId")||e.id,this.messageRegex=new RegExp("^pym"+t+this.id+t+"(\\S+)"+t+"(.+)$");var r=parseInt(s("initialWidth"));this.onMessage("width",this._onWidthMessage);for(var a in e)this.settings[a]=e[a];var o=this;return window.addEventListener("message",function(t){o._processMessage(t)},!1),this.settings.renderCallback&&this.settings.renderCallback(r),this.sendHeight(),this.settings.polling&&window.setInterval(this.sendHeight,this.settings.polling),this},a(),e})},{}],"/var/www/html/projets/makina-loader/node_modules/randomstring/index.js":[function(t,e){e.exports=t("./lib/randomstring")},{"./lib/randomstring":"/var/www/html/projets/makina-loader/node_modules/randomstring/lib/randomstring.js"}],"/var/www/html/projets/makina-loader/node_modules/randomstring/lib/randomstring.js":[function(t,e,s){var i="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz";s.generate=function(t){t=t?t:32;for(var e="",s=0;t>s;s++){var n=Math.floor(Math.random()*i.length);e+=i.substring(n,n+1)}return e}},{}],"/var/www/html/projets/makina-loader/src/scripts/modules/dataset-polyfill.js":[function(t,e){e.exports=function(){function t(){h=!0,this.removeEventListener("DOMAttrModified",t,!1)}function e(t){return t.replace(o,function(t,e){return e.toUpperCase()})}function s(){var t={};return r.call(this.attributes,function(s){(n=s.name.match(a))&&(t[e(n[1])]=s.value)}),t}function i(t,e,s){Object.defineProperty?Object.defineProperty(t,e,{get:s}):t.__defineGetter__(e,s)}var n,r=[].forEach,a=/^data-(.+)/,o=/\-([a-z])/gi,d=document.createElement("div"),h=!1;void 0==d.dataset&&(d.addEventListener("DOMAttrModified",t,!1),d.setAttribute("foo","bar"),i(Element.prototype,"dataset",h?function(){return this._datasetCache||(this._datasetCache=s.call(this)),this._datasetCache}:s),document.addEventListener("DOMAttrModified",function(t){delete t.target._datasetCache},!1))}()},{}],"/var/www/html/projets/makina-loader/src/scripts/modules/main-app.js":[function(t,e){e.exports=function(){function e(t){var e={"2015-cantons-et-candidats":{url:"http://makinacorpus.github.io/elections/departementales-2015/app/public/"},"2015-resultats-departementales":{url:"http://makinacorpus.github.io/elections/departementales-2015/app/public/departement.html"}},s=e[t];return s&&s.url?s.url:"about:blank"}function s(){return document.querySelectorAll(r.phSelector)}function i(t){var s="mkc-"+o.generate(8);t.id=s;var i=t.dataset.source,n=new a.Parent(s,e(i),{});n.onMessage("event",function(e){"ready"===e&&n.sendMessage("data",JSON.stringify(t.dataset))})}function n(){var t=s();[].forEach.call(t,i)}var r={phSelector:".mkc-placeholder"};t("./dataset-polyfill.js");var a=t("pym.js"),o=t("randomstring");return{init:n}}()},{"./dataset-polyfill.js":"/var/www/html/projets/makina-loader/src/scripts/modules/dataset-polyfill.js","pym.js":"/var/www/html/projets/makina-loader/node_modules/pym.js/src/pym.js",randomstring:"/var/www/html/projets/makina-loader/node_modules/randomstring/index.js"}]},{},["./src/scripts/mkc.js"]);
//# sourceMappingURL=mkc.js.map
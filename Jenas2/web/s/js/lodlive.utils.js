function lang(r){return $.jStorage.get("language")[$.jStorage.get("selectedLanguage")][r]}function breakLines(r){return r=r.replace(/\//g,'/<span style="font-size:1px"> </span>'),r=r.replace(/&/g,'&<span style="font-size:1px"> </span>'),r=r.replace(/%/g,'%<span style="font-size:1px"> </span>')}function getSparqlConf(r,n,t){return n.sparql&&n.sparql[r]?n.sparql[r]:t.default.sparql[r]}$.fn.setBackgroundPosition=function(r){var n=$.trim(this.css("background-position")),t=-1!=n.indexOf("left");n=n.replace(/top/gi,"").replace(/left/gi,""),n=$.trim(n.replace(/  /g," "));try{var e=n.split(" ");(r.x||0==r.x)&&(e[0]=r.x+"px"),(r.y||0==r.y)&&(e[1]=r.y+"px"),n=t?"left "+e[0]+" top "+e[1]:e[0]+" "+e[1]}catch(r){alert(r)}return this.css({"background-position":n}),this};var MD5=function(r){function n(r,n){return r<<n|r>>>32-n}function t(r,n){var t,e,o,a,i;return o=2147483648&r,a=2147483648&n,t=1073741824&r,e=1073741824&n,i=(1073741823&r)+(1073741823&n),t&e?2147483648^i^o^a:t|e?1073741824&i?3221225472^i^o^a:1073741824^i^o^a:i^o^a}function e(r,n,t){return r&n|~r&t}function o(r,n,t){return r&t|n&~t}function a(r,n,t){return r^n^t}function i(r,n,t){return n^(r|~t)}function u(r,o,a,i,u,f,c){return r=t(r,t(t(e(o,a,i),u),c)),t(n(r,f),o)}function f(r,e,a,i,u,f,c){return r=t(r,t(t(o(e,a,i),u),c)),t(n(r,f),e)}function c(r,e,o,i,u,f,c){return r=t(r,t(t(a(e,o,i),u),c)),t(n(r,f),e)}function g(r,e,o,a,u,f,c){return r=t(r,t(t(i(e,o,a),u),c)),t(n(r,f),e)}function s(r){var n,t="",e="";for(n=0;n<=3;n++)t+=(e="0"+(r>>>8*n&255).toString(16)).substr(e.length-2,2);return t}if(!r)return"";r=(r=(r=r.replace(/http:\/\/.+~~/g,"")).replace(/nodeID:\/\/.+~~/g,"")).replace(/_:\/\/.+~~/g,"");var p,l,h,C,d,S,v,x,y,m=Array();for(m=function(r){for(var n,t=r.length,e=t+8,o=16*((e-e%64)/64+1),a=Array(o-1),i=0,u=0;u<t;)i=u%4*8,a[n=(u-u%4)/4]=a[n]|r.charCodeAt(u)<<i,u++;return n=(u-u%4)/4,i=u%4*8,a[n]=a[n]|128<<i,a[o-2]=t<<3,a[o-1]=t>>>29,a}(r=function(r){r=r.replace(/\r\n/g,"\n");for(var n="",t=0;t<r.length;t++){var e=r.charCodeAt(t);e<128?n+=String.fromCharCode(e):e>127&&e<2048?(n+=String.fromCharCode(e>>6|192),n+=String.fromCharCode(63&e|128)):(n+=String.fromCharCode(e>>12|224),n+=String.fromCharCode(e>>6&63|128),n+=String.fromCharCode(63&e|128))}return n}(r)),S=1732584193,v=4023233417,x=2562383102,y=271733878,p=0;p<m.length;p+=16)l=S,h=v,C=x,d=y,v=g(v=g(v=g(v=g(v=c(v=c(v=c(v=c(v=f(v=f(v=f(v=f(v=u(v=u(v=u(v=u(v,x=u(x,y=u(y,S=u(S,v,x,y,m[p+0],7,3614090360),v,x,m[p+1],12,3905402710),S,v,m[p+2],17,606105819),y,S,m[p+3],22,3250441966),x=u(x,y=u(y,S=u(S,v,x,y,m[p+4],7,4118548399),v,x,m[p+5],12,1200080426),S,v,m[p+6],17,2821735955),y,S,m[p+7],22,4249261313),x=u(x,y=u(y,S=u(S,v,x,y,m[p+8],7,1770035416),v,x,m[p+9],12,2336552879),S,v,m[p+10],17,4294925233),y,S,m[p+11],22,2304563134),x=u(x,y=u(y,S=u(S,v,x,y,m[p+12],7,1804603682),v,x,m[p+13],12,4254626195),S,v,m[p+14],17,2792965006),y,S,m[p+15],22,1236535329),x=f(x,y=f(y,S=f(S,v,x,y,m[p+1],5,4129170786),v,x,m[p+6],9,3225465664),S,v,m[p+11],14,643717713),y,S,m[p+0],20,3921069994),x=f(x,y=f(y,S=f(S,v,x,y,m[p+5],5,3593408605),v,x,m[p+10],9,38016083),S,v,m[p+15],14,3634488961),y,S,m[p+4],20,3889429448),x=f(x,y=f(y,S=f(S,v,x,y,m[p+9],5,568446438),v,x,m[p+14],9,3275163606),S,v,m[p+3],14,4107603335),y,S,m[p+8],20,1163531501),x=f(x,y=f(y,S=f(S,v,x,y,m[p+13],5,2850285829),v,x,m[p+2],9,4243563512),S,v,m[p+7],14,1735328473),y,S,m[p+12],20,2368359562),x=c(x,y=c(y,S=c(S,v,x,y,m[p+5],4,4294588738),v,x,m[p+8],11,2272392833),S,v,m[p+11],16,1839030562),y,S,m[p+14],23,4259657740),x=c(x,y=c(y,S=c(S,v,x,y,m[p+1],4,2763975236),v,x,m[p+4],11,1272893353),S,v,m[p+7],16,4139469664),y,S,m[p+10],23,3200236656),x=c(x,y=c(y,S=c(S,v,x,y,m[p+13],4,681279174),v,x,m[p+0],11,3936430074),S,v,m[p+3],16,3572445317),y,S,m[p+6],23,76029189),x=c(x,y=c(y,S=c(S,v,x,y,m[p+9],4,3654602809),v,x,m[p+12],11,3873151461),S,v,m[p+15],16,530742520),y,S,m[p+2],23,3299628645),x=g(x,y=g(y,S=g(S,v,x,y,m[p+0],6,4096336452),v,x,m[p+7],10,1126891415),S,v,m[p+14],15,2878612391),y,S,m[p+5],21,4237533241),x=g(x,y=g(y,S=g(S,v,x,y,m[p+12],6,1700485571),v,x,m[p+3],10,2399980690),S,v,m[p+10],15,4293915773),y,S,m[p+1],21,2240044497),x=g(x,y=g(y,S=g(S,v,x,y,m[p+8],6,1873313359),v,x,m[p+15],10,4264355552),S,v,m[p+6],15,2734768916),y,S,m[p+13],21,1309151649),x=g(x,y=g(y,S=g(S,v,x,y,m[p+4],6,4149444226),v,x,m[p+11],10,3174756917),S,v,m[p+2],15,718787259),y,S,m[p+9],21,3951481745),S=t(S,l),v=t(v,h),x=t(x,C),y=t(y,d);return(s(S)+s(v)+s(x)+s(y)).toLowerCase()};
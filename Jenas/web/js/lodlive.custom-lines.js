!function(t){var a={isSameAsLine:function(a,e,r,s,n,i,o){var h=180*Math.atan2(n-r,s-e)/Math.PI+180,l=e-Math.sqrt((s-e)*(s-e)+(n-r)*(n-r))+60;i.rotateCanvas({rotate:h,x:e,y:r}).drawLine({strokeStyle:"#000099",strokeWidth:3,strokeCap:"bevel",x1:e-60,y1:r,x2:l,y2:r}),h>90&&h<270&&i.rotateCanvas({rotate:180,x:(l+e)/2,y:(r+r)/2}),a=t.trim(a).replace(/\n/g,", "),i.drawText({fillStyle:"#000",strokeStyle:"#000",x:(l+e+(e+60>s?-60:60))/2,y:(r+r-(e+60>s?18:-18))/2,text:(e+60>s?" « ":"")+a+(e+60>s?"":" » "),align:"center",strokeWidth:.01,fontSize:11,fontFamily:"'Open Sans',Verdana"}).restoreCanvas().restoreCanvas(),h=Math.atan2(n-r,s-e);var y=Math.abs(8/Math.cos(.79)),M=s-60*Math.cos(h),c=n-60*Math.sin(h),p=h+Math.PI+.79,d=s+Math.cos(p)*y-60*Math.cos(h),f=n+Math.sin(p)*y-60*Math.sin(h),x=h+Math.PI-.79,v=s+Math.cos(x)*y-60*Math.cos(h),k=n+Math.sin(x)*y-60*Math.sin(h);i.drawLine({strokeStyle:"#000",strokeWidth:1,x1:M,y1:c,x2:v,y2:k}),i.drawLine({strokeStyle:"#000",strokeWidth:1,x1:M,y1:c,x2:d,y2:f})}};t.fn.customLines=function(t,e){if(a[e])return a[e].apply(this,Array.prototype.slice.call(arguments,2));if("object"==typeof e||!e)return a.init.apply(this,arguments);var r=Array.prototype.slice.call(arguments,2);r.unshift("standardLine"),t.lodlive.apply(null,r)}}(jQuery);
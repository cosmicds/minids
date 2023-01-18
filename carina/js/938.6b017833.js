"use strict";(self["webpackChunkcarina"]=self["webpackChunkcarina"]||[]).push([[938],{3938:(r,n,t)=>{var e;t.r(n),t.d(n,{NIL:()=>Q,parse:()=>b,stringify:()=>l,v1:()=>w,v3:()=>z,v4:()=>F,v5:()=>P,validate:()=>c,version:()=>X});var o=new Uint8Array(16);function a(){if(!e&&(e="undefined"!==typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!==typeof msCrypto&&"function"===typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),!e))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return e(o)}const u=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function i(r){return"string"===typeof r&&u.test(r)}const c=i;for(var s=[],f=0;f<256;++f)s.push((f+256).toString(16).substr(1));function v(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,t=(s[r[n+0]]+s[r[n+1]]+s[r[n+2]]+s[r[n+3]]+"-"+s[r[n+4]]+s[r[n+5]]+"-"+s[r[n+6]]+s[r[n+7]]+"-"+s[r[n+8]]+s[r[n+9]]+"-"+s[r[n+10]]+s[r[n+11]]+s[r[n+12]]+s[r[n+13]]+s[r[n+14]]+s[r[n+15]]).toLowerCase();if(!c(t))throw TypeError("Stringified UUID is invalid");return t}const l=v;var p,d,h=0,y=0;function g(r,n,t){var e=n&&t||0,o=n||new Array(16);r=r||{};var u=r.node||p,i=void 0!==r.clockseq?r.clockseq:d;if(null==u||null==i){var c=r.random||(r.rng||a)();null==u&&(u=p=[1|c[0],c[1],c[2],c[3],c[4],c[5]]),null==i&&(i=d=16383&(c[6]<<8|c[7]))}var s=void 0!==r.msecs?r.msecs:Date.now(),f=void 0!==r.nsecs?r.nsecs:y+1,v=s-h+(f-y)/1e4;if(v<0&&void 0===r.clockseq&&(i=i+1&16383),(v<0||s>h)&&void 0===r.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");h=s,y=f,d=i,s+=122192928e5;var g=(1e4*(268435455&s)+f)%4294967296;o[e++]=g>>>24&255,o[e++]=g>>>16&255,o[e++]=g>>>8&255,o[e++]=255&g;var w=s/4294967296*1e4&268435455;o[e++]=w>>>8&255,o[e++]=255&w,o[e++]=w>>>24&15|16,o[e++]=w>>>16&255,o[e++]=i>>>8|128,o[e++]=255&i;for(var m=0;m<6;++m)o[e+m]=u[m];return n||l(o)}const w=g;function m(r){if(!c(r))throw TypeError("Invalid UUID");var n,t=new Uint8Array(16);return t[0]=(n=parseInt(r.slice(0,8),16))>>>24,t[1]=n>>>16&255,t[2]=n>>>8&255,t[3]=255&n,t[4]=(n=parseInt(r.slice(9,13),16))>>>8,t[5]=255&n,t[6]=(n=parseInt(r.slice(14,18),16))>>>8,t[7]=255&n,t[8]=(n=parseInt(r.slice(19,23),16))>>>8,t[9]=255&n,t[10]=(n=parseInt(r.slice(24,36),16))/1099511627776&255,t[11]=n/4294967296&255,t[12]=n>>>24&255,t[13]=n>>>16&255,t[14]=n>>>8&255,t[15]=255&n,t}const b=m;function A(r){r=unescape(encodeURIComponent(r));for(var n=[],t=0;t<r.length;++t)n.push(r.charCodeAt(t));return n}var U="6ba7b810-9dad-11d1-80b4-00c04fd430c8",I="6ba7b811-9dad-11d1-80b4-00c04fd430c8";function C(r,n,t){function e(r,e,o,a){if("string"===typeof r&&(r=A(r)),"string"===typeof e&&(e=b(e)),16!==e.length)throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");var u=new Uint8Array(16+r.length);if(u.set(e),u.set(r,e.length),u=t(u),u[6]=15&u[6]|n,u[8]=63&u[8]|128,o){a=a||0;for(var i=0;i<16;++i)o[a+i]=u[i];return o}return l(u)}try{e.name=r}catch(o){}return e.DNS=U,e.URL=I,e}function R(r){if("string"===typeof r){var n=unescape(encodeURIComponent(r));r=new Uint8Array(n.length);for(var t=0;t<n.length;++t)r[t]=n.charCodeAt(t)}return k(D(M(r),8*r.length))}function k(r){for(var n=[],t=32*r.length,e="0123456789abcdef",o=0;o<t;o+=8){var a=r[o>>5]>>>o%32&255,u=parseInt(e.charAt(a>>>4&15)+e.charAt(15&a),16);n.push(u)}return n}function E(r){return 14+(r+64>>>9<<4)+1}function D(r,n){r[n>>5]|=128<<n%32,r[E(n)-1]=n;for(var t=1732584193,e=-271733879,o=-1732584194,a=271733878,u=0;u<r.length;u+=16){var i=t,c=e,s=o,f=a;t=q(t,e,o,a,r[u],7,-680876936),a=q(a,t,e,o,r[u+1],12,-389564586),o=q(o,a,t,e,r[u+2],17,606105819),e=q(e,o,a,t,r[u+3],22,-1044525330),t=q(t,e,o,a,r[u+4],7,-176418897),a=q(a,t,e,o,r[u+5],12,1200080426),o=q(o,a,t,e,r[u+6],17,-1473231341),e=q(e,o,a,t,r[u+7],22,-45705983),t=q(t,e,o,a,r[u+8],7,1770035416),a=q(a,t,e,o,r[u+9],12,-1958414417),o=q(o,a,t,e,r[u+10],17,-42063),e=q(e,o,a,t,r[u+11],22,-1990404162),t=q(t,e,o,a,r[u+12],7,1804603682),a=q(a,t,e,o,r[u+13],12,-40341101),o=q(o,a,t,e,r[u+14],17,-1502002290),e=q(e,o,a,t,r[u+15],22,1236535329),t=L(t,e,o,a,r[u+1],5,-165796510),a=L(a,t,e,o,r[u+6],9,-1069501632),o=L(o,a,t,e,r[u+11],14,643717713),e=L(e,o,a,t,r[u],20,-373897302),t=L(t,e,o,a,r[u+5],5,-701558691),a=L(a,t,e,o,r[u+10],9,38016083),o=L(o,a,t,e,r[u+15],14,-660478335),e=L(e,o,a,t,r[u+4],20,-405537848),t=L(t,e,o,a,r[u+9],5,568446438),a=L(a,t,e,o,r[u+14],9,-1019803690),o=L(o,a,t,e,r[u+3],14,-187363961),e=L(e,o,a,t,r[u+8],20,1163531501),t=L(t,e,o,a,r[u+13],5,-1444681467),a=L(a,t,e,o,r[u+2],9,-51403784),o=L(o,a,t,e,r[u+7],14,1735328473),e=L(e,o,a,t,r[u+12],20,-1926607734),t=N(t,e,o,a,r[u+5],4,-378558),a=N(a,t,e,o,r[u+8],11,-2022574463),o=N(o,a,t,e,r[u+11],16,1839030562),e=N(e,o,a,t,r[u+14],23,-35309556),t=N(t,e,o,a,r[u+1],4,-1530992060),a=N(a,t,e,o,r[u+4],11,1272893353),o=N(o,a,t,e,r[u+7],16,-155497632),e=N(e,o,a,t,r[u+10],23,-1094730640),t=N(t,e,o,a,r[u+13],4,681279174),a=N(a,t,e,o,r[u],11,-358537222),o=N(o,a,t,e,r[u+3],16,-722521979),e=N(e,o,a,t,r[u+6],23,76029189),t=N(t,e,o,a,r[u+9],4,-640364487),a=N(a,t,e,o,r[u+12],11,-421815835),o=N(o,a,t,e,r[u+15],16,530742520),e=N(e,o,a,t,r[u+2],23,-995338651),t=j(t,e,o,a,r[u],6,-198630844),a=j(a,t,e,o,r[u+7],10,1126891415),o=j(o,a,t,e,r[u+14],15,-1416354905),e=j(e,o,a,t,r[u+5],21,-57434055),t=j(t,e,o,a,r[u+12],6,1700485571),a=j(a,t,e,o,r[u+3],10,-1894986606),o=j(o,a,t,e,r[u+10],15,-1051523),e=j(e,o,a,t,r[u+1],21,-2054922799),t=j(t,e,o,a,r[u+8],6,1873313359),a=j(a,t,e,o,r[u+15],10,-30611744),o=j(o,a,t,e,r[u+6],15,-1560198380),e=j(e,o,a,t,r[u+13],21,1309151649),t=j(t,e,o,a,r[u+4],6,-145523070),a=j(a,t,e,o,r[u+11],10,-1120210379),o=j(o,a,t,e,r[u+2],15,718787259),e=j(e,o,a,t,r[u+9],21,-343485551),t=V(t,i),e=V(e,c),o=V(o,s),a=V(a,f)}return[t,e,o,a]}function M(r){if(0===r.length)return[];for(var n=8*r.length,t=new Uint32Array(E(n)),e=0;e<n;e+=8)t[e>>5]|=(255&r[e/8])<<e%32;return t}function V(r,n){var t=(65535&r)+(65535&n),e=(r>>16)+(n>>16)+(t>>16);return e<<16|65535&t}function S(r,n){return r<<n|r>>>32-n}function T(r,n,t,e,o,a){return V(S(V(V(n,r),V(e,a)),o),t)}function q(r,n,t,e,o,a,u){return T(n&t|~n&e,r,n,o,a,u)}function L(r,n,t,e,o,a,u){return T(n&e|t&~e,r,n,o,a,u)}function N(r,n,t,e,o,a,u){return T(n^t^e,r,n,o,a,u)}function j(r,n,t,e,o,a,u){return T(t^(n|~e),r,n,o,a,u)}const $=R;var x=C("v3",48,$);const z=x;function B(r,n,t){r=r||{};var e=r.random||(r.rng||a)();if(e[6]=15&e[6]|64,e[8]=63&e[8]|128,n){t=t||0;for(var o=0;o<16;++o)n[t+o]=e[o];return n}return l(e)}const F=B;function G(r,n,t,e){switch(r){case 0:return n&t^~n&e;case 1:return n^t^e;case 2:return n&t^n&e^t&e;case 3:return n^t^e}}function H(r,n){return r<<n|r>>>32-n}function J(r){var n=[1518500249,1859775393,2400959708,3395469782],t=[1732584193,4023233417,2562383102,271733878,3285377520];if("string"===typeof r){var e=unescape(encodeURIComponent(r));r=[];for(var o=0;o<e.length;++o)r.push(e.charCodeAt(o))}else Array.isArray(r)||(r=Array.prototype.slice.call(r));r.push(128);for(var a=r.length/4+2,u=Math.ceil(a/16),i=new Array(u),c=0;c<u;++c){for(var s=new Uint32Array(16),f=0;f<16;++f)s[f]=r[64*c+4*f]<<24|r[64*c+4*f+1]<<16|r[64*c+4*f+2]<<8|r[64*c+4*f+3];i[c]=s}i[u-1][14]=8*(r.length-1)/Math.pow(2,32),i[u-1][14]=Math.floor(i[u-1][14]),i[u-1][15]=8*(r.length-1)&4294967295;for(var v=0;v<u;++v){for(var l=new Uint32Array(80),p=0;p<16;++p)l[p]=i[v][p];for(var d=16;d<80;++d)l[d]=H(l[d-3]^l[d-8]^l[d-14]^l[d-16],1);for(var h=t[0],y=t[1],g=t[2],w=t[3],m=t[4],b=0;b<80;++b){var A=Math.floor(b/20),U=H(h,5)+G(A,y,g,w)+m+n[A]+l[b]>>>0;m=w,w=g,g=H(y,30)>>>0,y=h,h=U}t[0]=t[0]+h>>>0,t[1]=t[1]+y>>>0,t[2]=t[2]+g>>>0,t[3]=t[3]+w>>>0,t[4]=t[4]+m>>>0}return[t[0]>>24&255,t[0]>>16&255,t[0]>>8&255,255&t[0],t[1]>>24&255,t[1]>>16&255,t[1]>>8&255,255&t[1],t[2]>>24&255,t[2]>>16&255,t[2]>>8&255,255&t[2],t[3]>>24&255,t[3]>>16&255,t[3]>>8&255,255&t[3],t[4]>>24&255,t[4]>>16&255,t[4]>>8&255,255&t[4]]}const K=J;var O=C("v5",80,K);const P=O,Q="00000000-0000-0000-0000-000000000000";function W(r){if(!c(r))throw TypeError("Invalid UUID");return parseInt(r.substr(14,1),16)}const X=W}}]);
//# sourceMappingURL=938.6b017833.js.map
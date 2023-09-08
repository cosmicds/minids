"use strict";(self["webpackChunk_minids_annular_eclipse_2023"]=self["webpackChunk_minids_annular_eclipse_2023"]||[]).push([[938],{3938:(r,n,e)=>{var t;e.r(n),e.d(n,{NIL:()=>P,parse:()=>b,stringify:()=>l,v1:()=>m,v3:()=>x,v4:()=>B,v5:()=>O,validate:()=>s,version:()=>W});var o=new Uint8Array(16);function a(){if(!t&&(t="undefined"!==typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!==typeof msCrypto&&"function"===typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),!t))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return t(o)}const i=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function u(r){return"string"===typeof r&&i.test(r)}const s=u;for(var c=[],f=0;f<256;++f)c.push((f+256).toString(16).substr(1));function v(r){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,e=(c[r[n+0]]+c[r[n+1]]+c[r[n+2]]+c[r[n+3]]+"-"+c[r[n+4]]+c[r[n+5]]+"-"+c[r[n+6]]+c[r[n+7]]+"-"+c[r[n+8]]+c[r[n+9]]+"-"+c[r[n+10]]+c[r[n+11]]+c[r[n+12]]+c[r[n+13]]+c[r[n+14]]+c[r[n+15]]).toLowerCase();if(!s(e))throw TypeError("Stringified UUID is invalid");return e}const l=v;var p,d,h=0,y=0;function g(r,n,e){var t=n&&e||0,o=n||new Array(16);r=r||{};var i=r.node||p,u=void 0!==r.clockseq?r.clockseq:d;if(null==i||null==u){var s=r.random||(r.rng||a)();null==i&&(i=p=[1|s[0],s[1],s[2],s[3],s[4],s[5]]),null==u&&(u=d=16383&(s[6]<<8|s[7]))}var c=void 0!==r.msecs?r.msecs:Date.now(),f=void 0!==r.nsecs?r.nsecs:y+1,v=c-h+(f-y)/1e4;if(v<0&&void 0===r.clockseq&&(u=u+1&16383),(v<0||c>h)&&void 0===r.nsecs&&(f=0),f>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");h=c,y=f,d=u,c+=122192928e5;var g=(1e4*(268435455&c)+f)%4294967296;o[t++]=g>>>24&255,o[t++]=g>>>16&255,o[t++]=g>>>8&255,o[t++]=255&g;var m=c/4294967296*1e4&268435455;o[t++]=m>>>8&255,o[t++]=255&m,o[t++]=m>>>24&15|16,o[t++]=m>>>16&255,o[t++]=u>>>8|128,o[t++]=255&u;for(var w=0;w<6;++w)o[t+w]=i[w];return n||l(o)}const m=g;function w(r){if(!s(r))throw TypeError("Invalid UUID");var n,e=new Uint8Array(16);return e[0]=(n=parseInt(r.slice(0,8),16))>>>24,e[1]=n>>>16&255,e[2]=n>>>8&255,e[3]=255&n,e[4]=(n=parseInt(r.slice(9,13),16))>>>8,e[5]=255&n,e[6]=(n=parseInt(r.slice(14,18),16))>>>8,e[7]=255&n,e[8]=(n=parseInt(r.slice(19,23),16))>>>8,e[9]=255&n,e[10]=(n=parseInt(r.slice(24,36),16))/1099511627776&255,e[11]=n/4294967296&255,e[12]=n>>>24&255,e[13]=n>>>16&255,e[14]=n>>>8&255,e[15]=255&n,e}const b=w;function A(r){r=unescape(encodeURIComponent(r));for(var n=[],e=0;e<r.length;++e)n.push(r.charCodeAt(e));return n}var U="6ba7b810-9dad-11d1-80b4-00c04fd430c8",I="6ba7b811-9dad-11d1-80b4-00c04fd430c8";function C(r,n,e){function t(r,t,o,a){if("string"===typeof r&&(r=A(r)),"string"===typeof t&&(t=b(t)),16!==t.length)throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");var i=new Uint8Array(16+r.length);if(i.set(t),i.set(r,t.length),i=e(i),i[6]=15&i[6]|n,i[8]=63&i[8]|128,o){a=a||0;for(var u=0;u<16;++u)o[a+u]=i[u];return o}return l(i)}try{t.name=r}catch(o){}return t.DNS=U,t.URL=I,t}function R(r){if("string"===typeof r){var n=unescape(encodeURIComponent(r));r=new Uint8Array(n.length);for(var e=0;e<n.length;++e)r[e]=n.charCodeAt(e)}return k(E(D(r),8*r.length))}function k(r){for(var n=[],e=32*r.length,t="0123456789abcdef",o=0;o<e;o+=8){var a=r[o>>5]>>>o%32&255,i=parseInt(t.charAt(a>>>4&15)+t.charAt(15&a),16);n.push(i)}return n}function _(r){return 14+(r+64>>>9<<4)+1}function E(r,n){r[n>>5]|=128<<n%32,r[_(n)-1]=n;for(var e=1732584193,t=-271733879,o=-1732584194,a=271733878,i=0;i<r.length;i+=16){var u=e,s=t,c=o,f=a;e=T(e,t,o,a,r[i],7,-680876936),a=T(a,e,t,o,r[i+1],12,-389564586),o=T(o,a,e,t,r[i+2],17,606105819),t=T(t,o,a,e,r[i+3],22,-1044525330),e=T(e,t,o,a,r[i+4],7,-176418897),a=T(a,e,t,o,r[i+5],12,1200080426),o=T(o,a,e,t,r[i+6],17,-1473231341),t=T(t,o,a,e,r[i+7],22,-45705983),e=T(e,t,o,a,r[i+8],7,1770035416),a=T(a,e,t,o,r[i+9],12,-1958414417),o=T(o,a,e,t,r[i+10],17,-42063),t=T(t,o,a,e,r[i+11],22,-1990404162),e=T(e,t,o,a,r[i+12],7,1804603682),a=T(a,e,t,o,r[i+13],12,-40341101),o=T(o,a,e,t,r[i+14],17,-1502002290),t=T(t,o,a,e,r[i+15],22,1236535329),e=q(e,t,o,a,r[i+1],5,-165796510),a=q(a,e,t,o,r[i+6],9,-1069501632),o=q(o,a,e,t,r[i+11],14,643717713),t=q(t,o,a,e,r[i],20,-373897302),e=q(e,t,o,a,r[i+5],5,-701558691),a=q(a,e,t,o,r[i+10],9,38016083),o=q(o,a,e,t,r[i+15],14,-660478335),t=q(t,o,a,e,r[i+4],20,-405537848),e=q(e,t,o,a,r[i+9],5,568446438),a=q(a,e,t,o,r[i+14],9,-1019803690),o=q(o,a,e,t,r[i+3],14,-187363961),t=q(t,o,a,e,r[i+8],20,1163531501),e=q(e,t,o,a,r[i+13],5,-1444681467),a=q(a,e,t,o,r[i+2],9,-51403784),o=q(o,a,e,t,r[i+7],14,1735328473),t=q(t,o,a,e,r[i+12],20,-1926607734),e=L(e,t,o,a,r[i+5],4,-378558),a=L(a,e,t,o,r[i+8],11,-2022574463),o=L(o,a,e,t,r[i+11],16,1839030562),t=L(t,o,a,e,r[i+14],23,-35309556),e=L(e,t,o,a,r[i+1],4,-1530992060),a=L(a,e,t,o,r[i+4],11,1272893353),o=L(o,a,e,t,r[i+7],16,-155497632),t=L(t,o,a,e,r[i+10],23,-1094730640),e=L(e,t,o,a,r[i+13],4,681279174),a=L(a,e,t,o,r[i],11,-358537222),o=L(o,a,e,t,r[i+3],16,-722521979),t=L(t,o,a,e,r[i+6],23,76029189),e=L(e,t,o,a,r[i+9],4,-640364487),a=L(a,e,t,o,r[i+12],11,-421815835),o=L(o,a,e,t,r[i+15],16,530742520),t=L(t,o,a,e,r[i+2],23,-995338651),e=N(e,t,o,a,r[i],6,-198630844),a=N(a,e,t,o,r[i+7],10,1126891415),o=N(o,a,e,t,r[i+14],15,-1416354905),t=N(t,o,a,e,r[i+5],21,-57434055),e=N(e,t,o,a,r[i+12],6,1700485571),a=N(a,e,t,o,r[i+3],10,-1894986606),o=N(o,a,e,t,r[i+10],15,-1051523),t=N(t,o,a,e,r[i+1],21,-2054922799),e=N(e,t,o,a,r[i+8],6,1873313359),a=N(a,e,t,o,r[i+15],10,-30611744),o=N(o,a,e,t,r[i+6],15,-1560198380),t=N(t,o,a,e,r[i+13],21,1309151649),e=N(e,t,o,a,r[i+4],6,-145523070),a=N(a,e,t,o,r[i+11],10,-1120210379),o=N(o,a,e,t,r[i+2],15,718787259),t=N(t,o,a,e,r[i+9],21,-343485551),e=M(e,u),t=M(t,s),o=M(o,c),a=M(a,f)}return[e,t,o,a]}function D(r){if(0===r.length)return[];for(var n=8*r.length,e=new Uint32Array(_(n)),t=0;t<n;t+=8)e[t>>5]|=(255&r[t/8])<<t%32;return e}function M(r,n){var e=(65535&r)+(65535&n),t=(r>>16)+(n>>16)+(e>>16);return t<<16|65535&e}function V(r,n){return r<<n|r>>>32-n}function S(r,n,e,t,o,a){return M(V(M(M(n,r),M(t,a)),o),e)}function T(r,n,e,t,o,a,i){return S(n&e|~n&t,r,n,o,a,i)}function q(r,n,e,t,o,a,i){return S(n&t|e&~t,r,n,o,a,i)}function L(r,n,e,t,o,a,i){return S(n^e^t,r,n,o,a,i)}function N(r,n,e,t,o,a,i){return S(e^(n|~t),r,n,o,a,i)}const j=R;var $=C("v3",48,j);const x=$;function z(r,n,e){r=r||{};var t=r.random||(r.rng||a)();if(t[6]=15&t[6]|64,t[8]=63&t[8]|128,n){e=e||0;for(var o=0;o<16;++o)n[e+o]=t[o];return n}return l(t)}const B=z;function F(r,n,e,t){switch(r){case 0:return n&e^~n&t;case 1:return n^e^t;case 2:return n&e^n&t^e&t;case 3:return n^e^t}}function G(r,n){return r<<n|r>>>32-n}function H(r){var n=[1518500249,1859775393,2400959708,3395469782],e=[1732584193,4023233417,2562383102,271733878,3285377520];if("string"===typeof r){var t=unescape(encodeURIComponent(r));r=[];for(var o=0;o<t.length;++o)r.push(t.charCodeAt(o))}else Array.isArray(r)||(r=Array.prototype.slice.call(r));r.push(128);for(var a=r.length/4+2,i=Math.ceil(a/16),u=new Array(i),s=0;s<i;++s){for(var c=new Uint32Array(16),f=0;f<16;++f)c[f]=r[64*s+4*f]<<24|r[64*s+4*f+1]<<16|r[64*s+4*f+2]<<8|r[64*s+4*f+3];u[s]=c}u[i-1][14]=8*(r.length-1)/Math.pow(2,32),u[i-1][14]=Math.floor(u[i-1][14]),u[i-1][15]=8*(r.length-1)&4294967295;for(var v=0;v<i;++v){for(var l=new Uint32Array(80),p=0;p<16;++p)l[p]=u[v][p];for(var d=16;d<80;++d)l[d]=G(l[d-3]^l[d-8]^l[d-14]^l[d-16],1);for(var h=e[0],y=e[1],g=e[2],m=e[3],w=e[4],b=0;b<80;++b){var A=Math.floor(b/20),U=G(h,5)+F(A,y,g,m)+w+n[A]+l[b]>>>0;w=m,m=g,g=G(y,30)>>>0,y=h,h=U}e[0]=e[0]+h>>>0,e[1]=e[1]+y>>>0,e[2]=e[2]+g>>>0,e[3]=e[3]+m>>>0,e[4]=e[4]+w>>>0}return[e[0]>>24&255,e[0]>>16&255,e[0]>>8&255,255&e[0],e[1]>>24&255,e[1]>>16&255,e[1]>>8&255,255&e[1],e[2]>>24&255,e[2]>>16&255,e[2]>>8&255,255&e[2],e[3]>>24&255,e[3]>>16&255,e[3]>>8&255,255&e[3],e[4]>>24&255,e[4]>>16&255,e[4]>>8&255,255&e[4]]}const J=H;var K=C("v5",80,J);const O=K,P="00000000-0000-0000-0000-000000000000";function Q(r){if(!s(r))throw TypeError("Invalid UUID");return parseInt(r.substr(14,1),16)}const W=Q}}]);
//# sourceMappingURL=938.baa88880.js.map
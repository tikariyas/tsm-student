/* TSM certificate + ID card renderer (plain ES5 so it also runs in old WebViews) */
var TSMR=(function(){
var W=1697,H=2400,INK='#2e2219',BRN='#58300e';
function img(src,cb){var i=new Image();i.onload=function(){cb(i)};i.onerror=function(){cb(null)};i.src=src}
function seeded(str){var s=0,i;for(i=0;i<str.length;i++)s=(s*31+str.charCodeAt(i))>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function fontsReady(list,cb){var done=false;function go(){if(!done){done=true;cb()}}
  try{if(document.fonts&&document.fonts.load&&window.Promise){var p=[];for(var i=0;i<list.length;i++)p.push(document.fonts.load(list[i],'AaBb'));Promise.all(p).then(go,go);setTimeout(go,2500);return}}catch(e){}
  setTimeout(go,400)}
function fit(ctx,text,fontTpl,start,maxW){var s=start;while(s>30){ctx.font=fontTpl.replace('#',s);if(ctx.measureText(text).width<=maxW)break;s-=4}return s}
function spaced(ctx,text,cx,y,sp,faults){var ws=[],tot=0,i,x;for(i=0;i<text.length;i++){var w=ctx.measureText(text.charAt(i)).width;ws.push(w);tot+=w}
  tot+=sp*(text.length-1);x=cx-tot/2;ctx.textAlign='left';
  for(i=0;i<text.length;i++){var f=faults&&faults[i],ch=text.charAt(i);
    if(f){ctx.save();ctx.globalAlpha=(f.a==null?1:f.a);ctx.translate(x+ws[i]/2+(f.dx||0),y+(f.dy||0));ctx.rotate((f.r||0)*Math.PI/180);ctx.fillText(ch,-ws[i]/2,0);ctx.restore()}
    else ctx.fillText(ch,x,y);x+=ws[i]+sp}}
/* centred text, optionally with ONE letter slightly out of place (printing-press fault) */
function centred(ctx,text,cx,y,fault){ctx.textAlign='left';var tot=ctx.measureText(text).width,x0=cx-tot/2;
  if(!fault){ctx.fillText(text,x0,y);return}
  var i=fault.i,pre=text.slice(0,i),ch=text.charAt(i),post=text.slice(i+1),wp=ctx.measureText(pre).width,wc=ctx.measureText(ch).width;
  ctx.fillText(pre,x0,y);
  ctx.save();ctx.globalAlpha=(fault.a==null?1:fault.a);ctx.translate(x0+wp+wc/2+(fault.dx||0),y+(fault.dy||0));ctx.rotate((fault.r||0)*Math.PI/180);ctx.fillText(ch,-wc/2,0);ctx.restore();
  ctx.fillText(post,x0+wp+wc,y)}
function wrap(ctx,text,maxW){var words=text.split(' '),lines=[],cur='',i;for(i=0;i<words.length;i++){var t=cur?cur+' '+words[i]:words[i];if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=words[i]}else cur=t}if(cur)lines.push(cur);return lines}
function rule(ctx,x0,x1,y,w,dia){ctx.strokeStyle=INK;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  if(dia){var m=(x0+x1)/2;ctx.fillStyle=BRN;ctx.beginPath();ctx.moveTo(m-14,y);ctx.lineTo(m,y-13);ctx.lineTo(m+14,y);ctx.lineTo(m,y+13);ctx.closePath();ctx.fill()}}
function drawQR(ctx,text,x,y,size){var q=qrcode(0,'M');q.addData(text);q.make();var n=q.getModuleCount(),m=Math.max(1,Math.floor(size/n)),off=Math.floor((size-m*n)/2),r,c;
  ctx.fillStyle='#1e1812';for(r=0;r<n;r++)for(c=0;c<n;c++)if(q.isDark(r,c))ctx.fillRect(x+off+c*m,y+off+r*m,m,m)}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
var FONTS=['bold 46px LibSerif','italic 54px LibSerif','bold italic 46px LibSerif','400 50px LibSerif','italic 700 150px LoraI'];

function cert(o,cb){
  var base=o.base||'';
  fontsReady(FONTS,function(){
    img(base+'img/violinist.png',function(vio){img(base+'img/signature.png',function(sig){
      var cv=document.createElement('canvas');cv.width=W;cv.height=H;var ctx=cv.getContext('2d'),i,rnd=seeded(o.certId||'x');
      ctx.fillStyle='#f4ead4';ctx.fillRect(0,0,W,H);
      var g=ctx.createRadialGradient(W/2,H/2,H*0.32,W/2,H/2,H*0.78);g.addColorStop(0,'rgba(160,120,60,0)');g.addColorStop(1,'rgba(160,120,60,0.16)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle=INK;ctx.lineWidth=9;ctx.strokeRect(60,60,W-120,H-120);ctx.lineWidth=3;ctx.strokeRect(86,86,W-172,H-172);ctx.lineWidth=1.5;ctx.strokeRect(98,98,W-196,H-196);
      var cs=[[98,98,0,1,1],[W-98,98,90,-1,1],[W-98,H-98,180,-1,-1],[98,H-98,270,1,-1]],radii=[96,68,40],lws=[5,4,3],k;
      for(i=0;i<4;i++){var c=cs[i];for(k=0;k<3;k++){ctx.lineWidth=lws[k];ctx.beginPath();ctx.arc(c[0],c[1],radii[k],c[2]*Math.PI/180,(c[2]+90)*Math.PI/180);ctx.stroke()}
        ctx.fillStyle=INK;ctx.beginPath();ctx.arc(c[0]+c[3]*18,c[1]+c[4]*18,9,0,6.2832);ctx.fill()}
      var mids=[[W/2,60],[W/2,H-60],[60,H/2],[W-60,H/2]];ctx.fillStyle=INK;
      for(i=0;i<4;i++){var m=mids[i];ctx.beginPath();ctx.moveTo(m[0]-28,m[1]);ctx.lineTo(m[0],m[1]-20);ctx.lineTo(m[0]+28,m[1]);ctx.lineTo(m[0],m[1]+20);ctx.closePath();ctx.fill()}
      /* crest */
      ctx.strokeStyle=INK;ctx.lineWidth=7;ctx.beginPath();ctx.arc(W/2,330,150,0,6.2832);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(W/2,330,136,0,6.2832);ctx.stroke();
      if(vio){var vw=236,vh=vio.height*vw/vio.width;ctx.drawImage(vio,W/2-vw/2,330-vh/2,vw,vh)}
      ctx.fillStyle=INK;
      ctx.font='bold 46px LibSerif';spaced(ctx,'B. S. TIKARIYA CULTURAL FOUNDATION (R)',W/2,590,7);
      ctx.font='32px LibSerif';spaced(ctx,'CIN: '+(o.cin||''),W/2,640,3);
      rule(ctx,300,W-300,690,3,true);ctx.fillStyle=INK;
      var ts=fit(ctx,'CERTIFICATE','bold #px LibSerif',190,1210);ctx.font='bold '+ts+'px LibSerif';
      spaced(ctx,'CERTIFICATE',W/2,880,16,{3:{dy:9,r:1.6,a:0.93}});   /* press fault 1: the T sits low */
      ctx.font='italic bold 84px LibSerif';ctx.fillStyle=BRN;ctx.textAlign='center';ctx.fillText('of Musical Achievement',W/2,985);
      ctx.fillStyle=INK;rule(ctx,420,W-420,1040,2,false);
      ctx.font='italic 54px LibSerif';ctx.textAlign='center';ctx.fillText('This certificate is proudly presented to',W/2,1140);
      /* name, with press fault 2: one letter a little light and raised */
      var nm=o.name||'';fit(ctx,nm,'italic 700 #px LoraI',150,1250);var nf=null;
      if(nm.length>3){var ix=1+Math.floor(rnd()*(nm.length-2));if(nm.charAt(ix)===' ')ix=ix>1?ix-1:ix+1;nf={i:ix,dy:-5,r:2,a:0.78}}
      ctx.fillStyle=INK;centred(ctx,nm,W/2,1305,nf);
      ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(380,1345);ctx.lineTo(W-380,1345);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(450,1358);ctx.lineTo(W-450,1358);ctx.stroke();
      /* body, with press fault 3: one letter slightly dislocated */
      var body='for completing the '+o.exam+' examination in '+String(o.instrument).toUpperCase()+' with a grade of \u2018'+o.grade+'\u2019';
      ctx.font='400 50px LibSerif';ctx.fillStyle=INK;var lines=wrap(ctx,body,1330),y=1470;
      for(i=0;i<lines.length;i++){var fl=null;if(i===0&&lines[0].length>12){fl={i:Math.floor(lines[0].length*0.45),dy:5,r:1,a:0.88}}centred(ctx,lines[i],W/2,y,fl);y+=66}
      ctx.font='italic bold 46px LibSerif';ctx.textAlign='center';ctx.fillText('Congratulations on your continued progress and hard work!',W/2,y+50);
      /* date + id */
      ctx.textAlign='left';ctx.font='bold 42px LibSerif';var l1=ctx.measureText('Date:').width,l2=ctx.measureText('Cert. Id:').width;ctx.fillText('Date:',240,1800);ctx.fillText('Cert. Id:',850,1800);
      ctx.font='400 42px LibSerif';ctx.fillText(o.date,240+l1+16,1796);ctx.fillText(o.certId,850+l2+16,1796);
      ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(240+l1+8,1810);ctx.lineTo(240+l1+8+340,1810);ctx.moveTo(850+l2+8,1810);ctx.lineTo(1450,1810);ctx.stroke();
      /* QR card */
      ctx.fillStyle='#faf4e6';rr(ctx,215,1850,300,340,14);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=4;rr(ctx,215,1850,300,340,14);ctx.stroke();
      if(o.qr)drawQR(ctx,o.qr,247,1876,236);
      ctx.fillStyle=INK;ctx.font='italic 30px LibSerif';ctx.textAlign='center';ctx.fillText('Scan to verify',365,2164);
      /* signature */
      if(sig){var sw=420,sh=sig.height*sw/sig.width;ctx.drawImage(sig,1280-sw/2,2170-sh-8,sw,sh)}
      ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1030,2170);ctx.lineTo(1530,2170);ctx.stroke();
      ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='bold 44px LibSerif';ctx.fillText('Manoj Tikariya',1280,2218);ctx.font='italic 34px LibSerif';ctx.fillText('Director',1280,2262);
      /* school verification block: seal + signature space for the student's school */
      ctx.fillStyle=BRN;ctx.font='italic 30px LibSerif';ctx.textAlign='center';ctx.fillText('Authenticity verified by school',772,1895);
      ctx.strokeStyle=INK;ctx.lineWidth=3;if(ctx.setLineDash)ctx.setLineDash([10,8]);ctx.beginPath();ctx.arc(772,2010,92,0,6.2832);ctx.stroke();if(ctx.setLineDash)ctx.setLineDash([]);
      ctx.fillStyle='#8a7a62';ctx.font='italic 26px LibSerif';ctx.fillText('School seal',772,2018);
      ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(600,2170);ctx.lineTo(945,2170);ctx.stroke();
      ctx.fillStyle=INK;ctx.font='italic 30px LibSerif';ctx.fillText('Sign of school authority',772,2210);
      if(o.school){fit(ctx,o.school,'italic #px LibSerif',26,390);ctx.fillStyle=BRN;ctx.fillText(o.school,772,2252)}
      cb(cv)})})})}

function idcard(o,cb){
  var base=o.base||'',pw=1011,ph=638;
  fontsReady(FONTS,function(){
    img(base+'img/logo.png',function(vio){var withPhoto=function(photo){
      var cv=document.createElement('canvas');cv.width=pw;cv.height=ph;var ctx=cv.getContext('2d'),i;
      ctx.fillStyle='#f4ead4';ctx.fillRect(0,0,pw,ph);ctx.strokeStyle=INK;ctx.lineWidth=5;rr(ctx,10,10,pw-20,ph-20,22);ctx.stroke();
      ctx.fillStyle='#3b2314';ctx.save();rr(ctx,14,14,pw-28,140,20);ctx.clip();ctx.fillRect(14,14,pw-28,140);ctx.restore();
      ctx.fillStyle='#f4ead4';ctx.beginPath();ctx.arc(100,84,58,0,6.2832);ctx.fill();
      if(vio){ctx.save();ctx.beginPath();ctx.arc(100,84,56,0,6.2832);ctx.clip();ctx.drawImage(vio,44,28,112,112);ctx.restore()}
      ctx.textAlign='left';ctx.fillStyle='#f4ead4';ctx.font='italic 700 64px LoraI';ctx.fillText('TSM',186,92);ctx.font='400 32px LibSerif';ctx.fillText('Tikariya\u2019s School of Music',186,134);
      /* photo */
      ctx.save();ctx.beginPath();ctx.arc(150,340,100,0,6.2832);ctx.clip();
      if(photo){var s=Math.max(200/photo.width,200/photo.height),dw=photo.width*s,dh=photo.height*s;ctx.drawImage(photo,150-dw/2,340-dh/2,dw,dh)}
      else{ctx.fillStyle='#ffffff';ctx.fillRect(50,240,200,200);if(vio)ctx.drawImage(vio,50,240,200,200)}
      ctx.restore();ctx.strokeStyle=INK;ctx.lineWidth=4;ctx.beginPath();ctx.arc(150,340,100,0,6.2832);ctx.stroke();
      ctx.fillStyle=INK;ctx.textAlign='left';fit(ctx,o.name||'','bold #px LibSerif',48,680);ctx.fillText(o.name||'',280,250);
      ctx.font='bold 34px LibSerif';ctx.fillStyle=BRN;ctx.fillText('ID: '+o.no,280,300);
      ctx.fillStyle=INK;ctx.font='400 30px LibSerif';var ls=o.lines||[];for(i=0;i<ls.length&&i<4;i++)ctx.fillText(ls[i],280,352+i*42);
      ctx.font='italic 24px LibSerif';ctx.fillStyle=BRN;ctx.fillText(o.since?('Since '+o.since):'',50,590);
      ctx.fillStyle='#faf4e6';rr(ctx,760,352,210,250,12);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;rr(ctx,760,352,210,250,12);ctx.stroke();
      if(o.qr)drawQR(ctx,o.qr,772,362,186);
      ctx.fillStyle=INK;ctx.font='italic 22px LibSerif';ctx.textAlign='center';ctx.fillText('Scan for attendance',865,590);
      cb(cv)};
      if(o.photo)img(o.photo,withPhoto);else withPhoto(null)})})}
return {cert:cert,idcard:idcard}})();

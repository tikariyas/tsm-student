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

function note(ctx,x,y,col,flag){ctx.fillStyle=col;ctx.strokeStyle=col;ctx.save();ctx.translate(x,y);ctx.rotate(-0.35);ctx.scale(1.35,1);ctx.beginPath();ctx.arc(0,0,11,0,6.2832);ctx.fill();ctx.restore();
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+14,y-4);ctx.lineTo(x+14,y-58);ctx.stroke();
  if(flag){ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+14,y-58);ctx.quadraticCurveTo(x+40,y-46,x+30,y-22);ctx.stroke()}}
function beamed(ctx,x,y,col){note(ctx,x,y,col,0);note(ctx,x+42,y-9,col,0);ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x+14,y-58);ctx.lineTo(x+56,y-67);ctx.stroke()}
var NC=['#E21F26','#00A1E4','#009846','#EE7B1C','#F5B800','#3A3283'];
function idcard(o,cb){
  var base=o.base||'',pw=1011,ph=638;
  fontsReady(FONTS,function(){
    img(base+'img/logo.png',function(logo){var withPhoto=function(photo){
      var cv=document.createElement('canvas');cv.width=pw;cv.height=ph;var ctx=cv.getContext('2d'),i;
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,pw,ph);
      ctx.strokeStyle='#3A3283';ctx.lineWidth=6;rr(ctx,8,8,pw-16,ph-16,24);ctx.stroke();
      if(logo){ctx.save();ctx.beginPath();ctx.arc(95,82,64,0,6.2832);ctx.clip();ctx.drawImage(logo,31,18,128,128);ctx.restore()}
      ctx.textAlign='left';ctx.fillStyle='#3A3283';ctx.font='bold 40px LibSerif';ctx.fillText('Tikariya\u2019s School of Music',190,66);
      ctx.fillStyle='#E21F26';ctx.font='bold 20px LibSerif';ctx.fillText('S T U D E N T   I D   C A R D',192,96);
      ctx.strokeStyle='#B9B5D6';ctx.lineWidth=2;for(i=0;i<5;i++){ctx.beginPath();ctx.moveTo(190,108+i*9);ctx.lineTo(985,108+i*9);ctx.stroke()}
      note(ctx,745,144,NC[1],1);beamed(ctx,800,136,NC[2]);note(ctx,880,126,NC[3],1);note(ctx,930,144,NC[0],1);
      var seg=(pw-60)/6;for(i=0;i<6;i++){ctx.fillStyle=NC[i];ctx.fillRect(30+i*seg,166,seg+1,9)}
      ctx.save();ctx.beginPath();ctx.arc(125,300,86,0,6.2832);ctx.clip();ctx.fillStyle='#ffffff';ctx.fillRect(39,214,172,172);
      var pic=photo||logo;if(pic){var s=Math.max(172/pic.width,172/pic.height),dw=pic.width*s,dh=pic.height*s;ctx.drawImage(pic,125-dw/2,300-dh/2,dw,dh)}ctx.restore();
      ctx.strokeStyle='#00A1E4';ctx.lineWidth=7;ctx.beginPath();ctx.arc(125,300,89,0,6.2832);ctx.stroke();
      ctx.fillStyle='#111111';ctx.textAlign='left';fit(ctx,o.name||'','bold #px LibSerif',44,520);ctx.fillText(o.name||'',238,232);
      ctx.font='bold 28px LibSerif';ctx.fillStyle='#E21F26';ctx.fillText('ID: '+o.no,238,270);
      ctx.fillStyle='#111111';ctx.font='400 25px LibSerif';var ls=o.lines||[],y=306;for(i=0;i<ls.length&&i<3;i++){ctx.fillText(ls[i],238,y);y+=31}
      y=Math.max(y+6,380);ctx.font='400 22px LibSerif';
      if(o.adm){ctx.font='bold 22px LibSerif';ctx.fillText('Admission: ',238,y);var w1=ctx.measureText('Admission: ').width;ctx.font='400 22px LibSerif';ctx.fillText(o.adm,238+w1,y);y+=31}
      if(o.school){ctx.font='bold 22px LibSerif';ctx.fillText('School: ',238,y);var w2=ctx.measureText('School: ').width;fit(ctx,o.school,'400 #px LibSerif',22,520-w2);ctx.fillText(o.school,238+w2,y);y+=31}
      if(o.parent){ctx.font='bold 22px LibSerif';ctx.fillText('Parent mobile: ',238,y);var w3=ctx.measureText('Parent mobile: ').width;ctx.font='400 22px LibSerif';ctx.fillText(o.parent,238+w3,y)}
      ctx.fillStyle='#ffffff';rr(ctx,790,196,190,190,12);ctx.fill();ctx.strokeStyle='#3A3283';ctx.lineWidth=4;rr(ctx,790,196,190,190,12);ctx.stroke();
      if(o.qr)drawQR(ctx,o.qr,800,206,170);
      ctx.fillStyle='#3A3283';ctx.font='italic 20px LibSerif';ctx.textAlign='center';ctx.fillText('Scan for attendance',885,412);
      note(ctx,822,490,NC[5],1);note(ctx,882,498,NC[4],1);note(ctx,938,488,NC[3],1);
      ctx.strokeStyle='#EE7B1C';ctx.lineWidth=3;rr(ctx,30,512,pw-60,100,14);ctx.stroke();
      ctx.textAlign='left';ctx.fillStyle='#E21F26';ctx.font='bold 22px LibSerif';ctx.fillText('If found, please return to:',52,546);
      ctx.fillStyle='#111111';ctx.font='bold 24px LibSerif';ctx.fillText('Tikariya\u2019s School of Music \u00b7 Mobile: '+(o.tsmPhone||'9821808889'),52,578);
      ctx.fillStyle='#3A3283';ctx.font='italic 16px LibSerif';ctx.fillText('B. S. Tikariya Cultural Foundation (R)',52,600);
      cb(cv)};
      if(o.photo)img(o.photo,withPhoto);else withPhoto(null)})})}
return {cert:cert,idcard:idcard}})();

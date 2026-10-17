// Servidor mínimo sin dependencias: sirve la PWA y una API REST con CRUD.  Uso: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const DB='db.json';let data=fs.existsSync(DB)?JSON.parse(fs.readFileSync(DB)||'[]'):[];
const save=()=>fs.writeFileSync(DB,JSON.stringify(data,null,2));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const json=(res,code,obj)=>{res.statusCode=code;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj));};
const body=req=>new Promise(ok=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(_){ok(null)}});});

// Crear o actualizar (idempotente): el id lo genera el cliente, así un reintento no duplica
function upsert(it){
  const k=data.findIndex(x=>x.id===it.id);
  const clean={id:it.id,titulo:it.titulo,prioridad:it.prioridad,descripcion:it.descripcion||'',fecha:it.fecha,updated:it.updated||it.fecha,synced:true};
  if(k<0){data.push(clean);return 'created';}
  if((clean.updated||'')>=(data[k].updated||'')){data[k]=clean;return 'updated';}
  return 'ignored';                       // llegó una versión más vieja: se conserva la del servidor
}

http.createServer(async(req,res)=>{
  const url=req.url.split('?')[0];
  const m=url.match(/^\/api\/incidencias(?:\/([^/]+))?$/);
  if(m){
    const id=m[1]&&decodeURIComponent(m[1]);
    if(req.method==='GET'&&!id)return json(res,200,data);                       // READ (lista)
    if(req.method==='GET'&&id){const x=data.find(d=>d.id===id);return x?json(res,200,x):json(res,404,{ok:false});} // READ (uno)
    if(req.method==='POST'&&!id){                                               // CREATE
      const it=await body(req);if(!it||!it.id||!it.titulo)return json(res,400,{ok:false,error:'Datos inválidos'});
      const r=upsert(it);save();return json(res,r==='created'?201:200,{ok:true,id:it.id,result:r});}
    if(req.method==='PUT'&&id){                                                 // UPDATE
      const it=await body(req);if(!it||!it.titulo)return json(res,400,{ok:false,error:'Datos inválidos'});
      const r=upsert({...it,id});save();return json(res,200,{ok:true,id,result:r});}
    if(req.method==='DELETE'&&id){                                              // DELETE (idempotente)
      const n=data.length;data=data.filter(x=>x.id!==id);if(data.length!==n)save();
      return json(res,200,{ok:true,id});}
    return json(res,405,{ok:false});
  }
  let f=url==='/'?'/index.html':url;f=path.join(__dirname,path.normalize(f));
  if(!f.startsWith(__dirname)){res.statusCode=403;return res.end('403');}
  fs.readFile(f,(e,c)=>{if(e){res.statusCode=404;return res.end('404');}
    res.setHeader('Content-Type',types[path.extname(f)]||'text/plain');res.end(c);});
}).listen(3000,()=>console.log('http://localhost:3000'));
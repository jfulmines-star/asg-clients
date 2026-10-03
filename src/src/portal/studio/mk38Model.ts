import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Nonfunctional exterior silhouette, normalized for a protective-cover concept.
export function buildMK38(assembly:T.Group){
 const mount=new T.Group();mount.name='MK 38 exterior silhouette - illustrative';assembly.add(mount)
 const cover=new T.Group();cover.name='Cover concept - unverified seams and closures';assembly.add(cover)
 const grey=new T.MeshStandardMaterial({color:'#849297',roughness:.6,metalness:.35})
 const edge=new T.MeshStandardMaterial({color:'#58686e',roughness:.55,metalness:.45})
 const dark=new T.MeshStandardMaterial({color:'#283438',roughness:.5,metalness:.55})
 const mesh=(g:T.BufferGeometry,m:T.Material,parent:T.Object3D=mount)=>{const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material=grey,parent:T.Object3D=mount,r=.055){const o=mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,parent);o.position.set(x,y,z);return o}
 function cylinder(x:number,y:number,z:number,r:number,h:number,mat:T.Material=grey,axis='y',parent:T.Object3D=mount){const o=mesh(new T.CylinderGeometry(r,r,h,48),mat,parent);o.position.set(x,y,z);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}
 function pipe(points:number[][],r:number,mat:T.Material,parent:T.Object3D=mount){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number]))),48,r,8,false),mat,parent)}
 // Pedestal, circular base and two broad side supports, matching the reference silhouette.
 cylinder(.45,-1.83,0,1.16,.16,edge)
 cylinder(.45,-1.37,0,.83,.8)
 cylinder(.45,-.97,0,1.02,.15,edge)
 cylinder(.45,-.83,0,.98,.13)
 for(const z of [-.58,.58]){
  const shape=new T.Shape();shape.moveTo(-.65,-.82);shape.lineTo(1.27,-.82);shape.lineTo(.91,.38);shape.lineTo(-.3,.6);shape.closePath()
  const o=mesh(new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2}),grey);o.position.z=z-.09
  cylinder(-.28,.49,z,.29,.25,edge,'z')
  box(.43,-.24,z+.1,.54,.48,.035,edge)
 }
 box(.52,.51,0,1.78,.61,.93)
 box(1.43,.19,0,.45,.79,1.04,edge)
 box(.88,.87,-.15,.77,.16,.72,edge)
 cylinder(-1.14,.73,0,.22,1.15,edge,'x')
 cylinder(-2.38,.8,0,.075,1.6,dark,'x')
 cylinder(-3.2,.8,0,.105,.23,dark,'x')
 // Plain exterior side canister; no internal mechanisms or operational parts.
 cylinder(-.37,.51,.82,.23,.36,grey,'z')
 box(.72,.45,-.87,.7,.6,.42)
 pipe([[1.3,-.12,.57],[1.5,-.41,.65],[1.34,-.72,.62],[.77,-.82,.64]],.045,dark)
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2;cylinder(.45+Math.cos(a)*1.05,-1.73,Math.sin(a)*1.05,.035,.035,edge)}
 // Fabric with broad, restrained folds rather than a rigid equipment shell.
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!
 ctx.fillStyle='#888';ctx.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){ctx.fillStyle=i%8?'#999':'#777';ctx.fillRect(i,0,1,128);ctx.fillRect(0,i,128,1)}
 const weave=new T.CanvasTexture(canvas);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(8,6)
 const cloth=new T.MeshStandardMaterial({color:'#a5adae',roughness:.96,bumpMap:weave,bumpScale:.014,side:T.DoubleSide,transparent:true})
 const trim=new T.MeshStandardMaterial({color:'#29343a',roughness:.9,transparent:true})
 const stitch=new T.MeshStandardMaterial({color:'#b9c1bc',roughness:1,transparent:true})
 const fabric=new RoundedBoxGeometry(2.62,1.2,1.59,12,.18)
 const attr=fabric.getAttribute('position')
 for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i);const f=.04*Math.sin(x*9+z*6+y*3)+.018*Math.sin(y*14-x*5);const side=Math.min(1,Math.abs(z)/.7);attr.setXYZ(i,x+f*.4,y+f*.65-.045*Math.sin(x*2.4)**2,z+Math.sign(z)*f*side)}
 fabric.computeVertexNormals();const body=mesh(fabric,cloth,cover);body.position.set(.36,.46,0)
 // Long tapered cover sleeve extends from the main fabric body.
 const sleeve=mesh(new T.CylinderGeometry(.33,.16,2.64,64,35),cloth,cover);sleeve.rotation.z=-Math.PI/2;sleeve.position.set(-2.06,.77,0)
 const sleeveAttr=sleeve.geometry.getAttribute('position');for(let i=0;i<sleeveAttr.count;i++){const y=sleeveAttr.getY(i),x=sleeveAttr.getX(i),z=sleeveAttr.getZ(i);const fold=1+.045*Math.sin(y*19+Math.atan2(z,x)*5);sleeveAttr.setXYZ(i,x*fold,y,z*fold)}sleeve.geometry.computeVertexNormals()
 // Dark lower hem and straps, inspired by the supplied workshop video.
 pipe([[-.89,-.12,.73],[-.1,-.16,.82],[.8,-.16,.82],[1.6,-.05,.65],[1.67,-.03,0],[1.6,-.05,-.65],[.8,-.16,-.82],[-.1,-.16,-.82],[-.89,-.12,-.73]],.035,trim,cover)
 for(const x of [-.64,.93]){
  pipe([[x,-.16,-.79],[x,.47,-.82],[x,.97,-.62],[x,1.06,0],[x,.97,.62],[x,.47,.82],[x,-.16,.79]],.025,trim,cover)
  box(x,-.01,.82,.11,.2,.065,trim,cover,.015)
 }
 pipe([[-3.25,.72,.11],[-2.6,.65,.14],[-1.8,.57,.18],[-.9,.55,.23]],.017,trim,cover)
 pipe([[-.89,.96,.54],[-.3,1.065,.55],[.7,1.065,.55],[1.54,.91,.54]],.006,stitch,cover)
 // Reinforced side opening shown as an illustrative raised collar.
 const collar=mesh(new T.TorusGeometry(.275,.035,12,64),trim,cover);collar.position.set(-.37,.51,.833)
 cylinder(-.37,.51,.89,.224,.13,grey,'z',cover)
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=256;const lc=labelCanvas.getContext('2d')!
 lc.fillStyle='#26332f';lc.fillRect(0,0,512,256);lc.fillStyle='#edf2e9';lc.font='bold 65px sans-serif';lc.fillText('Envelop',30,115);lc.font='23px monospace';lc.fillText('CONCEPT / MK 38',34,170)
 const labelTexture=new T.CanvasTexture(labelCanvas);const labelMat=new T.MeshStandardMaterial({map:labelTexture,roughness:.95,transparent:true})
 const label=mesh(new T.PlaneGeometry(.75,.375),labelMat,cover);label.position.set(.65,.52,.825)
 // Separate cover assemblies share visibility/lift controls without hiding the equipment.
 const mainCover=new T.Group();mainCover.name='Envelop main cover';mainCover.add(...cover.children.slice());cover.add(mainCover)
 const eosCover=new T.Group();eosCover.name='Envelop EOS cover';cover.add(eosCover)
 const sx=-.65,sz=-1.35
 box(sx,.48,-1.04,.38,.17,.72,edge)
 cylinder(sx,.92,sz,.32,.66,grey)
 cylinder(sx,1.28,sz,.35,.1,edge)
 box(sx,1.91,sz,.67,1.05,.65,grey,mount,.2)
 const dome=mesh(new T.SphereGeometry(1,32,24),grey);dome.scale.set(.12,.43,.28);dome.position.set(sx-.3,1.95,sz)
 // Exterior hood inferred from the supplied covered photo; no sensor internals modeled.
 const hoodGeo=new RoundedBoxGeometry(.86,2.03,.86,14,.23)
 const hp=hoodGeo.getAttribute('position')
 for(let i=0;i<hp.count;i++){const x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);const fold=.025*Math.sin(x*20+y*3)+.017*Math.sin(z*22-y*2);hp.setXYZ(i,x+Math.sign(x)*fold,y,z+Math.sign(z)*fold)}
 hoodGeo.computeVertexNormals();const hood=mesh(hoodGeo,cloth,eosCover);hood.position.set(sx,1.56,sz)
 for(const y of [.79,1.18])pipe([[sx-.4,y,sz-.32],[sx,y,sz-.44],[sx+.4,y,sz-.32],[sx+.44,y,sz],[sx+.4,y,sz+.32],[sx,y,sz+.44],[sx-.4,y,sz+.32],[sx-.44,y,sz],[sx-.4,y,sz-.32]],.023,trim,eosCover)
 box(sx+.25,1.18,sz+.425,.085,.13,.045,trim,eosCover,.01)
 box(sx-.25,.58,sz+.37,.055,.35,.016,trim,eosCover,.005)
 pipe([[sx-.28,.67,sz+.4],[sx-.28,1.45,sz+.44],[sx-.27,2.3,sz+.32],[sx,2.57,sz+.2]],.006,stitch,eosCover)
 const eosLabelCanvas=document.createElement('canvas');eosLabelCanvas.width=512;eosLabelCanvas.height=256;const ec=eosLabelCanvas.getContext('2d')!
 ec.fillStyle='#26332f';ec.fillRect(0,0,512,256);ec.fillStyle='#edf2e9';ec.font='bold 65px sans-serif';ec.fillText('Envelop',30,115);ec.font='23px monospace';ec.fillText('EOS / CONCEPT',34,170)
 const eosLabelTexture=new T.CanvasTexture(eosLabelCanvas),eosLabelMat=new T.MeshStandardMaterial({map:eosLabelTexture,roughness:.95,transparent:true})
 const eosLabel=mesh(new T.PlaneGeometry(.55,.275),eosLabelMat,eosCover);eosLabel.position.set(sx,1.74,sz+.459)
 const optionalSide=new T.Group();optionalSide.name='Optional side-mounted exterior detail';mount.add(optionalSide)
 box(.38,.11,1.05,.7,.1,.64,edge,optionalSide)
 box(.48,.32,1.28,.9,.38,.36,dark,optionalSide)
 cylinder(-.54,.35,1.28,.045,1.25,dark,'x',optionalSide)
 const sideCover=new T.Group();sideCover.name='Envelop optional side cover';cover.add(sideCover)
 const sideBody=mesh(new RoundedBoxGeometry(1.05,.55,.56,9,.12),cloth,sideCover);sideBody.position.set(.43,.32,1.28)
 const sideSleeve=mesh(new T.CylinderGeometry(.13,.085,1.36,48,18),cloth,sideCover);sideSleeve.rotation.z=-Math.PI/2;sideSleeve.position.set(-.66,.35,1.28)
 pipe([[.9,.07,1.04],[.95,.07,1.28],[.9,.07,1.52],[.1,.07,1.54],[-.1,.12,1.4]],.015,trim,sideCover)
 const sideLabel=mesh(new T.PlaneGeometry(.52,.26),labelMat,sideCover);sideLabel.position.set(.46,.33,1.567)
 return {cover,cloth,optionalSide,coverParts:{main:mainCover,eos:eosCover,side:sideCover},coverMaterials:[cloth,trim,stitch,labelMat,eosLabelMat],textures:[weave,labelTexture,eosLabelTexture]}
}

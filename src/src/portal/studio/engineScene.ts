import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EQUIPMENT, type EquipmentId } from './catalog'
import { buildF35 } from './f35Model'
import { buildMK38 } from './mk38Model'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

export type ViewMode = 'covered' | 'transparent' | 'uncovered'
export type CameraView = 'hero' | 'front' | 'side' | 'rear'
export type CoverSet = 'both' | 'main' | 'eos' | 'side' | 'canopy' | 'intakes' | 'exhaust'
export interface SceneSettings { coverSet?: CoverSet; sideGun?: boolean; mode: ViewMode; color: string; lift: number; rotate: boolean; hotspots: boolean }
export const POINTS = EQUIPMENT.v2500.points

export function createEngineScene(host: HTMLDivElement, onProject: (points: {x:number;y:number;visible:boolean}[]) => void, onInteraction: () => void, equipment: EquipmentId = 'v2500', aircraft?: T.Group) {
  if(equipment==='f35a'&&!aircraft)throw new Error('F-35A model has not loaded')
  const item = EQUIPMENT[equipment]
  const liftDistance=equipment==='mk38'?2.15:equipment==='f35a'?1.45:2.8
  const scene = new T.Scene()
  scene.background = new T.Color('#0b1110')
  scene.fog = new T.Fog('#0b1110', 19, 38)
  const camera = new T.PerspectiveCamera(equipment==='v2500'?35:38, 1, .1, 80)
  camera.position.set(-7.4, 4.0, 8.9)
  const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.toneMappingExposure = .95
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-label', `Interactive ${item.title} cover concept. Drag to rotate; use view and zoom buttons for keyboard control.`)
  host.appendChild(renderer.domElement)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 5.5
  controls.maxDistance = 17
  controls.maxPolarAngle = Math.PI * .53
  controls.minPolarAngle = .25
  controls.target.set(0, equipment==='mk38'?.5:equipment==='f35a'?-.9:.1, 0)
  controls.update()
  controls.autoRotateSpeed = .6
  controls.addEventListener('start', onInteraction)
  const pmrem = new T.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, .04)
  scene.environment = environment.texture
  scene.environmentIntensity = .7
  room.dispose()
  pmrem.dispose()
  scene.add(new T.HemisphereLight('#e4f2ff', '#182f25', .8))
  const key = new T.DirectionalLight('#e3edff', 2)
  key.position.set(-4, 8, 4); key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  Object.assign(key.shadow.camera, {left:-8,right:8,top:8,bottom:-8})
  key.shadow.normalBias = .04
  scene.add(key)
  const rim = new T.DirectionalLight('#77edb2', 1.2)
  rim.position.set(4, 3, -5); scene.add(rim)
  const floor = new T.Mesh(new T.PlaneGeometry(120,120), new T.MeshStandardMaterial({color:'#0d1513',roughness:.83,metalness:.1}))
  floor.rotation.x = -Math.PI/2; floor.position.y = -1.95; floor.receiveShadow = true; scene.add(floor)
  const grid = new T.GridHelper(36, 72, '#2d4940', '#1b2c26')
  grid.position.y = -1.944
  const gridMaterial = grid.material as T.Material
  gridMaterial.transparent = true; gridMaterial.opacity = .34; scene.add(grid)
  const assembly = new T.Group(); assembly.name=item.title+' illustrative concept - NOT FOR MANUFACTURE'; scene.add(assembly)
  assembly.userData={notice:'Illustrative normalized geometry. Not CAD, dimensional fit, a production cover specification or OEM-approved design.',source:item.source || item.sourceLabel}
  const mkModel=equipment==='mk38'?buildMK38(assembly):undefined
  const aircraftModel=equipment==='f35a'?buildF35(assembly,aircraft!):undefined
  const model=mkModel??aircraftModel??buildV2500(assembly)
  const {cover,coverMaterials,cloth,textures}=model
  const parts=mkModel?.coverParts
  let settings:SceneSettings={mode:'transparent',color:'#677665',lift:0,rotate:false,hotspots:true}
  let disposed=false,frame=0,visible=true,dirty=true,last=performance.now()
  const targetCamera=new T.Vector3();let cameraTween=false
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;renderer.render(scene,camera)}
  const observer=new ResizeObserver(resize);observer.observe(host);resize()
  const visibility=()=>{visible=!document.hidden;if(visible){dirty=true;last=performance.now()}};document.addEventListener('visibilitychange',visibility)
  function animate(now:number){if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;if(!visible)return
    controls.autoRotate=settings.rotate
    if(cameraTween){camera.position.lerp(targetCamera,.1);if(camera.position.distanceTo(targetCamera)<.015)cameraTween=false}
    const desiredY=equipment==='mk38'?.5+settings.lift/100*.95:equipment==='f35a'?-.9+settings.lift/100*.5:.1
    const targetDelta=T.MathUtils.damp(controls.target.y,desiredY,7,dt)-controls.target.y
    controls.target.y+=targetDelta;camera.position.y+=targetDelta
    // Keep extra headroom as the cover rises, including narrow screens and preset views.
    const desiredFov=equipment==='mk38'?38+settings.lift/100*10:equipment==='f35a'?38+settings.lift/100*4:35
    const fovChanged=Math.abs(camera.fov-desiredFov)>.001
    if(fovChanged){camera.fov=T.MathUtils.damp(camera.fov,desiredFov,7,dt);camera.updateProjectionMatrix()}
    const cameraChanged=controls.update(dt)
    const moving=fovChanged||Math.abs(controls.target.y-desiredY)>.001||cameraTween||settings.rotate||Math.abs(cover.position.y-settings.lift/100*liftDistance)>.001||Math.abs(cloth.opacity-(settings.mode==='transparent'?.24:1))>.001
    if(!dirty&&!moving&&!cameraChanged)return
    dirty=false
    cover.visible=settings.mode!=='uncovered'
    if(parts){const choice=settings.coverSet||'both';parts.main.visible=choice==='both'||choice==='main';parts.eos.visible=choice==='both'||choice==='eos';parts.side.visible=!!settings.sideGun&&(choice==='both'||choice==='side');mkModel!.optionalSide.visible=!!settings.sideGun}
    aircraftModel?.selectCovers(settings.coverSet||'both')
    cover.position.y=T.MathUtils.damp(cover.position.y,settings.lift/100*liftDistance,7,dt)
    const targetOpacity=settings.mode==='transparent'?.24:1
    for(const mat of coverMaterials){mat.opacity=T.MathUtils.damp(mat.opacity,targetOpacity,10,dt);mat.depthWrite=settings.mode!=='transparent'}
    cloth.color.set(settings.color)
    renderer.render(scene,camera)
    onProject(item.points.map(p=>{const v=new T.Vector3(...p.point as [number,number,number]).project(camera);return{x:(v.x*.5+.5)*host.clientWidth,y:(-.5*v.y+.5)*host.clientHeight,visible:v.z<1&&Math.abs(v.x)<.95&&Math.abs(v.y)<.9}}))
  }
  frame=requestAnimationFrame(animate)
  return {
    set(next:SceneSettings){settings=next;aircraftModel?.selectCovers(next.coverSet||'both');dirty=true},
    view(view:CameraView){const positions={hero:[-7.4,4,8.9],front:[-10,.7,.01],side:[0,1.8,11.5],rear:[10,2,4]};targetCamera.set(...positions[view] as [number,number,number]);cameraTween=true;controls.target.set(0,equipment==='f35a'?-.9:.1,0)},
    zoom(factor:number){camera.position.sub(controls.target).multiplyScalar(factor).clampLength(controls.minDistance,controls.maxDistance).add(controls.target);cameraTween=false;dirty=true},
    capture(){renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')},
    async exportModel(){
      // Export an opaque, seated concept independent of the current inspection view.
      const clone=assembly.clone(true)
      clone.userData.coverSelection=settings.coverSet||'both'
      clone.userData.optionalSideDetail=!!settings.sideGun
      const clonedMaterials:T.Material[]=[]
      clone.traverse(o=>{const m=o as T.Mesh;if(m.material){const copy=(mat:T.Material)=>{const c=mat.clone();if(coverMaterials.some(coverMaterial=>coverMaterial===mat)){c.opacity=1;c.transparent=false;c.depthWrite=true;}clonedMaterials.push(c);return c};m.material=Array.isArray(m.material)?m.material.map(copy):copy(m.material)}})
      const clonedCover=clone.getObjectByName(cover.name)!;clonedCover.visible=true;clonedCover.position.y=0
      try{return await new GLTFExporter().parseAsync(clone,{binary:true}) as ArrayBuffer}finally{clonedMaterials.forEach(m=>m.dispose())}
    },
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();scene.traverse(o=>{const m=o as T.Mesh;m.geometry?.dispose();if(m.material){for(const mat of Array.isArray(m.material)?m.material:[m.material])mat.dispose()}});textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove()},
  }
}

function buildV2500(assembly:T.Group){
  const engine = new T.Group(); engine.name='Engine - approximate V2500 architecture'; assembly.add(engine)
  const steel = new T.MeshStandardMaterial({color:'#9da8aa',metalness:.87,roughness:.3})
  const dark = new T.MeshStandardMaterial({color:'#242c2c',metalness:.75,roughness:.38})
  const titanium = new T.MeshStandardMaterial({color:'#757b7b',metalness:.9,roughness:.4})
  const bronze = new T.MeshStandardMaterial({color:'#958773',metalness:.82,roughness:.4})
  const rubber = new T.MeshStandardMaterial({color:'#111818',roughness:.85})
  function mesh(geo:T.BufferGeometry, mat:T.Material, parent:T.Object3D=engine) { const m=new T.Mesh(geo,mat); m.castShadow=true; m.receiveShadow=true; parent.add(m);return m }
  function cyl(x:number, length:number, r1:number, r2:number, mat:T.Material, parent:T.Object3D=engine, open=false) { const m=mesh(new T.CylinderGeometry(r2,r1,length,80,1,open),mat,parent); m.rotation.z=-Math.PI/2;m.position.x=x;return m }
  function ring(x:number,r:number,t:number,mat:T.Material,parent:T.Object3D=engine){const m=mesh(new T.TorusGeometry(r,t,12,96),mat,parent);m.rotation.y=Math.PI/2;m.position.x=x;return m}
  function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:T.Material,parent:T.Object3D=engine){const m=mesh(new T.BoxGeometry(w,h,d),mat,parent);m.position.set(x,y,z);return m}
  function tube(points:number[][], radius:number, mat:T.Material, parent:T.Object3D=engine) { return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number]))),48,radius,8,false),mat,parent) }
  // Approximate exposed turbofan architecture; dimensions are intentionally normalized.
  cyl(-1.94,1.15,1.22,1.16,titanium,engine,true)
  ring(-2.52,1.215,.085,steel); ring(-1.39,1.16,.055,dark)
  cyl(-1.12,.55,1.08,.86,steel)
  cyl(-.15,1.42,.77,.65,titanium)
  cyl(.99,.82,.65,.55,bronze)
  cyl(1.88,.96,.55,.38,titanium,engine,true)
  ring(2.37,.38,.045,steel)
  cyl(2.0,.72,.23,.07,dark)
  for(let i=0;i<15;i++) ring(-.96+i*.175,.79-i*.012,.024,i%3===0?bronze:steel)
  for(let i=0;i<7;i++) ring(.7+i*.17,.66-i*.025,.028,dark)
  const fan=new T.Group();engine.add(fan)
  for(let i=0;i<36;i++) {
    const a=i/36*Math.PI*2
    const vertices:number[]=[]
    const indices:number[]=[]
    for(let j=0;j<=10;j++){
      const r=.25+j/10*.89; const twist=a+.33*j/10
      for(const side of [-1,1]){
        const t=twist+side*(.085-.026*j/10)
        vertices.push(-2.33+.18*j/10+side*.05,Math.cos(t)*r,Math.sin(t)*r)
      }
      if(j<10){const n=j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals()
    const blade=steel.clone();blade.side=T.DoubleSide;mesh(geo,blade,fan)
  }
  const spinner=mesh(new T.ConeGeometry(.3,.57,64),steel)
  spinner.rotation.z=Math.PI/2;spinner.position.x=-2.31
  // Bolted flanges and external service systems provide useful visual landmarks.
  for(const x of [-1.37,-.78,.51,1.45])for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2, r=x< -1?1.17:x<0?.79:x<1?.66:.56
    const bolt=mesh(new T.CylinderGeometry(.027,.027,.065,6),steel)
    bolt.rotation.z=Math.PI/2;bolt.position.set(x,Math.cos(a)*r,Math.sin(a)*r)
  }
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2
    tube([[-1.2,Math.cos(a)*.94,Math.sin(a)*.94],[-.7,Math.cos(a)*.92,Math.sin(a)*.92],[.4,Math.cos(a)*.76,Math.sin(a)*.76],[1.2,Math.cos(a)*.63,Math.sin(a)*.63]],.018,i%2?bronze:steel)
  }
  box(-.45,-.76,.49,.86,.25,.34,dark)
  box(.13,.55,.61,.5,.32,.24,titanium)
  box(-.77,.42,.82,.38,.27,.19,dark)
  tube([[-1.3,.3,.98],[-.9,.1,1.03],[.15,.1,.9],[.65,.45,.71]],.042,dark)
  tube([[-1.1,-.35,.9],[-.7,-.55,.94],[.5,-.48,.75],[1.6,-.22,.54]],.022,bronze)
  // Illustrative support cradle.
  const stand=new T.Group();stand.name='Support stand - illustrative';assembly.add(stand)
  for(const z of [-.87,.87]) {
    box(0,-1.68,z,4.6,.16,.12,dark,stand)
    for(const x of [-1.5,1.5]) {box(x,-1.24,z,.13,.8,.13,steel,stand);const wheel=cyl(x,.13,.14,.14,rubber,stand);wheel.rotation.set(Math.PI/2,0,0);wheel.position.set(x,-1.8,z)}
  }
  for(const x of [-1.5,1.5])box(x,-1.64,0,.14,.13,1.8,steel,stand)
  // Fabric envelope, generated as a softly wrinkled surface around the engine.
  const cover=new T.Group();cover.name='Cover concept - unverified seams and closures';assembly.add(cover)
  const texCanvas=document.createElement('canvas');texCanvas.width=128;texCanvas.height=128
  const tx=texCanvas.getContext('2d')!
  tx.fillStyle='#888';tx.fillRect(0,0,128,128)
  for(let i=0;i<128;i+=4){tx.fillStyle=i%8?'#999':'#777';tx.fillRect(i,0,1,128);tx.fillRect(0,i,128,1)}
  const weave=new T.CanvasTexture(texCanvas);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,7)
  const cloth=new T.MeshStandardMaterial({color:'#677665',roughness:.92,metalness:0,bumpMap:weave,bumpScale:.018,side:T.DoubleSide,transparent:true})
  const trim=new T.MeshStandardMaterial({color:'#25352d',roughness:.8,side:T.DoubleSide,transparent:true})
  const seamMat=new T.MeshStandardMaterial({color:'#a3b09a',roughness:.95,transparent:true})
  function radius(x:number){if(x< -1.25)return 1.33; if(x<-.65)return 1.33-(x+1.25)*.3; if(x<1.2)return 1.15-(x+.65)*.13;return .91-(x-1.2)*.11}
  const vs:number[]=[],uv:number[]=[],ix:number[]=[]
  const N=100,M=96
  for(let i=0;i<=N;i++)for(let j=0;j<=M;j++){
    const x=-2.65+i/N*5.2,a=j/M*Math.PI*2
    const r=radius(x)+.017*Math.sin(a*19+x*3)+.011*Math.sin(a*31-x*7)
    vs.push(x,Math.cos(a)*r,Math.sin(a)*r);uv.push(i/N,j/M)
    if(i<N&&j<M){const n=i*(M+1)+j;ix.push(n,n+1,n+M+1,n+1,n+M+2,n+M+1)}
  }
  const shell=new T.BufferGeometry();shell.setAttribute('position',new T.Float32BufferAttribute(vs,3));shell.setAttribute('uv',new T.Float32BufferAttribute(uv,2));shell.setIndex(ix);shell.computeVertexNormals();mesh(shell,cloth,cover)
  for(const x of [-2.65,2.55]) {const disc=mesh(new T.CircleGeometry(radius(x),96),cloth,cover);disc.rotation.y=Math.PI/2;disc.position.x=x;ring(x,radius(x),.025,trim,cover)}
  for(const x of [-2.35,-1.23,.48,2.27])ring(x,radius(x)+.028,.035,trim,cover)
  for(const a of [.25,1.3,2.7,4.3,5.2]){
    const pts:number[][]=[]
    for(let i=0;i<=40;i++){const x=-2.65+i/40*5.2,r=radius(x)+.03;pts.push([x,Math.cos(a)*r,Math.sin(a)*r])}
    tube(pts,.007,seamMat,cover)
  }
  // Concept service panel on the visible side.
  box(-.2,.18,1.16,.72,.48,.035,trim,cover)
  box(-.2,.18,1.186,.65,.41,.018,cloth,cover)
  for(const x of [-2.35,-1.23,.48,2.27])box(x,.1,radius(x)+.045,.11,.22,.08,dark,cover)
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=256
  const lc=labelCanvas.getContext('2d')!;lc.fillStyle='#192a22';lc.fillRect(0,0,512,256)
  lc.fillStyle='#c4d1c4';lc.font='bold 65px sans-serif';lc.fillText('Envelop',30,115)
  lc.font='23px monospace';lc.fillText('CONCEPT / V2500',39,165)
  const labelTexture=new T.CanvasTexture(labelCanvas)
  const labelMat=new T.MeshStandardMaterial({map:labelTexture,roughness:.9,transparent:true})
  const label=mesh(new T.PlaneGeometry(.79,.395),labelMat,cover);label.position.set(-1.78,.48,1.269);label.rotation.x=-.34
  const coverMaterials=[cloth,trim,seamMat,labelMat]
  return {cover,coverMaterials,cloth,textures:[weave,labelTexture]}
}

import * as T from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export const F35_CREDIT={title:'F-35A Lightning II',author:'shangus930',url:'https://sketchfab.com/3d-models/f-35a-lightning-ii-a06d6113cfb44a0aa7b8f17106aca9c4',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',changes:'Web optimization, static exterior presentation and illustrative cover overlays by ASG. Source identified by uploader as the DCS World abandoned F-35 community mod.'}

export async function loadF35(){
 const draco=new DRACOLoader();draco.setDecoderPath('/models/draco/');draco.setWorkerLimit(2)
 try {
  const gltf=await new GLTFLoader().setDRACOLoader(draco).loadAsync('/models/f35a/f35a.glb')
  return gltf.scene
 } finally {draco.dispose()}
}

export function disposeAircraft(aircraft:T.Object3D){
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>()
 aircraft.traverse(o=>{if(!(o instanceof T.Mesh))return;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value)}})
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())
}

export function buildF35(assembly:T.Group,aircraft:T.Group){
 aircraft.name='F-35A Lightning II by shangus930';aircraft.userData.attribution=F35_CREDIT;assembly.add(aircraft);assembly.userData.attribution=F35_CREDIT
 aircraft.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}})
 aircraft.updateMatrixWorld(true)
 const cover=new T.Group();cover.name='Cover concept - unverified seams and closures';assembly.add(cover)
 const pixels=new Uint8Array(32*32*4)
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const i=(y*32+x)*4,v=(x%4===0||y%4===0)?165:110;pixels.set([v,v,v,255],i)}
 const weave=new T.DataTexture(pixels,32,32);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(5,5);weave.needsUpdate=true
 const cloth=new T.MeshStandardMaterial({color:'#a5adae',roughness:.95,bumpMap:weave,bumpScale:.008,side:T.DoubleSide,transparent:true})
 const trim=new T.MeshStandardMaterial({color:'#34453e',roughness:.9,side:T.DoubleSide,transparent:true})
 const tag=new T.MeshStandardMaterial({color:'#a54537',roughness:.9,side:T.DoubleSide,transparent:true})
 const mesh=(g:T.BufferGeometry,m:T.Material,parent:T.Object3D)=>{const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function panel(points:number[][],material:T.Material,parent:T.Object3D){const g=new T.BufferGeometry(),indices=[];for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,material,parent)}
 function line(points:number[][],parent:T.Object3D){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p as [number,number,number]))),32,.009,6,false),trim,parent)}
 const canopy=new T.Group();canopy.name='Envelop canopy cover';cover.add(canopy)
 // Match the supplied exterior canopy surface, with a small visual fabric offset.
 aircraft.traverse(o=>{if(!(o instanceof T.Mesh))return;const materials=Array.isArray(o.material)?o.material:[o.material];if(!materials.some(m=>m.name==='mat_15'))return
  const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);g.computeBoundingBox();const center=g.boundingBox!.getCenter(new T.Vector3()),p=g.getAttribute('position')
  for(let i=0;i<p.count;i++)p.setXYZ(i,center.x+(p.getX(i)-center.x)*1.018,center.y+(p.getY(i)-center.y)*1.025+.009,center.z+(p.getZ(i)-center.z)*1.065)
  g.computeVertexNormals();mesh(g,cloth,canopy)
 })
 if(!canopy.children.length)throw new Error('Aircraft canopy surface is missing')
 const intakes=new T.Group();intakes.name='Envelop intake covers';cover.add(intakes)
 for(const side of [-1,1]){
  const points=[[-1.44,-1.45,side*.40],[-1.45,-1.46,side*.59],[-1.22,-1.78,side*.60],[-1.27,-1.78,side*.31]]
  panel(points,cloth,intakes);line([...points,points[0]],intakes)
  panel([[-1.28,-1.7,side*.52],[-1.28,-1.7,side*.58],[-1.28,-1.9,side*.58],[-1.28,-1.88,side*.52]],tag,intakes)
 }
 const exhaust=new T.Group();exhaust.name='Envelop exhaust cover';cover.add(exhaust)
 const cap=mesh(new T.CircleGeometry(.258,48),cloth,exhaust);cap.rotation.y=Math.PI/2;cap.position.set(2.637,-1.502,0)
 const rim=mesh(new T.TorusGeometry(.258,.011,8,48),trim,exhaust);rim.rotation.y=Math.PI/2;rim.position.set(2.642,-1.502,0)
 panel([[2.65,-1.55,-.025],[2.65,-1.55,.025],[2.65,-1.88,.025],[2.65,-1.86,-.025]],tag,exhaust)
 const aircraftCoverParts={canopy,intakes,exhaust}
 function selectCovers(choice='both'){for(const [key,part] of Object.entries(aircraftCoverParts))part.visible=choice==='both'||choice===key}
 const textures:T.Texture[]=[weave]
 aircraft.traverse(o=>{if(o instanceof T.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])for(const value of Object.values(m))if(value instanceof T.Texture&&!textures.includes(value))textures.push(value)})
 return {cover,cloth,coverMaterials:[cloth,trim,tag],textures,aircraftCoverParts,selectCovers}
}

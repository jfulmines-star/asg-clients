export type EquipmentId = 'v2500' | 'mk38' | 'f35a'
export const EQUIPMENT = {
 v2500: { title:'V2500', name:'V2500 Engine', category:'ENGINE COVER EXPLORER', uncovered:'Engine', source:'https://www.rtx.com/en/prattwhitney/products/commercial-engines/v2500', sourceLabel:'Pratt & Whitney V2500', color:'#677665', points:[
  {title:'Intake protection',label:'01',point:[-2.55,.8,.95],detail:'Explore front-panel coverage and the closure perimeter. Confirm intake dimensions and approved contact surfaces with engineering.'},
  {title:'Service access',label:'02',point:[-.3,.45,1.12],detail:'Discuss a service opening without removing the full cover. Location, overlap and fastening are illustrative.'},
  {title:'Aft closure',label:'03',point:[2.25,.45,.7],detail:'Review rear coverage and a possible cinch closure. Confirm the actual configuration and clearance envelope.'},
  {title:'Stand interface',label:'04',point:[.25,-1,1.02],detail:'Identify stand contact points and cover clearance. The stand shown is a concept, not a specified transport fixture.'},
 ]},
 mk38: {title:'MK 38',name:'MK 38 Mount',category:'ENVELOP COVER EXPLORER',uncovered:'Mount',source:'',sourceLabel:'Customer-supplied photo and video',color:'#a5adae',points:[
  {title:'EOS hood',label:'05',point:[-.65,2.1,-1.35],detail:'Separate Envelop hood for the electro-optical sensor housing, based on the supplied photos. Shape, seams and retaining straps are illustrative.'},
  {title:'Sleeve coverage',label:'01',point:[-2.35,.9,.22],detail:'Preview the long fitted sleeve visible in the supplied references. Its shape and fabric drape are illustrative.'},
  {title:'Side opening',label:'02',point:[-.35,.52,.91],detail:'Review the cover opening around the visible side protrusion. Final opening size and edge treatment need confirmation.'},
  {title:'Rear drape',label:'03',point:[1.5,.42,.64],detail:'Explore rear-panel coverage and fabric allowance from the reference silhouette. Seams and closure placement are conceptual.'},
  {title:'Lower hem',label:'04',point:[.45,-.05,.8],detail:'Review the lower cover edge and visible retaining straps. This preview does not establish fit or approved attachment points.'},
 ]},
 f35a: {title:'F-35A',name:'F-35A Lightning II',category:'AIRCRAFT COVER EXPLORER',uncovered:'Aircraft',source:'https://www.f35.com/en-us/products/f-35.html',sourceLabel:'Lockheed Martin F-35 exterior reference',color:'#a5adae',points:[
  {title:'Canopy cover',label:'01',point:[-2.05,-1.0,.2],detail:'Preview the canopy cover and its visible perimeter. This is an illustrative exterior treatment.'},
  {title:'Intake covers',label:'02',point:[-1.4,-1.56,.57],detail:'View the paired intake covers together or select them on their own. Edges and fabric appearance are conceptual.'},
  {title:'Exhaust cover',label:'03',point:[2.65,-1.50,.2],detail:'Explore the aft cover from the rear view. The cap and fabric tag are visual placeholders.'},
 ]},
} as const

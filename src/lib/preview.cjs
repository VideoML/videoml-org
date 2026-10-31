/** Trusted shipped effect configuration, keyed by catalog ID. */
const previews={
 'component/particle-text-dissolve':{id:'videoml/particle-text-dissolve',defaults:{text:'VideoML',density:'med',accent:'green',direction:'in'},controls:['text','density','accent','direction'],asset:'font'},
 'component/particle-image-reveal':{id:'videoml/particle-image-reveal',defaults:{density:'med',accent:'green',direction:'ltr'},controls:['density','accent','direction'],asset:'image'},
 'component/agent-cursor':{id:'videoml/agent-cursor',kind:'c001',frames:144,defaults:{agent_name:'Agent',steps:'Reading the page,Opening Settings,Turning on backups,Done',targets:'25,47;76,30',accent:'#0a84ff'},controls:['agent_name','steps','targets','accent']},
 'component/animated-bar-chart':{id:'videoml/animated-bar-chart',kind:'c001',defaults:{title:'Animated Bar Chart',description:'A compact data card with deterministic bar growth and value callouts.',value:'+42%',accent:'#111827'},controls:['title','description','value','accent']},
 'component/arc-motion-path':{id:'videoml/arc-motion-path',kind:'c001',defaults:{title:'Arc Motion Path',firstLabel:'Plan',secondLabel:'Render',accent:'#18181b'},controls:['title','firstLabel','secondLabel','accent']},
 'component/ascii-render-pass':{id:'videoml/ascii-render-pass',kind:'c001',asset:'scene',width:320,height:240,defaults:{sourceSceneId:'source',sourceFrame:75,charset:' .:-=+*#%@',grid:'med',resolve_at:1.4,accent:'green',exit:'none'},controls:['charset','grid','resolve_at','accent','exit']},
 'component/ascii-trail-reveal':{id:'videoml/ascii-trail-reveal',kind:'c001',defaults:{label:'The reveal',accent:'green',trail_width:'narrow'},controls:['label','accent','trail_width']},
 'component/echo-smear':{id:'videoml/echo-smear',defaults:{length:100,threshold:40,color:'#71f5a7'},controls:['length','threshold','color']},
};
const shaders=require('./shader-preview.cjs');
for(const name of shaders.names)previews[`shader/${name}`]={id:name,kind:'shader',asset:'font',defaults:structuredClone(shaders.defaults),controls:['accent','dark','bright','backgroundColor','ease']};
module.exports={previews};

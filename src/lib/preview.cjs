/** Trusted shipped effect configuration, keyed by catalog ID. */
const previews={
 'component/particle-text-dissolve':{id:'videoml/particle-text-dissolve',defaults:{text:'VideoML',density:'med',accent:'green',direction:'in'},controls:['text','density','accent','direction'],asset:'font'},
 'component/particle-image-reveal':{id:'videoml/particle-image-reveal',defaults:{density:'med',accent:'green',direction:'ltr'},controls:['density','accent','direction'],asset:'image'},
 'component/echo-smear':{id:'videoml/echo-smear',defaults:{length:100,threshold:40,color:'#71f5a7'},controls:['length','threshold','color']},
};
const shaders=require('./shader-preview.cjs');
for(const name of shaders.names)previews[`shader/${name}`]={id:name,kind:'shader',asset:'font',defaults:structuredClone(shaders.defaults),controls:['accent','dark','bright','backgroundColor','ease']};
module.exports={previews};

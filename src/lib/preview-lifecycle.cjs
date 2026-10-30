/** Fail closed until a new iframe is explicitly started. */
function createPreviewLifecycle(){let epoch=0,active=true;return {begin(){active=true;return ++epoch},fail(){active=false;epoch++},isCurrent(token){return active&&token===epoch},isActive(){return active}};}
module.exports={createPreviewLifecycle};

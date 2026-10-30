/** Keep one seek in flight and retain only the latest requested frame. */
function createSeekPump(send,fail,timeoutMs=10000) {
 let waiting=null,desired=null,timer=null,disposed=false;
 function flush(){if(disposed||waiting!==null||desired===null)return;const frame=desired;desired=null;waiting=send(frame);timer=setTimeout(()=>{waiting=null;desired=null;fail(new Error('Preview seek timed out'));},timeoutMs);}
 return {seek(frame){if(disposed)return;desired=frame;flush();},ack(id){if(id!==waiting)return false;clearTimeout(timer);timer=null;waiting=null;flush();return true;},dispose(){disposed=true;clearTimeout(timer);waiting=null;desired=null;}};
}
module.exports={createSeekPump};

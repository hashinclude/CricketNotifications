function httpGet(origUrl)
{
    splitUrl = origUrl.split("/");
    theUrl = "http://www.espncricinfo.com/netstorage/" + splitUrl[splitUrl.length - 1];
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return  xmlHttp.responseText;
}
function audioNotification(){
    var yourSound = new Audio('POP.WAV');
    yourSound.play();
}
function notify(title, msg, url) {
    var havePermission = window.webkitNotifications.checkPermission();
    if (havePermission == 0) {
        // 0 is PERMISSION_ALLOWED
        var notification = window.webkitNotifications.createNotification(
            'http://web.iiit.ac.in/~aishvarya.singh/cricket.jpg',
            title,
            msg
        );
        notification.onclick = function(){
            window.open(url, "_blank");
            this.cancel();
        };
        notification.show();
        setTimeout(function(){
            notification.cancel();
        }, 10000);
    } else {
        window.webkitNotifications.requestPermission();
    }
} 
function notificationPopups(url){
    var txt = httpGet(url);
    var rel = txt.toString();
    var re = /<td width="30" align="right"><p class="commsText">[.\n\s\S]*?<tr>/g;
    results=[]
    temp=[]
    count=0;

    //re2 = new RegExp(/<p class="statusText">([.\n\s\S]*?)<\/p>/g);
    //re2.exec(txt)[1];

    //txt.match(re2);
    //re2 = /<p class="statusText">[.\n\s\S]*?<\/p>/g;
    //txt.match(re2)[0];


    var regex = /(<([^>]+)>)/ig
    retitle = new RegExp(/<meta property="og:title" content="([.\n\s\S]*?)"\/>/g);
    titlematch = retitle.exec(rel)[1];

    while ((temp = re.exec(rel)) !== null)
        {
            // temp[0];
            if (temp[0].indexOf("commsImportant") != -1) {
                results.push(temp[0]);
            }
            count+=1;
            // rel=temp[1];
            // console.log("match");
            // console.log(re.lastIndex);
            if (count == 10)
                break;
        }
        var i = 0;
        while (i<results.length && i<1) {
            cur = results[i];
            // console.log(cur);
            results[i];
            // re3 = new RegExp(/<p class="commsText">([.\n\s\S]*?)<\/p><\/td>/g);
            // over = re3.exec(cur)[1];
            re4 = new RegExp(/<p class="commsText">([.\n\s\S]*?)<\/p>([.\n\s\S]*?)<p class="commsText">([.\n\s\S]*?)<span class="commsImportant">([.\n\s\S]*?)<\/span>[^a-z]*([\s\S]*)<\/p>/gm);
            arr = re4.exec(cur);
            over = arr[1];
            // console.log(over);
            bowler = arr[3];
            // console.log(bowler);
            det = arr[4];
            // console.log(det);
            commentary = arr[5];
            commentary = commentary.replace(regex, "");
            if (commentary!=null && commentary != undefined){ // check for commentary = (\s\S)
                //console.log(localStorage.getItem("lastNotification-"+url));
                //console.log(over);
                if(localStorage.getItem("lastNotification-" + url) != over){
                    notify(titlematch, "Over:"+over+", "+det+" "+bowler+" "+commentary, url);
                    audioNotification();
                    localStorage.removeItem("lastNotification-" + url);
                    localStorage.setItem("lastNotification-" + url, over);
                }
                //console.log("Over:"+over+"  "+det+" "+bowler+" "+commentary);
            }
            i+=1;
        }
}

//console.log(results[1]);
function showPopups(){
    //console.log("showPopups Running");
    activeMatches = JSON.parse(localStorage.getItem("activeMatches"));
    //console.log(activeMatches);
    if(activeMatches != null){
        for(i=0;i<activeMatches.length;i++){
            notificationPopups(activeMatches[i]);
        }
    }
}
popupFunc = showPopups;
window.setInterval(popupFunc, 5000);

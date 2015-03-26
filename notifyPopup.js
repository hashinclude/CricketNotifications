function audioNotification(){
    var yourSound = new Audio('POP.WAV');
    yourSound.play();
}
function notify(title, msg, url) {
    var notif = chrome.notifications.create(
            url,
            {   
                'type': 'basic',
                'iconUrl' : 'http://4.bp.blogspot.com/-7MZ6c0_tVpI/TomENvjGD4I/AAAAAAAAAGo/iZjcX2pg9fg/s45/test-cricket-ball.jpg',
                'title' : title,
                'message' : msg
            },
            function(notifid){
                // console.log("Last error:", chrome.runtime.lastError); 
            }
    );
    chrome.notifications.onClicked.addListener(function(notifid) {
        window.open(url.replace("json", "html"), "_blank");
        chrome.notifications.clear(notifid, function(cleared){});
    });
    setTimeout(function(){
        chrome.notifications.clear(url, function(cleared){});
    }, 10000);
} 
running = {}
function notificationPopups(url){
    if (url in running) {
        return;
    }
    // console.log(url);
    running[url] = 1;
    $.get(url, function(txt) {
        // console.log("Retrieved Page");
        count=0;
        titlematch = txt.match.team1_name + ' vs. ' + txt.match.team2_name + ', ' + txt.match.town_name;
        var regex = /(<([^>]+)>)/ig;
        // console.log(txt.comms);
        results = txt.comms[0].ball;
        madeNoise = 0;
        for (i = 0; i < results.length; i++) {
            cur = results[i];
            over = cur.overs_actual;
            // console.log(over);
            players = cur.players;
            // console.log(bowler);
            det = cur.event;
            console.log(det);
            commentary = cur.text;
            commentary = commentary.replace(regex, "");
            if (commentary!=null && commentary != undefined  && (det[0] >= 4 || det.match(/[A-Z]/))) { // check for commentary = (\s\S)
                //console.log(localStorage.getItem("lastNotification-"+url));
                //console.log(over);
                if(localStorage.getItem("lastNotification-" + url) < over || (localStorage.getItem("lastNotification-" + url) == over && localStorage.getItem("lastComment-" + url) != commentary)) {
                    notify(titlematch, "Over : "+over+", "+players+" - " + det +" "+commentary, url);
                    if (madeNoise == 0) {
                        audioNotification();
                        madeNoise = 1;
                    }
                    localStorage.removeItem("lastNotification-" + url);
                    localStorage.setItem("lastNotification-" + url, over);
                    localStorage.setItem("lastComment-" + url, commentary);
                    break;
                }
                //console.log("Over:"+over+"  "+det+" "+bowler+" "+commentary);
            }
            delete running[url];
        }
    });
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

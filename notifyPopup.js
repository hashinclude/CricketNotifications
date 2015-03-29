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
        team1_id = txt.team[0].team_id;
        team2_id = txt.team[1].team_id;
        if (team1_id != txt.match.team1_id)
            team2_id = [team1_id, team1_id = team2_id][0];
        innings = txt.innings;
        team1_score = team2_score = team1_wickets = team2_wickets = -1;
        current_team = team1_id;
        for (i = 0; i < innings.length; i++) {
            if (innings[i].batting_team_id == team1_id) {
                team1_score = innings[i].runs;
                team1_wickets = innings[i].wickets;
                current_team = team1_id;
            } else {
                team2_score = innings[i].runs;
                team2_wickets = innings[i].wickets;
                current_team = team2_id;
            }
        }
        team1_score_string = "";
        team2_score_string = "";
        if (team1_score != -1) {
            team1_score_string = team1_score + '/' + team1_wickets;
            if (current_team == team1_id) {
                team1_score_string += " *";
            }
        }
        if (team2_score != -1) {
            team2_score_string = team2_score + '/' + team2_wickets;
            if (current_team == team2_id) {
                team2_score_string += " *";
            }
        }
        titlematch = txt.match.team1_name + ' ' + team1_score_string + ' vs. ' + txt.match.team2_name + ' ' + team2_score_string;
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
                if(localStorage.getItem("lastNotification-" + url) < over || (localStorage.getItem("lastNotification-" + url) == over && localStorage.getItem("lastComment-" + url) != commentary) || (over - localStorage.getItem('lastNotification-' + url) > 1)) {
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

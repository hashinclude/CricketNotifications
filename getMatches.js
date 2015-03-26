function fixurl (origUrl) {
    splitUrl = origUrl.split("/");
    theUrl = "http://www.espncricinfo.com/ci/engine/match/" + splitUrl[splitUrl.length - 1].split("?")[0];
    theUrl = theUrl.replace("html", "json");
    return theUrl;
}
function setStatusAndTitle(origUrl, ele){
    // console.log("trying to retrieve " + origUrl);
    $.get(origUrl, function(response) {
        // console.log("retrieved " + origUrl);
        ele.innerHTML = response.live.status;
    });
};
function changeDB(cb){
    activeMatches = JSON.parse(localStorage.getItem("activeMatches"));
    if(cb.checked){
        if(!(cb.id in activeMatches)){
            activeMatches.push(cb.id);
            localStorage.removeItem("activeMatches");
            localStorage.setItem("activeMatches", JSON.stringify(activeMatches));
            //console.log(localStorage.getItem("activeMatches"));
        }
        return;
    }
    index = activeMatches.indexOf(cb.id); 
    if(index > -1){
        activeMatches.splice(index, 1);
        localStorage.removeItem("activeMatches");
        localStorage.setItem("activeMatches", JSON.stringify(activeMatches));
        //console.log(localStorage.getItem("activeMatches"));
    }
}
function getMatches(){
    if(localStorage.getItem("activeMatches") == null)
        localStorage.setItem("activeMatches", JSON.stringify([]));
    //console.log("Refreshing");
    chrome.tabs.getAllInWindow(
            function(tab) {
                xmlhttp=new XMLHttpRequest();
                $.get("http://static.cricinfo.com/rss/livescores.xml", false, function(response) {
                    matchListXML = response;
                    matchList = matchListXML.getElementsByTagName("item");
                    concated="";
                    activeMatches = JSON.parse(localStorage.getItem("activeMatches"));
                    if(activeMatches == null)
                        activeMatches = [];
                    newActiveMatches = [];
                    matchURLs = [];
                    for(i=0;i<matchList.length;i++)
                        matchURLs.push(fixurl(matchList[i].getElementsByTagName("link")[0].textContent));
                    // console.log(matchURLs);
                    // console.log(activeMatches);
                    for(i=0;i<activeMatches.length;i++){
                        if(matchURLs.indexOf(activeMatches[i]) != -1)
                            newActiveMatches.push(activeMatches[i]);                
                    }
                    localStorage.removeItem("activeMatches");
                    localStorage.setItem("activeMatches", JSON.stringify(newActiveMatches));
                    //console.log(newActiveMatches);
                    for(i=0;i<matchList.length;i++){
                        link = fixurl(matchList[i].getElementsByTagName("link")[0].textContent);
                        title = matchList[i].getElementsByTagName("title")[0].textContent;
                        concated += "<h3 value=\"" + i + "\" " + "url=\"" + link + "\"><input class=\"checkbox\" type=\"checkbox\" id=\"" + link + "\"";
                        if(newActiveMatches.indexOf(link) != -1){
                            concated += " checked";
                        }
                        concated += "><label for=\"" + link  + "\">" +  title + "</label></h3><div id=\"status-" + i +  "\" stillLoading=\"1\">Loading...<br/><br/></div>";
                        //concated +="<a href=\"" + matchList[i].children[1].textContent + "\">" + "blastatus"  + "</a>";
                    }
                    document.getElementById('accordion').innerHTML= concated;
                    $('#accordion input[type="checkbox"]').click(function(e) {
                        e.stopPropagation();
                    });
                    $(function() {
                        $( "#accordion" ).accordion({
                            collapsible: true,
                            active : false,
                            heightStyle: "content",
                            activate: function (e, ui) {
                                val = $(ui.newHeader[0]).attr("value");
                                url = $(ui.newHeader[0]).attr("url");
                                currentStatus = document.getElementById("status-" + val);
                                if(currentStatus != null){
                                    //console.log(currentStatus.innerHTML);
                                    if($(currentStatus).attr("stillLoading") == "1"){
                                        setStatusAndTitle(url, currentStatus);
                                        $(currentStatus).attr("stillLoading",  "0");
                                    }
                                }
                            }
                        });
                    });
                    $(".checkbox").change(function() {
                        changeDB(this);
                    })
                });
            }
    );
}

getMatches();

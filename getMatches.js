function getStatusAndTitle(origUrl){
    var xmlHttp = null;
    splitUrl = origUrl.split("/");
    theUrl = "http://www.espncricinfo.com/netstorage/" + splitUrl[splitUrl.length - 1];
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    txt =  xmlHttp.responseText;
    var rel = txt.toString();
    //var re = /<td width="30" align="right"><p class="commsText">[.\n\s\S]*?<tr>/g;
    re2 = new RegExp(/<p class="statusText">([.\n\s\S]*?)<\/p>/g);
    ret = re2.exec(rel);
    cstat = "";
    if(ret == null)
        cstat =  "No Status";
    else if(ret.length == 1)
        cstat = "No Status";
    else
        cstat = ret[1];
    //console.log(cstat);
    re2 = new RegExp(/<p class="teamText">([.\n\s\S]*?)<\/p>/g);
    ret = re2.exec(rel);
    nmsg = "";
    if(ret != null)
        nmsg = '';
    else
        nmsg = ret.join(" ");
    //console.log([cstat, nmsg]);
    return [cstat, nmsg];
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
        function(tab){
        xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET", "http://static.cricinfo.com/rss/livescores.xml", false);
        xmlhttp.send();
        matchListXML = xmlhttp.responseXML;
        matchList = matchListXML.getElementsByTagName("item");
        concated="";
        activeMatches = JSON.parse(localStorage.getItem("activeMatches"));
        if(activeMatches == null)
            activeMatches = [];
        newActiveMatches = [];
        matchURLs = [];
        for(i=0;i<matchList.length;i++)
            matchURLs.push(matchList[i].children[1].textContent);
        //console.log(matchURLs);
        //console.log(activeMatches);
        for(i=0;i<activeMatches.length;i++){
            if(matchURLs.indexOf(activeMatches[i]) != -1)
                newActiveMatches.push(activeMatches[i]);                
        }
        localStorage.removeItem("activeMatches");
        localStorage.setItem("activeMatches", JSON.stringify(newActiveMatches));
        //console.log(newActiveMatches);
        for(i=0;i<matchList.length;i++){
            concated += "<h3 value=\"" + i + "\" " + "url=\"" + matchList[i].children[1].textContent + "\"><input class=\"checkbox\" type=\"checkbox\" id=\"" + matchList[i].children[1].textContent + "\"";
            if(newActiveMatches.indexOf(matchList[i].children[1].textContent) != -1){
                concated += " checked";
            }
            concated += "><label for=\"" + matchList[i].children[1].textContent  + "\">" +  matchList[i].children[0].textContent + "</label></h3><div id=\"status-" + i +  "\" stillLoading=\"1\">Loading...<br/><br/></div>";
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
                            rets = getStatusAndTitle(url);
                            currentStatus.innerHTML = rets[0];
                            document.getElementById(url).innerHTML = rets[1];
                            $(currentStatus).attr("stillLoading",  "0");
                        }
                    }
                }
            });
        });
        $(".checkbox").change(function() {
            changeDB(this);
        })
    }
    );
}

getMatches();

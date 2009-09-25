
var _sinceId; // The last tweet from twitter we have showed.
function loadTweets(){
	// Load the tweets that contain the word "widget OR widgets"
	// using the twitter API over JSONP, the function to be called with
	// the result is "renderTweets".
	var url = "http://search.twitter.com/search.json?q="+
			encodeURIComponent("#ota09")+
			"&callback=renderTweets&rpp=1000";
	if (_sinceId){
		url += "&since_id="+encodeURIComponent(_sinceId);
	}
	_jsonp(url);
}

function renderTweets(tweets){
	var interval = 10, // In minutes.
		date, group, minutes,
		curGroup = [];
		groups = [], // The tweets grouped in the interval.
		lastInterval = 0;
	for (var i=0, l=tweets.results.length, t; i<l; i++){
		// Fortunately tweets are sorted by date.
		t = tweets.results[i];
		date = new Date(t.created_at);
		minutes = date.getMinutes();
		group = minutes - minutes % interval;
		if (group==lastInterval){
			curGroup.push(t);
		} else {
			if (curGroup.length) groups.push({tweets:curGroup, users:{}, numTweets:0});
			curGroup = [t]; // Empty and put the first one in the next group.
			lastInterval = group;
		}
	}
	// Add some stats to the tweets.
	var maxNumTweets = 0;
	for (var i=0, l=groups.length, g; i<l; i++){
		g = groups[i];
		for (var j=0, lt=g.tweets.length, tweet; j<lt; j++){
			tweet = g.tweets[j];
			if (!g.users[tweet.from_user]) g.users[tweet.from_user] = 0;
			g.users[tweet.from_user]++;
			g.numTweets++;
		}
		maxNumTweets = g.numTweets > maxNumTweets ? g.numTweets : maxNumTweets;
	}
	node = document.getElementById("container");
	var width = parseInt(node.ownerDocument.defaultView.getComputedStyle(node, null).width);
	
	// Draw the stats.
	for (var i=0, l=groups.length, g; i<l; i++){
		g = groups[i];
	}
console.log(groups, maxNumTweets, width);
}
function cleanUp(){
	// Clean up the script tags that were added by the JSONP.
	if (_jsonpNode){
		_jsonpNode.parentNode.removeChild(_jsonpNode);
	}
}
var _jsonpNode;
function _jsonp(url){
	// Creates a new <script> tag pointing to the specified URL and
	// adds it to the document. Copied from the dojo toolkit, thx!
	_jsonpNode = document.createElement("script");
	_jsonpNode.type = "text/javascript";
	_jsonpNode.src = url;
	_jsonpNode.charset = "utf-8";
	return document.getElementsByTagName("head")[0].appendChild(_jsonpNode);
}
loadTweets();

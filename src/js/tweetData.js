var tweetData;
(function(){
	
	tweetData = {
		groups:[], // The tweets grouped in the interval.
		maxNumTweets:0,
		
		groupInterval:10, // The interval in which the tweets are grouped into.
		
		fetchInterval:1, // How often do we get data from twitter, in minutes?
		
		filterString:"#ota09", // The initial filter string.
		
		_sinceId:null, // The last tweet from twitter we have showed.
		
		start:function(){
			var that = this,
				interval;
			this.load(true);
			interval = setInterval(function(){
				that.load();
			}, this.fetchInterval * 60 * 1000);
		},
		
		load:function(initialLoading){
			// Load the tweets using the twitter API over JSONP, the function to be called with
			// the result is passed as the "callback" parameters.
			var callback = initialLoading ? "tweetData._buildInitialData" : "tweetData._appendData";
			var url = "http://search.twitter.com/search.json?q="+
					encodeURIComponent(this.filterString)+
					"&callback=" + callback + "&rpp=1000";
			if (this._sinceId){
				url += "&since_id="+encodeURIComponent(this._sinceId);
			}
			this._jsonp(url);
		},
		
		_appendData:function(tweets){
console.log(arguments);
		},
		
		_buildInitialData:function(tweets){
			this._cleanUp(); // Clean up the JSONP stuff, free memory, etc.
			if (tweets.results.length==0){
				return;
			}
// TODO actually deleting the variables needs to be done to completely free the mem, iirc
			var date, group, minutes,
				curGroup = [];
				lastInterval = 0;
			this._sinceId = tweets.results[0].id;
			for (var i=0, l=tweets.results.length, t; i<l; i++){
				// Fortunately tweets are sorted by date.
				t = tweets.results[i];
				date = new Date(t.created_at);
				minutes = date.getMinutes();
				group = minutes - minutes % this.groupInterval;
				if (group==lastInterval){
					curGroup.push(t);
				} else {
					if (curGroup.length){
						this.groups.push({
							tweets:curGroup,
							users:{},
							numTweets:0,
							startTime:("0"+date.getHours()).substr(-2) + ":" + group
						});
					}
					curGroup = [t]; // Empty and put the first one in the next group.
					lastInterval = group;
				}
			}
			// Add some stats to the tweets.
			var maxNumTweets = 0;
			for (var i=0, l=this.groups.length, g; i<l; i++){
				g = this.groups[i];
				for (var j=0, lt=g.tweets.length, tweet; j<lt; j++){
					tweet = g.tweets[j];
					if (!g.users[tweet.from_user]) g.users[tweet.from_user] = 0;
					g.users[tweet.from_user]++;
					g.numTweets++;
				}
				this.maxNumTweets = g.numTweets > this.maxNumTweets ? g.numTweets : this.maxNumTweets;
			}
			for (var i=0, l=this.groups.length, g; i<l; i++){
				g = this.groups[i];
				ui.onNewGroup(g.startTime, g);
			}
		},
		
		_jsonpNode:null,
		_cleanUp:function(){
			// Clean up the script tags that were added by the JSONP.
			if (this._jsonpNode){
				this._jsonpNode.parentNode.removeChild(this._jsonpNode);
			}
		},
		
		_jsonp:function(url){
			// Creates a new <script> tag pointing to the specified URL and
			// adds it to the document. Copied from the dojo toolkit, thx!
			this._jsonpNode = document.createElement("script");
			this._jsonpNode.type = "text/javascript";
			this._jsonpNode.src = url;
			this._jsonpNode.charset = "utf-8";
			return document.getElementsByTagName("head")[0].appendChild(this._jsonpNode);
		}
	};
})();

tweetData.start();
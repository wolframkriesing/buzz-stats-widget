var tweetData;
(function(){
	
	tweetData = {
		groups:[], // The tweets grouped in the interval.
		maxNumTweets:0,
		
		groupInterval:10, // The interval in which the tweets are grouped into.
		
		fetchInterval:1/10, // How often do we get data from twitter, in minutes?
		
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
			this._cleanUp(); // Clean up the JSONP stuff, free memory, etc.
			if (tweets.results.length==0){
				return;
			}
			for (var i=0, l=tweets.length, t; i<l; i++){
				t = tweets[i];
				
			}
ui.onNewTweet(tweets.results[0], this.groups[this.groups.length-1]);
			
		},
		
		_buildInitialData:function(tweets){
			this._cleanUp(); // Clean up the JSONP stuff, free memory, etc.
			if (tweets.results.length==0){
				return;
			}
// TODO actually deleting the variables needs to be done to completely free the mem, iirc
			var date, group, minutes,
				curGroup = [],
				lastInterval = 0,
				lastDate;
			this._sinceId = tweets.results[0].id;
			for (var i=0, l=tweets.results.length, t; i<l; i++){
				// Fortunately tweets are sorted by date.
				t = tweets.results[i];
				date = new Date(t.created_at);
				minutes = date.getMinutes();
				group = minutes - minutes % this.groupInterval;
//console.log('date = ', date, group, date.getHours());
				if (group==lastInterval){
					curGroup.push(t);
				} else {
					if (curGroup.length){
						this._addGroup(curGroup, lastDate, lastInterval);
					}
					curGroup = [t]; // Empty and put the first one in the next group.
					lastInterval = group;
					lastDate = date;
				}
			}
			this._addGroup(curGroup, date, group);
			// Add some stats to the tweets.
			var maxNumTweets = 0;
			for (var i=0, l=this.groups.length, g; i<l; i++){
				g = this.groups[i];
				var users = {}; // The users' stats of this group.
				for (var j=0, lt=g.tweets.length, tweet; j<lt; j++){
					tweet = g.tweets[j];
					if (!users[tweet.from_user]) users[tweet.from_user] = 0;
					users[tweet.from_user]++;
				}
				this.maxNumTweets = g.tweets.length > this.maxNumTweets ? g.tweets.length : this.maxNumTweets;
				// Sort the users by the number of tweets each and give each a color.
				var sortable = [];
				for (var u in users){
					sortable.push([u, users[u]])
				}
				sortable.sort(function(a, b) {return a[1] - b[1]});
				for (var j=0, ls=sortable.length, user; j<ls; j++){
					user = sortable[j];
					g.users.push({
						id:user[0],
						numTweets:user[1],
						color:this.getColorByUser(user[0])
					});
				}
			}
			for (var i=this.groups.length-1, g; i>-1; i--){
				g = this.groups[i];
				ui.onNewGroup(g.startTime, g);
			}
		},
		
		_userToColor:{},
		_lastColorIndex:1,
		getColorByUser:function(userId){
			if (!this._userToColor[userId]){
				var i = this._lastColorIndex;
				if (i >= ui.colors.length-1){
					i = this._lastColorIndex = 1;
				} else {
					this._lastColorIndex++;
				}
				this._userToColor[userId] = ui.colors[this._lastColorIndex-1];
			}
			return this._userToColor[userId];
		},
		
		_addGroup:function(curGroup, date, group){
			this.groups.push({
				tweets:curGroup,
				users:[],
				startTime:("0"+date.getHours()).substr(-2) + ":" + ("0"+group).substr(-2)
			});
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
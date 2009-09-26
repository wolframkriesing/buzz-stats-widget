var ui;
(function(){
	ui = {
		onNewTweet:function(tweet, group){
			// tweet - contains all the data of the latest tweet
			// group - this is a ref to the group this new tweet is in
		},
		
		onNewGroup:function(startTime, group){
			// If a new group opened.
			// A new group is
			// startTime - this is the time when this group starts, i.e. "10:30"
		},
		
		colors: [
		  "#bf1313", // 0
      "#69bf13", // 90
      "#13bfbf", // 180
      "#6913bf", // 270
      "#bf6913", // 30
      "#13bf13", // 120
      "#1369bf", // 210
      "#bf13bf", // 300
      "#bfbf13", // 60
      "#13bf69", // 150
      "#1313bf", // 240
      "#bf1369"  // 330
    ]
	}
})();
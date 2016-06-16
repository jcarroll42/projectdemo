function scrollToAnchor(aid){
		console.log('hit');
	    var aTag = $("a[name='"+ aid +"']");
	    $('html, body').animate({scrollTop: aTag.offset().top},'slow');
	}

$(document).ready(function () {
	$('#results').accordion();
	$('#results').accordion("option", "collapsible");




	var genreObj = {Miscellaneous: []};
	

	$('#lyric-btn').on('click', function (){

		userInput = $('#lyric-input').val().trim();
		$('#lyric-input').val("");
		var queryURL = "https://api.musixmatch.com/ws/1.1/track.search";

		console.log(queryURL);

	    $.ajax({
	        url: queryURL,
	        method: "GET",
	        dataType: 'jsonp',
	        data: {
		        format: "jsonp",
		        callback: 'jsonpCallback',
		        apikey: '455f0aefff3b00f8f559b6b271f6a28d',
		        q_track: userInput
		    }
	    });

	    window.jsonpCallback = function(response) {
	    	console.log(response);
	    	$('#genreButtons').empty();

	    	for (var i=0; i<response.message.body.track_list.length; i++) {

	    		if (response.message.body.track_list[i].track.primary_genres.music_genre_list.length > 0) {

		    		var genreName = response.message.body.track_list[i].track.primary_genres.music_genre_list[0].music_genre.music_genre_name;
		    		var genreBool = true;
		    		var trackID = response.message.body.track_list[i].track.track_id;
		    		var spotifyID = response.message.body.track_list[i].track.track_spotify_id;
		    		var trackName = response.message.body.track_list[i].track.track_name;
		    		var trackArtist = response.message.body.track_list[i].track.artist_name;
	    		
	    			//Loops through genreObj properties and checks if genre already exists. If it does, sets boolean to false
	    			//and pushes new array with current trackID and spotifyID
		    		for (var prop in genreObj){
		    			if (genreObj.hasOwnProperty(prop)){
		    				if(prop === genreName){
		    					genreBool = false;
		    					genreObj[prop].push([trackID, spotifyID, trackName, trackArtist]);
		    				}
		    			}
		    		}

		    		//If the genre doesn't exist: creates new button for that genre and property for that genre in genreObj with
		    		//an array of arrays containing the current trackID and spotifyID
		    		if (genreBool) {
				    	var genre = $('<button class="genre btn btn-default btn-block btn-lg" id=' + genreName + '>' + genreName + '</button>');
				    	$('#genreButtons').append(genre);
				    	genreObj[genreName] = [[trackID, spotifyID, trackName, trackArtist]];
		    		}
	    		}
	    		else{
	    			var trackID = response.message.body.track_list[i].track.track_id;
	    			var spotifyID = response.message.body.track_list[i].track.track_spotify_id;
	    			var trackName = response.message.body.track_list[i].track.track_name;
		    		var trackArtist = response.message.body.track_list[i].track.artist_name;
	    			genreObj.Miscellaneous.push([trackID, spotifyID, trackName, trackArtist]);
	    		}
	    	} 
	    	var miscButton = $('<button class="genre btn btn-default btn-block btn-lg" id="Miscellaneous">Miscellaneous</button>');
	    	$('#genreButtons').append(miscButton);
	    	console.log(genreObj);
	    };
	    scrollToAnchor('gButtons');
	    return false;
	    
	});

	$(document).on('click', '.genre', function(){
		$('#results').empty();

		var genrePicked = $(this).attr('id'); //sets to the ID of the genreButton that was picked
		pickedTrackList = genreObj[genrePicked]; //sets to the property in genreObj that matches the button id. This is an array
		//console.log(pickedTrackList); //logs array with all of the tracks for that genre
		//console.log(pickedTrackList[0][0], pickedTrackList[0][1]); //logs the trackID and spotifyID of the first track for the picked genre
		var counter = 0;

		for (i = 0; i < pickedTrackList.length; i++){
			var queryURL = "http://api.musixmatch.com/ws/1.1/track.lyrics.get";

			$.ajax({
	        url: queryURL,
	        method: "GET",
	        dataType: 'jsonp',
	        data: {
		        format: "jsonp",
		        callback: 'jsonpCallbackFinal',
		        apikey: '455f0aefff3b00f8f559b6b271f6a28d',
		        track_id: pickedTrackList[i][0]
		    }
	    })
			window.jsonpCallbackFinal = function(response) {
				var trackLyrics = response.message.body.lyrics.lyrics_body;
				var parsedTrackLyrics = trackLyrics.replace(/\n/g,"<br />");
				$('#results').append("<h3>" + pickedTrackList[counter][2] + " by " + 
					pickedTrackList[counter][3] + "</h3><div><iframe src='https://embed.spotify.com/?uri=spotify:track:" + 
					pickedTrackList[counter][1] + "' frameborder='0' allowtransparency='true'></iframe><p>" + 
					parsedTrackLyrics + "</p></div>");
				counter++;
				$('#results').accordion("refresh");
				$('#results').accordion("option", "collapsible", true);
				$('#results').accordion("option", "active", false);

			}
		}

		
		scrollToAnchor('lyricResults');
	});

});

	


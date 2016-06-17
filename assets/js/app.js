function scrollToAnchor(aid){
	    var aTag = $("a[name='"+ aid +"']");
	    $('html, body').animate({scrollTop: aTag.offset().top},'slow');
	}

function getArtistFromTrack(spotifyTrack){

		// Search using the Spotify track id from our original musixmatch return
		//to identify the artist unique Spotify ID, note we send the id of the track to
		//get the id of the artist - would be similar for albums
		var queryURL = "https://api.spotify.com/v1/tracks/" + spotifyTrack;
		var topTracksList = [];
		$.ajax({url: queryURL, method: 'GET'}).done(function(response) {
		
			// The return here is an array of all the artists that play on
			// the track - we assume that the first artist returned is
			// the most popular one
			var trackArtistsId = response.artists[0].id;

			

			//this is the spotify way to get the top tracks by an artist
			//return is the id of the artist. required parameter is the country specified
			//by the country code.  We used US		
			var queryArtistTopTracksURL = "https://api.spotify.com/v1/artists/" + trackArtistsId + "/top-tracks?country=US"; 

			$.ajax({url: queryArtistTopTracksURL, method: 'GET'}).done(function(responseArtist) {

				for (var i=0; i<responseArtist.tracks.length; i++) {
				
				//var topTracksList.push(i); //note declaring and using array var in this way does not work
				// var topTracksList = [];
				topTracksList.push(responseArtist.tracks[i].name); //name of track
				//console.log(topTracksList); //just printing out to check
				};//for loop
			}); //second queryArtistTopTracksURL
		}); //first queryURL	
		return topTracksList;
	}

$(document).ready(function () {
	$('#buffer1').hide();
	$('#buffer2').hide();
	$('#genreArea').hide();
	$('#lyricsArea').hide();
	var emptyNav = true;
	var emptyDrop = true;
	var genreDrop = [];
	$('#results').accordion();
	$('#results').accordion("option", "collapsible");
	var genreObj = {Miscellaneous: []};
	
	//$(document).on('click', '.lyric-btn', function (){
	var lyricSearch = function(){
		genreObj = {Miscellaneous: []};
		var genreBool= true;
		$('#results').empty();
		$('#buffer1').show();
		$('#genreArea').show();
		genreDrop = [];
		emptyDrop = true;
		$('#addingGenres').remove();

		userInput = $('.lyric-input').val().trim();
		console.log(userInput);
		$('.lyric-input').val("");
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
		    		var genreNameFull = genreName;
		    		genreName = genreName.replace(/\s/g, '');
		    		genreBool = true;
		    		var trackID = response.message.body.track_list[i].track.track_id;
		    		var spotifyID = response.message.body.track_list[i].track.track_spotify_id;
		    		var trackName = response.message.body.track_list[i].track.track_name;
		    		var trackArtist = response.message.body.track_list[i].track.artist_name;
		    		var topTracks = getArtistFromTrack(spotifyID);
		    		console.log(topTracks);
	    		
	    			//Loops through genreObj properties and checks if genre already exists. If it does, sets boolean to false
	    			//and pushes new array with current trackID and spotifyID
		    		for (var prop in genreObj){
		    			if (genreObj.hasOwnProperty(prop)){
		    				if(prop === genreName){
		    					genreBool = false;
		    					genreObj[prop].push([trackID, spotifyID, trackName, trackArtist, topTracks]);
		    				}
		    			}
		    		}

		    		//If the genre doesn't exist: creates new button for that genre and property for that genre in genreObj with
		    		//an array of arrays containing the current trackID and spotifyID
		    		if (genreBool) {
		    			debugger;
				    	var genre = $('<button class="genre btn btn-default btn-block btn-lg" genreSelect=' + genreName + '>' + genreNameFull + '</button>');
				    	var gForDrop = $('<li><a class="genre" genreSelect=' + genreName + '>' + genreName + '</a>');
				    	genreDrop.push(gForDrop);
				    	$('#genreButtons').append(genre);
				    	genreObj[genreName] = [[trackID, spotifyID, trackName, trackArtist, topTracks]];
		    		}
	    		}
	    		else{
	    			var trackID = response.message.body.track_list[i].track.track_id;
	    			var spotifyID = response.message.body.track_list[i].track.track_spotify_id;
	    			var trackName = response.message.body.track_list[i].track.track_name;
		    		var trackArtist = response.message.body.track_list[i].track.artist_name;
	    			genreObj.Miscellaneous.push([trackID, spotifyID, trackName, trackArtist, topTracks]);
	    		}
	    	} 
	    	var miscButton = $('<button class="genre btn btn-default btn-block btn-lg" genreSelect="Miscellaneous">Miscellaneous</button>');
	    	$('#genreButtons').append(miscButton);
	    	var miscGenre = $('<li><a class="genre" genreSelect="Miscellaneous">Miscellaneous</a><li>');
	    	genreDrop.push(miscGenre);
	    	if (emptyNav){
		    	var searchnav = $('<div class="collapse navbar-collapse" id="navbarfull"><form class="navbar-form navbar-left" role="search"><div class="form-group"><input type="text" class="form-control lyric-input" placeholder="Search"></div><button type="submit" class="btn btn-default lyric-btn">Submit</button></form><div>');
		    	$('#navchange').append(searchnav);
		    	emptyNav = false;
		    }
	    	console.log(genreObj);
	    	console.log(genreDrop);
	    };
	    scrollToAnchor('gButtons');
	    return false;
	    
	};
 
	$(document).on('click', '.genre', function(){
		$('#results').empty();
		$('#lyricsArea').show();
		$('#buffer2').show();
		

		var genrePicked = $(this).attr('genreSelect'); //sets to the ID of the genreButton that was picked
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
				var topTracks = "topTracks" + counter;
				var topTracksID = "#" + topTracks;
				$('#results').append("<h2>" + pickedTrackList[counter][2] + " by " + 
					pickedTrackList[counter][3] + "</h2><div><iframe src='https://embed.spotify.com/?uri=spotify:track:" + 
					pickedTrackList[counter][1] + "' frameborder='0' allowtransparency='true'></iframe><div class='btn-group'><button type='button' class='btn btn-default dropdown-toggle trackListBtn' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Artist Top Tracks <span class='caret'></span></button><ul class='dropdown-menu' id=" + topTracks + " ></ul></div><p>" + 
					parsedTrackLyrics + "</p></div>");
				for(j = 0; j < pickedTrackList[counter][4].length; j++){
					$(topTracksID).append('<li>' + pickedTrackList[counter][4][j] + '</li><li role="separator" class="divider"></li>');
				}
				counter++;
				$('#results').accordion("refresh");
				$('#results').accordion("option", "collapsible", true);
				$('#results').accordion("option", "active", false);

			}
		}
		if (emptyDrop){
			var genreDropdown = $('<ul class="nav navbar-nav" id="addingGenres"><li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Change Genre<span class="caret"></span></a><ul class="dropdown-menu" id="dropdownGenre"></ul></li><ul>');
			$('#navbarfull').append(genreDropdown);
		
			for (i = 0; i < genreDrop.length; i++){
				$('#dropdownGenre').append(genreDrop[i]);
			}
			emptyDrop = false;
		}
		
		scrollToAnchor('lyricResults');
	});
$(document).on('click', '.lyric-btn', lyricSearch);
});



	


let API_KEY = "60531b06792effa950ba7df6cf111206";
let url = "https://api.themoviedb.org/3/";

$( function() {
    $( "#discoverBtn" ).on("click", function() {
        discoverFilm();
        $( ".redBackground" ).show();
    });

    $( ".infoBtn" ).on("click", function() {
        $(this).next().toggle();
    });

    setTimeout(function() {
        $("#numFilmsInfo").hide();
    }, 8000);
});

$( function() {
    // establish the release year slider
    $( "#yearSlider" ).slider({
        range: true,
        min: 1900,
        max: 2023,
        values: [ 1900, 2023 ],
        slide: function( event, ui ) {
            $( "#yearMinHandle" ).text(ui.values[0]); // might need to change this to .text
            $( "#yearMaxHandle" ).text(ui.values[1]);
        }
    });
    $( "#yearMinHandle" ).text($( "#yearSlider" ).slider( "values", 0 ));
    $( "#yearMaxHandle" ).text($( "#yearSlider" ).slider( "values", 1 ));

    // establish the runtime slider
    $( "#runtimeSlider" ).slider({
        range: true,
        min: 0,
        max: 300,
        values: [ 0, 300 ],
        slide: function( event, ui ) {
            $( "#runtimeMinHandle" ).text(ui.values[0]);
            $( "#runtimeMaxHandle" ).text(ui.values[1]);
        }
    });
    $( "#runtimeMinHandle" ).text($( "#runtimeSlider" ).slider( "values", 0 ));
    $( "#runtimeMaxHandle" ).text($( "#runtimeSlider" ).slider( "values", 1 ));
});

async function parsePeople(person) {

    let requestURL = url + "search/person?api_key=" + API_KEY + "&query=" + person;

    const result = fetch(requestURL)
        .then(response => response.json())
        .then(data => {
            let id = data.results[0].id;
            return id + ",";
        });
    return result;

}

function getPersonId(person) {

    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);
            let id = response.results[0].id;
            return id + ",";
        }
    }
    let requestURL = url + "search/person?api_key=" + API_KEY + "&query=" + person;
    request.open("GET", requestURL, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send();

}

async function discoverFilm() {

    let numFilms = 1;
    if($("#numFilmsInput").val() !== "") {
        numFilms = $("#numFilmsInput").val();
    }
    let randomPage = Math.floor((Math.random() * (numFilms / 20)) + 1);

    let content = "&language=en-US&include_adult=false&include_video=false";
    let page = "&page=" + randomPage;
    let sort_by = "&sort_by=popularity.desc";
    let watch_region = "&watch_region=US";
    let with_watch_monetization_types = "&with_watch_monetization_types=flatrate";

    // dropdown
    let genre = "";
    // 2 handle slider
    let releaseYear = ""; // also can include lte and gte (primary_release_year)
    // 2 handle slider
    let runtime = ""; // also can include lte and gte
    // text box
    let people = "";
    // dropdown
    let providers = "";

    if($("#genreCheckbox").prop("checked")) {
        genre = "&with_genres=" + $("#genreDropdown").val();
    }

    if($("#yearCheckbox").prop("checked")) {
        let yearMin = $("#yearSlider").slider("values", 0);
        let yearMax = $("#yearSlider").slider("values", 1);
        if(yearMin == yearMax) {
            releaseYear = "&primary_release_year=" + $("#yearSlider").val();
        } else {
            releaseYear = "&primary_release_date.gte=" + yearMin
             + "&primary_release_date.lte=" + yearMax;
        }
    }

    if($("#runtimeCheckbox").prop("checked")) {
        runtime = "&with_runtime.gte=" + $("#runtimeSlider").slider("values", 0)
         + "&with_runtime.lte=" + $("#runtimeSlider").slider("values", 1);
    }

    // let temp = $("#castCheckbox");
    if($("#castCheckbox").prop("checked") || $("#crewCheckbox").prop("checked")) {
        if($("#castInput") != "" && $("#castCheckbox").prop("checked")) {
            await parsePeople($("#castInput").val()).then(function(result) {
                people += result;
            });
        }
        if($("#crewInput") != "" && $("#crewCheckbox").prop("checked")) {
            await parsePeople($("#crewInput").val()).then(function(result) {
                people += result;
            });
        }
        people = people.substring(0, people.length - 1);
        people = "&with_people=" + people;
    }

    if($("#providersCheckbox").prop("checked")) {
        providers = "&with_watch_providers=" + $("#providersDropdown").val();
    }

    content += sort_by + watch_region + with_watch_monetization_types + page
     + genre + releaseYear + runtime + people + providers;

    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const response = JSON.parse(this.responseText);
            parseResult(response, numFilms);
        }
    }
    
    let requestURL = url + "discover/movie?api_key=" + API_KEY + content;
    request.open("GET", requestURL, true);
    request.setRequestHeader("Content-type", "application/json");
    request.send();
}

function parseResult(response, numFilms) {

    if(response.total_results == 0) {
        alert("No results found. Please try again.");
        return;
    }

    let max = response.total_results;
    if(response.total_pages > 1) {
        max = 20;
    }
    if(numFilms < 20) {
        max = numFilms;
    }
    let randomIndex = Math.floor(Math.random() * max);

    let result = response.results[randomIndex];
    let title = result.title;
    let poster = "https://image.tmdb.org/t/p/w500" + result.poster_path;

    $("#movieTitle").text(title);
    $("#moviePoster").attr("src", poster);
    $("#moviePoster").attr("alt", title + " poster");
    $("#moviePoster").show();

}
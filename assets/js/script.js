var city = "";
var currentCity = $("#current-city");
var currentTemp = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var sCity = [];
var APIKey = "a0aca8a89948154a4182dcecc780b513";

var find = function(c) {

    for (var i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }

    return 1;
};

var displayWeather = function(event) {

    event.preventDefault();
    
    if(searchCity.val().trim() !== "") {
        var city = searchCity.val().trim();
        currentWeather(city);
    }
};

var currentWeather = function(city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;

    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response) {
        console.log(response);

        var weatherIcon = response.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/"+weatherIcon +"@2x.png";
        var date = new Date(response.dt*1000).toLocaleDateString();

        $(currentCity).html(response.name + "("+date+")" + "<img src=" + iconURL + ">");

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;

        $(currentTemp).html((tempF).toFixed(2) + "&#8457");
        
        $(currentHumidty).html(response.main.humidity + "%");
        
        var ws = response.wind.speed;
        var windMPH = (ws*2.237).toFixed(1);
        
        $(currentWSpeed).html(windMPH + "MPH");
       
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod === 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity === null) {
                sCity = [];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
    });
};
   
var UVIndex = function(ln,lt) {

    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;

    $.ajax({
        url:uvURL,
        method:"GET"
    }).then(function(response) {
        $(currentUvindex).html(response.value);
    });
};
    
var forecast = function(cityID) {

    var queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;

    $.ajax({
        url:queryForecastURL,
        method:"GET"
    }).then(function(response) {
        
        for (var i = 0; i < 5; i++) {
            var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconCode = response.list[((i+1)*8)-1].weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/"+iconCode+".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconURL+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
    });
};

var addToList = function(c) {

    var listEl = $("<li>" + c.toUpperCase() + "</li>");

    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
};

var invokePastSearch = function(event) {

    var liEl = event.target;

    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }
};

var loadlastCity = function() {

    $("ul").empty();

    var sCity = JSON.parse(localStorage.getItem("cityname"));

    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (var i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }

        city = sCity[i-1];

        currentWeather(city);
    }
};

var clearHistory = function(event) {

    event.preventDefault();

    sCity = [];

    localStorage.removeItem("cityname");

    document.location.reload();
};

$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);






















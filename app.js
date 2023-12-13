const BASE_URL = 'https://api.weatherapi.com/v1/';
const API_KEY = '6fafd13394e84324a91204628230112';

const getWeatherBtn = document.querySelector('#get-weather-btn');
const toggleBtn = document.querySelector('#toggle-unit');
let toggleData;

getWeatherBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const locationSearch = document.querySelector('#location-search');
    const locationError = document.querySelector('.error');

    if (locationSearch.validity.valueMissing) {
        locationError.textContent = 'Please enter a location.';
        locationError.classList.add('active-error');
    } else {
        locationError.textContent = '';
        locationError.classList.remove('active-error');
        const location = locationSearch.value;

        resetToggleBtn();
        getWeatherData(location).catch(() =>{
            locationError.textContent = 'Please enter a valid location.';
            locationError.classList.add('active-error');
        });
    }
});

async function getWeatherData(location) {
    const response = await fetch(`${BASE_URL}forecast.json?key=${API_KEY}&q=${location}&days=5&aqi=no&alerts=no`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    processWeatherData(data);
}

function processWeatherData(data) {
    const weatherData = {
        current: {
            iconSrc: data.current.condition.icon,
            condition: data.current.condition.text,
            tempC: data.current.temp_c,
            tempF: data.current.temp_f,
        },
        location: {
            name: data.location.name,
            region: data.location.region
        }
    };

    //Create nested object containing forecast data
    const forecastData = {};
    for(const key in data) {
        if (key == 'forecast') {
            const forecastDay = data.forecast.forecastday;
            const forecastLength = data.forecast.forecastday.length;

            for (let i = 0; i < forecastLength; i++) {
                const date = forecastDay[i].date;
                const condition = forecastDay[i].day.condition;
                const maxTempC = forecastDay[i].day.maxtemp_c;
                const maxTempF = forecastDay[i].day.maxtemp_f;
                const minTempC = forecastDay[i].day.mintemp_c;
                const minTempF = forecastDay[i].day.mintemp_f;
                
                forecastData[i] = {
                    date: date,
                    condition: condition,
                    maxTempC: maxTempC,
                    minTempC: minTempC,
                    maxTempF: maxTempF,
                    minTempF: minTempF
                }
            }
        }
    }

    //Combine existing weatherData object with forecast data
    const combinedWeatherData = {...weatherData, forecast: forecastData};
    displayWeatherData(combinedWeatherData);
}

function displayWeatherData(data) {
    toggleData = data;
    const location = document.querySelector('.location');
    const temperature = document.querySelector('.temperature');
    const condition = document.querySelector('.condition');
    const mainIconContainer = document.querySelector('.current-weather-container .icon-container');
    mainIconContainer.innerHTML = '';
    const mainIcon = document.createElement('img');

    temperature.classList.add('fahrenheit');
    location.textContent = data.location.name + ', ' + data.location.region;
    temperature.textContent = data.current.tempF;
    condition.textContent = data.current.condition;

    mainIcon.className = 'condition-icon';
    mainIcon.src = 'https:' + data.current.iconSrc;
    mainIconContainer.appendChild(mainIcon);

    const dayContainer = document.querySelectorAll('.day-container');
    const currentDate = new Date().toLocaleDateString('en-US', {timeZone: 'UTC', 'weekday': 'long'});

    //Counter variable for looping through the data object
    let counter = 0;
    
    //Display information for each day in the forecast
    dayContainer.forEach(day => {
        const iconContainer = day.querySelector('.icon-container');
        iconContainer.innerHTML = '';
        const icon = document.createElement('img');
        icon.className = 'condition-icon';

        iconContainer.appendChild(icon);

        const dayElement = day.querySelector('.day');
        const lowElement = day.querySelector('.low');
        const highElement = day.querySelector('.high');
       
        //Format date to be the same as currentDate
        const dateString = data.forecast[counter].date;
        const newDate = new Date(`${dateString}T00:00:00Z`);
        const dayDate = newDate.toLocaleDateString('en-US', {timeZone: 'UTC', 'weekday': 'long'});
        icon.src = 'https:' + data.forecast[counter].condition.icon;

        //Change text if currentDay is in the forecast
        if (dayDate === currentDate) {
            dayElement.textContent = 'Today';
        } else {
            dayElement.textContent = dayDate;
        }
        
        lowElement.textContent = data.forecast[counter].minTempF;
        highElement.textContent = data.forecast[counter].maxTempF;

        lowElement.classList.add('fahrenheit');
        highElement.classList.add('fahrenheit');
        
        counter++;
    });
}

function resetToggleBtn() {
    toggleBtn.className = 'fahrenheit-unit';
    toggleBtn.textContent = 'Fahrenheit';
}
 
  //Toggle which temperature unit is displayed
  toggleBtn.addEventListener('click', function() {
    let data;
    if (toggleData) {
        data = toggleData;
        const temps = document.querySelectorAll('.fahrenheit');
        const currentTemp = document.querySelector('.temperature');
    
        toggleBtn.classList.toggle('celsius-unit');
        toggleBtn.classList.toggle('fahrenheit-unit');
    
        if (toggleBtn.classList.contains('celsius-unit')) {
           counter = 0;
           let hasLow = false;
           let hasHigh = false;
           currentTemp.textContent = data.current.tempC;
           toggleBtn.textContent = 'Celsius';
           
           //Toggle unit for each temp in the forecast
           temps.forEach(temp => {
                if (temp.classList.contains('low')) {
                    temp.textContent = data.forecast[counter].minTempC;
                    hasLow = true;         
                } else if (temp.classList.contains('high')) {
                    temp.textContent = data.forecast[counter].maxTempC;
                    hasHigh = true;
                }
    
                //Once both, the low and high temps have been found 
                //increment the counter so the next set can be updated
                if (hasLow && hasHigh) {
                    counter++;
                    hasLow = false;
                    hasHigh = false;
                }
            });
        } else {
            counter = 0;
            let hasLow = false;
            let hasHigh = false;
            currentTemp.textContent = data.current.tempF;
            toggleBtn.textContent = 'Fahrenheit';
    
            temps.forEach(temp => {
                if (temp.classList.contains('low')) {
                    temp.textContent = data.forecast[counter].minTempF;
                    hasLow = true;         
                    
                } else if (temp.classList.contains('high')) {
                    temp.textContent = data.forecast[counter].maxTempF;
                    hasHigh = true;
                }
                if (hasLow && hasHigh) {
                    counter++;
                    hasLow = false;
                    hasHigh = false;
                }
            });
        }
    }
});

getWeatherData('London');
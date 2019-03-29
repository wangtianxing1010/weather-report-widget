import React, {Component} from 'react';

import './Weathercards.css'
import axios from 'axios';
import sunny from '../img/sunny.png';
import rainy from '../img/rainy.png';
import cloudy from '../img/cloudy.png';
import snowy from '../img/snowy.png';
import logo from '../img/logo.svg';


class Weathercards extends Component {
    constructor(props){
        super(props)
        this.state = {
            apiKey: "7d10801ea24fc35d568f4df93ba17b72",
            forecasts: [],
            city: "Toronto,ca",
            Month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        }
    }

    handleSumbit=(e)=>{
        e.preventDefault();
        let newCity = e.target.elements.city.value;
        let newCountry = e.target.elements.country.value;
        this.setState({
            city:e.target.elements.city.value,
            country:e.target.elements.country.value,
        })
        const {apiKey} = this.state;
        this.fetchWeatherForecasts(apiKey, newCity, newCountry);
    }


    getFilterAndIndex=(index, filter)=>{
        const {forecasts} = this.state;
        let reports = forecasts[index];
        return this.genWeatherItems(reports, filter);
    }

    genWeatherItems=(forecasts, filter)=>{
        const listItems = forecasts.map((forecast, index)=>{
            let f; 
            switch (filter) {
                case 'fiveDays':
                // show the 8:00 or closest report on current day and 8:00 report for other days if available
                if(index === 0){
                   f = forecast.length<6? forecast[0]: forecast[forecast.length-8+2];
                } else if(index !==forecast.length-1){
                    f = forecast.length>3? forecast[2]: forecast[-1];
                } else {
                    f = forecast[2];
                }
                break;
                default:
                f = forecast;
            }
            const {dt, weather, main} = f;
            const date = new Date(dt*1000);
            const {Month} = this.state;
            const dateString = Month[date.getMonth()] + ' ' 
                                + date.getDate().toString() + ', ' 
                                + date.getHours().toString() + ' O\'clock';
            return <WeatherItem key={`${filter}+${index}`} onClickWeatherItem={this.getFilterAndIndex} 
                            index={index} className={filter} date={dateString} 
                            weather={weather[0].main} 
                            description={weather[0].description}
                            temperature={main.temp}/>
    
        })
        return listItems;
    }


    fetchWeatherForecasts=(apiKey, city, country)=>{
        var resultsCollection = [];

        axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=metric&APPID=${apiKey}`).then(res=>{
            const results = res.data.list;

            let lastTime = new Date(results[0].dt*1000);

            // group data by date
            let i = 0;
            results.map((result)=>{
                let curTime = new Date(result.dt*1000);
                // group data by date
                if (curTime.getDate()!==lastTime.getDate()){
                    lastTime = curTime;
                    i ++ ;
                }
                // create open slot for data in new date
                if(!resultsCollection[i]){
                    resultsCollection[i] = [];
                }
                // fill in the data
                resultsCollection[i].push(result);
            });
            this.setState({
                forecasts: resultsCollection,
            });
        });
    }
    
    componentDidMount(){
        // fetch weather forecasts for 5 days;
        const {apiKey, city} = this.state;
        this.fetchWeatherForecasts(apiKey, city);

    }

    render(){
        const {forecasts, city, country} = this.state;
        // const countryCode = country.toUpperCase();
        console.log('councode', typeof(country));
        return (
        <div className="weatherCards">
        Weather Forcasts for {city}, {country} <Form onSumbitForm={this.handleSumbit}></Form>
            {this.genWeatherItems(forecasts, 'fiveDays')}
        </div>
        );
    }
}

class Form extends Component {
    render(){
        return (
            <form onSubmit={this.props.onSumbitForm} >
                <label htmlFor='city'>City: </label>
                <input type='txt' name='city' placeholder="Example: London"></input>
                <label htmlFor='country'>Country: </label>
                <input type='txt' name='country' placeholder="Example: uk"></input>
                <button>Get Weather</button>
            </form>
        )
    }
}

class WeatherItem extends Component {
    
    constructor(props){
        super(props)
        this.state={
            showDetailedReport: false
        }
    }

    handleClick=()=>{
        const {className} = this.props;
        switch(className){
            case 'fiveDays':
            this.setState(prevState=>({
                showDetailedReport: !prevState.showDetailedReport,
            }))
            break;
            default:

        }
    }

    
    renderWeatherItem=()=>{
        const {date, weather, description, temperature, className, index} = this.props;
        let sign;
        switch(weather){
            case "Clear":
            sign = <img src={sunny} alt="logo"/>
            break;
            case "Clouds":
            sign = <img src={cloudy} alt="logo" />
            break;
            case "Rain":
            sign = <img src={rainy} alt="logo" />
            break;
            case "Snow":
            sign = <img src={snowy} alt="logo" />
            break;
            default:
            sign = <img src={logo} className="reactLogo" alt="logo" />
        }
        return <div index={index} className={`weatherItem ${className}`} onClick={this.handleClick}>
        {sign}
        {date},
        it is {description}, 
        and the temperature is {temperature} Celsius.</div>;
    }

    render(){
        let detailReports = null;
        if (this.state.showDetailedReport){
            const {index} = this.props;
            detailReports = (
                <div>
                    {this.props.onClickWeatherItem(index, 'detailed')}
                </div>
            )
        }
        return (
            <div>
                {this.renderWeatherItem()}
                {detailReports}
            </div>
        )
    }
}



export default Weathercards;

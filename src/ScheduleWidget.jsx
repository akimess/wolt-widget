import React from 'react';

class ScheduledWidget extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            scheduleData: []
        }
        this.extractJSON = this.extractJSON.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.capitalizeFirstLetter = this.capitalizeFirstLetter.bind(this);
        this.isToday = this.isToday.bind(this);
    }

    componentDidMount() {
        //Catch a file upload
        document.getElementById('FileUpload').addEventListener("change", (event) => {
            if (event.target.files.length === 1) {
                const reader = new FileReader();

                reader.onload = (readerEvent) => {
                    let jsonObj = JSON.parse(readerEvent.target.result);
                    this.extractJSON(jsonObj);
                }

                reader.readAsText(event.target.files[0]);
            }
        })
    }

    //Return 12-format time (12 pm/am)
    formatTime(scheduleObj) {
        return new Date(scheduleObj.value * 1000)
            .toLocaleString('en-FI', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    isToday(dayName) {
        let date = new Date();
        const todayDayName = date.toString().split(' ')[0];
        return dayName.includes(todayDayName);
    }

    extractJSON(jsonObj) {
        const daysOfWeek = Object.keys(jsonObj);
        let scheduleData = [];

        for (let i = 0; i < daysOfWeek.length; i++) {
            const scheduleArr = jsonObj[daysOfWeek[i]];
            const dayName = this.capitalizeFirstLetter(daysOfWeek[i]);
            let dayRowObj = {
                day: dayName,
                today: this.isToday(dayName),
                times: [],
                closed: false
            };

            let scheduleArrCopy = [...scheduleArr];

            //If the first element in the schedule has type "close" then remove it,
            // so we will have a correct number of "open"/"close" pairs
            if (scheduleArrCopy.length > 0 && scheduleArrCopy[0].type === "close") scheduleArrCopy.shift();

            //If empty, then it's closed for that day
            if (scheduleArrCopy.length === 0) {
                dayRowObj.closed = true;
                scheduleData.push(dayRowObj);
                continue;
            }

            if (scheduleArrCopy[scheduleArrCopy.length - 1].type === 'open') {
                let count = i;
                let found = false;
                let stopAt = i;

                //Iterate through each day, until we find the first "close" type.
                //Stop after one cycle
                while (!found) {
                    if (count + 1 === daysOfWeek.length) {
                        count = 0;
                    } else {
                        count++;
                    }
                    if (jsonObj[daysOfWeek[count]][0] && jsonObj[daysOfWeek[count]][0].type === 'close') {
                        scheduleArrCopy.push(jsonObj[daysOfWeek[count]][0]);
                        found = true;
                    } else if (count === stopAt) {
                        console.log('No closing time found');
                        found = true;
                        return;
                    }
                }
            }

            //Remove elements by pairs and convert them to string format "1 AM - 2 PM"
            while (scheduleArrCopy.length > 0) {
                const openTime = this.formatTime(scheduleArrCopy.shift());
                const closeTime = this.formatTime(scheduleArrCopy.shift());

                const timeString = `${openTime.toUpperCase()} - ${closeTime.toUpperCase()}`;
                dayRowObj.times.push(timeString);
            }
            scheduleData.push(dayRowObj);
        }

        this.setState({
            scheduleData: scheduleData
        })
    }

    render() {
        return (
            <div className="WidgetContainer">
                <form className="UploadForm">
                    <label htmlFor="FileUpload" className="CustomButton">
                        Upload Image
                    </label>
                    <input id="FileUpload" name='json_file' type="file" />
                </form>
                <div className="WidgetBox">
                    <div className="WidgetBoxMargin">
                        <div className="Heading">
                            <i className="icono-clock"></i>
                            <h1>Opening hours</h1>
                        </div>
                        <div className="Schedule">
                            {
                                this.state.scheduleData.length > 0 ?
                                    this.state.scheduleData.map((schd, indx) => (
                                        <div className="DayRow" key={indx}>
                                            <div className="DateWrapper">
                                                <h3>{schd.day}</h3>
                                                {schd.today && (<h4>TODAY</h4>)}
                                            </div>
                                            <div className="TimeWrapper">
                                                {
                                                    schd.times.length > 0 ?
                                                        schd.times.map((time, timeIndx) => (
                                                            <p key={timeIndx}>{time}</p>
                                                        ))
                                                        :
                                                        (<p className="closed">Closed</p>)
                                                }
                                            </div>
                                        </div>
                                    )) :
                                    (<div className="EmptySchedule">Empty</div>)
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ScheduledWidget;
const popularCities = {}
const popularPasswords = {}
const strongPasswords = {}

const averages = {
    general: 0,
    male: 0,
    female: 0,
}

const counters = {
    maleCounter: 0,
    femaleCounter: 0,
}

let jsonObj;

async function getData(url) {

    const response = await fetch(url);
    return response.json();

}

async function getJson() {

    const data = await getData('./persons.json');
    return data.results;

};

(async function changeJson() {

    jsonObj = await getJson();

    jsonObj.forEach(element => {

        delete element.picture;

        element.cell = cleanNumber(element.cell);
        element.phone = cleanNumber(element.phone);
        element.daysToBirthday = howManyDaysToTheBirthday(element.dob.date, element.dob.age);

        averages.general += element.dob.age;

        if (element.gender === 'male') {
            averages.male += element.dob.age;
            counters.maleCounter++;
        }

        if (element.gender === 'female') {
            averages.female += element.dob.age;
            counters.femaleCounter++;
        }

        if (popularCities.hasOwnProperty(element.location.city)) popularCities[element.location.city]++;
        else popularCities[element.location.city] = 1;

        if (popularPasswords.hasOwnProperty(element.login.password)) popularPasswords[element.login.password]++;
        else popularPasswords[element.login.password] = 1;

        strongPasswords[element.login.password] = 0;

        howStrongIsPassword(element.login.password);

    })

    calculateAverages();

    document.getElementById('women_percent').innerHTML = averages.femalePercent;
    document.getElementById('men_percent').innerHTML = averages.malePercent;
    document.getElementById('average_age_general').innerHTML = averages.general;
    document.getElementById('average_age_men').innerHTML = averages.male;
    document.getElementById('average_age_women').innerHTML = averages.female;

    console.log('there is one random person:', jsonObj[Math.floor(Math.random() * jsonObj.length)]);

})();

const howManyDaysToTheBirthday = (dateOfBirth, age) => {

    const actualDate = new Date();

    let year = dateOfBirth.slice(0, 4);
    year = String(Number(year) + Number(age));

    let personNextBirthday = new Date(year + dateOfBirth.slice(4, dateOfBirth.length));

    if (actualDate < personNextBirthday) {
        return Math.ceil((personNextBirthday - actualDate) / (1000 * 3600 * 24));
    } else {
        year++;
        personNextBirthday = new Date(year + dateOfBirth.slice(4, dateOfBirth.length));
        return Math.ceil((personNextBirthday - actualDate) / (1000 * 3600 * 24));
    }

}

const calculateAverages = () => {

    averages.general = Math.round((averages.general / jsonObj.length) * 2) / 2;
    averages.male = Math.round((averages.male / counters.maleCounter) * 2) / 2;
    averages.female = Math.round((averages.female / counters.femaleCounter) * 2) / 2;
    averages.malePercent = (counters.maleCounter / jsonObj.length) * 100 + '%';
    averages.femalePercent = (counters.femaleCounter / jsonObj.length) * 100 + '%';

}

const calculatePopularItems = (popularObject, inputValue, text) => {

    const arr = [];
    const howMany = document.getElementById(inputValue).value;

    for (const item in popularObject) {
        arr.push([item, popularObject[item]]);
    }

    arr.sort()
    arr.sort((a, b) => b[1] - a[1]);
    document.getElementById(text).innerHTML = arr.map(element => element[0]).slice(0, howMany).join(', ');

}

const calculateBornUsers = (date1, date2, text) => {

    let beginningDate = document.getElementById(date1).value;
    let endingDate = document.getElementById(date2).value;

    beginningDate = new Date(beginningDate);
    endingDate = new Date(endingDate);

    const arr = [];

    const users = jsonObj.filter(element => {
        if (new Date(element.dob.date) < endingDate && new Date(element.dob.date) > beginningDate) return element;
    })

    users.forEach(element => {
        arr.push(`${element.name.title} ${element.name.first} ${element.name.last} (${new Date(element.dob.date).getFullYear()}-${new Date(element.dob.date).getMonth()}-${new Date(element.dob.date).getDate()})`);
    })

    document.getElementById(text).innerHTML = arr.join(', ');

}

const cleanNumber = num => {

    return num.split('').filter(element => element !== " " && !isNaN(Number(element))).join('');

}

const howStrongIsPassword = password => {

    if ((/[a-z]/.test(password))) strongPasswords[password]++;
    if ((/[A-Z]/.test(password))) strongPasswords[password] += 2;
    if ((/[0-9]/.test(password))) strongPasswords[password]++;
    if (password.length >= 8) strongPasswords[password] += 5;
    if ((/[!@#$%^&*(),.?":{}|<>]/.test(password))) strongPasswords[password] += 3;

}

const clearText = (text, inputValue1, inputValue2) => {

    document.getElementById(text).innerHTML = "";
    document.getElementById(inputValue1).value = "";
    if (inputValue2) document.getElementById(inputValue2).value = "";

}
//Enable JS strict mode
'use strict';

//Initialize express
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();

//Initialize body parser
const bodyParser = require('body-parser');
app.use(bodyParser.json()); //Tell express to use body parser

//Initialize JSON -> XML convertor
const xmlConverter = require('xml-js');

//Statistical functions

/**
 * Find percentage of users that are female
 * @param  {Array<Object>} users Array of user objects (https://randomuser.me/)
 * @return {Number}      Percentage of users that are female
 */
const femalePercentage = (users) => { 
  let numFemale = 0;

  for(let index in users) {
      if (users[index].gender == 'female') {
          numFemale++; //If user is female, increment number of females
      };
  };
  return ((numFemale / users.length) * 100).toFixed(1); //Return number of females out of total as a percent, rounded to 1 place
};

/**
 * Find percentage of users whose names begin with A through M
 * @param  {Array<Object>} users Array of user objects (https://randomuser.me/)
 * @param  {String} nameType Which name to consider, either 'first' or 'last'
 * @return {Object}  {amPercentage, numOther} Percentage of names A through M, number of names not A through Z
 */
const namePercentage = (users, nameType) => { //Find percentage of user names (first or last) that start between A-M
  const charCodeM = 109; //Character code for 'm' (https://tinyurl.com/ycw3xpkd)
  const charCodeA = 96;
  const charCodeZ = 122; 
  let numAM = 0; //Number of names between starting with a-m
  let numOther = 0; //Number of names not starting with a-z

  for(let user in users) {
    let nameLowered = users[user].name[nameType].toLowerCase(); //Ensure the name is lower case for char code to match
    if (nameLowered.charCodeAt(0) <= charCodeM) { //If the char code of the first letter of the name is "less than" (before, alphabetically) 'm' 
      numAM++;
    }
    else if ((nameLowered.charCodeAt(0) < charCodeA) || (nameLowered.charCodeAt(0) > charCodeZ)){ //Check if name begins with letter not between a-z (other alphabet)
      numOther++; 
    };
  };
  let numValidNames = users.length - numOther; //Do not consider names in other alphabets for percentage
  let amPercentage = (numAM / numValidNames * 100).toFixed(1); //Calculate number of a-m names out of total valid names as a percent, rounded to 1 place
  return {amPercentage, numOther};
};

/**
 * Find percentage of users in states
 * @param  {Array<Object>} users Array of user objects (https://randomuser.me/)
 * @param  {String} gender Which gender to consider, either 'male', 'female', or none
 * @return {String} sortedPops   String of locations with percentages, up to 10
 */
const statePercentage = (users, gender = null) => {
  let statePops = {}; //Object to organize relevant states and their populations
  let sortedPops = []; //Output array 
  let numValidUsers = 0; //Number of users considered for percentage
  const numStates = 10;
  
  for (let user in users) { //Populate state populations
    if (gender){ //Check if gender if specified
      if (gender == users[user].gender){ //Check gender match before increasing state population
        statePops[users[user].location.state] ? statePops[users[user].location.state]++ : statePops[users[user].location.state] = 1; //Check if state has population yet before incrementing
        numValidUsers++; //Increment number of people with gender
      };
    }
    else{ //Do not discriminate based on gender if none provided
      statePops[users[user].location.state] ? statePops[users[user].location.state]++ : statePops[users[user].location.state] = 1; //Check if state has population yet before incrementing
    };
  };
  for (let state in statePops) { //Convert object to array
    if (!gender) {
      numValidUsers = users.length; //Consider all users if no gender provided
    };
    let popPercentage = ((statePops[state] / numValidUsers) * 100).toFixed(1); //Convert population to percentage, with 1 decimal place
    sortedPops.push(' ' + String(state) + ': ' + popPercentage + '%');
  };
  sortedPops.sort((pop1,pop2) => { // Sort array based on population
    return pop1[1] - pop2[1];
  });

  if (sortedPops.length > numStates) { //Truncate array to 10 states
    sortedPops.length = numStates;
  };
  return sortedPops;
};

/**
 * Find percentage of users in defined age ranges
 * @param  {Array<Object>} users Array of user objects (https://randomuser.me/)
 * @return {String}      String of age ranges and number of people in the ranges
 */
const agePercentage = (users) => { 
    let ageCounts = {}; //Organize age ranges and number of people in range
    let countOutput = []; //Array for outputing range and count

    for (let user in users) {
      let age = users[user].dob.age; //Retrieve age from user

      if (age <= 20) {
        ageCounts['0-20'] ? ageCounts['0-20']++ : ageCounts['0-20'] = 1; //Check if age range is null before iterating
      }
      else if ((age > 20) && (age <= 40)) {
        ageCounts['21-40'] ? ageCounts['21-40']++ : ageCounts['21-40'] = 1;
      }
      else if ((age > 40) && (age <= 60)) {
        ageCounts['41-60'] ? ageCounts['41-60']++ : ageCounts['41-60'] = 1;
      }
      else if ((age > 60) && (age <= 80)) {
        ageCounts['61-80'] ? ageCounts['61-80']++ : ageCounts['61-80'] = 1;
      }
      else if ((age > 80) && (age <= 100)) {
        ageCounts['81-100'] ? ageCounts['81-100']++ : ageCounts['81-100'] = 1;
      }
      else if (age > 100) {
        ageCounts['100+'] ? ageCounts['100+']++ : ageCounts['100+'] = 1;
      };
    };
    for (let ageRange in ageCounts) { //Convert object to array
      let ageRangePercentage = (ageCounts[ageRange] / users.length * 100).toFixed(1); //Number of people in age range out of total as a percent to 1 decimal place
      countOutput.push(" " + String(ageRange) + ': ' + String(ageRangePercentage) + '%'); 
    };
  return countOutput;
};


//Post request that accepts user JSON data (https://randomuser.me/)
app.post('/users/statistics', (req, res) => {
  let users = req.body.results; //Store submitted user data

  let firstAm = namePercentage(users, 'first'); //First name AM function output object
  let lastAm = namePercentage(users, 'last'); //Last name AM function output object

  let jsonResponse = { 
    1: `Percentage female versus male: ${femalePercentage(users)}%.`,
    2: `Percentage of first names that start with A-M versus N-Z: ${firstAm.amPercentage}%, ${firstAm.numOther} others.`,
    3: `Percentage of last names that start with A-M versus N-Z: ${lastAm.amPercentage}%, ${lastAm.numOther} others.`,
    4: `Percentage of people in each state, up to the top 10 most populous states:${statePercentage(users)}`,
    5: `Percentage of females in each state, up to the top 10 most populous states:${statePercentage(users, 'female')}`,
    6: `Percentage of males in each state, up to the top 10 most populous states:${statePercentage(users, 'male')}`,
    7: `Percentage of people in the following age ranges:${agePercentage(users)}`
  };

  if (req.accepts('application/json')){ //Respond with JSON and successful status
    res.status(200).json(jsonResponse);
  }
  else if (req.accepts('text/plain')){ //Respond with plain text and successful status
    let outputString = "";
    
    for (let x = 1; x <= Object.keys(jsonResponse).length; x++) { //Loop through each value in JSON response
      outputString = outputString + jsonResponse[x] + '\n\n'; //Build multi-line string to mimic JSON response in plain text
    };

    res.status(200).send(outputString);
  }
  else if (req.accepts('application/xml')){ //Respond with XML and successful status
    const OPTIONS = {compact: true, ignoreComment: true, spaces: 4};
    res.status(200).send(xmlConverter.json2xml(jsonResponse, OPTIONS));
  }
  else { //If accept header is not given or does not fit one of the above categories, respond with "Not acceptable" 406 code
    res.status(406).send('Please modify accept header to "application/json", "text/plain", or "application/xml".');
  };
});

//Start NodeJS server
app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
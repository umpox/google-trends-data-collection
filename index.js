const googleTrends = require('./google-trends-api.min.js');
const fs = require('fs');

/* HEROKU EXPRESS IMPORTS */
var cool = require('cool-ascii-faces');
var express = require('express');
var pg = require('pg');
var app = express();

let completedSearches;

const categories = {
  ArtsEntertainment: 3,
  AutosVehicles: 47,
  BeautyFitness: 44,
  BooksLiterature: 22,
  BusinessIndustrial: 12,
  ComputersElectronics: 5,
  Finance: 7,
  FoodDrink: 71,
  Games: 8,
  Health: 45,
  HobbiesLeisure: 65,
  HomeGarden: 11,
  InternetTelecom: 13,
  JobsEducation: 958,
  LawGovernment: 19,
  News: 16,
  OnlineCommunities: 299,
  PeopleSociety: 14,
  PetsAnimals: 66,
  RealEstate: 29,
  Reference: 533,
  Science: 174,
  Shopping: 18,
  Sports: 20,
  Travel: 67
};

function daysAgo(days) {
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - days);
  const dateMsg = previousDate.getFullYear() + '-' + (previousDate.getMonth()+1) + '-' + previousDate.getDate();
  return dateMsg;
};

function removeDuplicates(data, compareObj) {  
  for (key in compareObj) {    
    let duplicateIndex = data.findIndex(
      (data) => findDuplicateIndex(data, compareObj[key].query)
    );

    if (duplicateIndex > -1) {
      data.splice(duplicateIndex, 1);
    }
  }
}

function findDuplicateIndex(data, value) {
  return data.query === value;
}

function sortByRising(data) {
  //Sort by the % change value for rising trends
  return data.sort((obj1, obj2) => obj2.change - obj1.change);
}

function getStoredData(day) {
  let oldSearches = fs.readFileSync(`data/${daysAgo(day)}.json`,'utf8');
  oldSearches = JSON.parse(oldSearches);
  return oldSearches;
}

async function getTrends(
  keyword = ' ',
  category = 0
) {
  let queryRes;
  try {
    //Call Google Trends API
    queryRes = await googleTrends.relatedQueries({
      keyword: keyword,
      startTime: new Date(daysAgo(2)),
      geo: 'GB',
      category: category
    });

    //Parse in JSON to use as object
    queryRes = JSON.parse(queryRes);
  } catch (e) {
    console.log('Error:' + e);
  } finally {
    return queryRes;
  }
}

async function main() {
  let overallData = [];
  let data = {};

  for (cat in categories) {
    console.log(`trying to get data for ${cat}`);

    //Query Google API for data
    data = await getTrends(' ', categories[cat]);
    
    //Focus data on only rising searches
    data = data.default.rankedList[1].rankedKeyword      

    //Loop through data and add it to the overallData object
    Object.entries(data).forEach(([key, value], index) => {
      let query = value.query;
      let change = value.value;
      let formattedChange = value.formattedValue;

      overallData.push({
        query,
        change,
        formattedChange,
        category: cat
      });
    });

    //Reset data
    data = {};
  }

  return overallData;
}

(async code => {
  // Get previous dates data
  let oldSearches = [];
  try {
    oldSearches = getStoredData(3);
  } catch (e) {
    console.log('Previous data not found');
  }

  
  //Get todays data
  risingSearches = await main();
  risingSearches = sortByRising(risingSearches);

  if (oldSearches[0]) {
    // Remove duplicates between previous date and today
    removeDuplicates(risingSearches, oldSearches);
  }
  
  if (risingSearches[0]) {
    fs.writeFile(`data/${daysAgo(2)}.json`, JSON.stringify(risingSearches), 'utf8',  () => {  
      // success case, the file was saved
      console.log('Data saved!');

      //Save the data to be displayed on webpage
      completedSearches = JSON.stringify(risingSearches);
    });
  } else {
    console.log('No data available yet')
  }
})();

/* 
  TODO: Think about following scenario:
  Yesterday data has a change of +100
  Todays data has a change of +500
  it will be removed because it's a duplicate, should I model the increase in change?
  Perhaps over a certain %?
*/

app.set('port', (process.env.PORT || 5000));

app.get('/data', function(request, response) {
  if (completedSearches === undefined) {
    completedSearches = 'No data available yet...';
  }
  response.send(`<h1>Data from: ${new Date()} :</h1>
  ${completedSearches}`);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

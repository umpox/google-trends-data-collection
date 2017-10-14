const googleTrends = require('./google-trends-api.min.js');
const fs = require('fs');

const categories = {
  ArtsEntertainment: 3,
  // AutosVehicles: 47,
  // BeautyFitness: 44,
  // BooksLiterature: 22,
  // BusinessIndustrial: 12,
  // ComputersElectronics: 5,
  // Finance: 7,
  // FoodDrink: 71,
  // Games: 8,
  // Health: 45,
  // HobbiesLeisure: 65,
  // HomeGarden: 11,
  // InternetTelecom: 13,
  // JobsEducation: 958,
  // LawGovernment: 19,
  // News: 16,
  // OnlineCommunities: 299,
  // PeopleSociety: 14,
  // PetsAnimals: 66,
  // RealEstate: 29,
  // Reference: 533,
  // Science: 174,
  // Shopping: 18,
  // Sports: 20,
  // Travel: 67
};

function daysAgo(days) {
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - days);
  const dateMsg = previousDate.getFullYear() + '-' + (previousDate.getMonth()+1) + '-' + previousDate.getDate();
  return new Date(dateMsg);
};

function findQuery(data, type, value) {
  return data[type] === value;
}

function removeDuplicates(data, compareObj) {
  for (key in compareObj) {
    //Search original object for duplicates
    let duplicateFound = findDuplicate(data, compareObj[key].query)

    if (duplicateFound[0]) {
      delete data[duplicateFound[0].key];
    }
  }
}

function findDuplicate(data, value) {
  //Find duplicate in other object
  return data.filter(data => (data.query === value));  
}

function sortByRising(data) {
  //Sort by the % change value for rising trends
  return data.sort((obj1, obj2) => obj2.change - obj1.change);
}

async function getTrends(
  keyword = ' ',
  days = 7,
  category = 0
) {
  let queryRes;
  try {
    //Call Google Trends API
    queryRes = await googleTrends.relatedQueries({
      keyword: keyword,
      startTime: daysAgo(days),
      geo: 'GB',
      category: category
    })

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
    data = await getTrends(' ', 2, categories[cat]);
    
    //Focus data on only rising searches
    data = data.default.rankedList[1].rankedKeyword      

    //Loop through data and add it to the overallData object
    Object.entries(data).forEach(([key, value], index) => {
      let query = value.query;
      let change = value.value;
      let formattedChange = value.formattedValue;
      index = Object.keys(overallData).length + index;

      overallData.push({
        index,
        query,
        change,
        formattedChange
      });
    });

    //Reset data
    data = {};
  }

  return overallData;
}

(async code => {
  //Get previous dates data
  let oldSearches = [];
  oldSearches = fs.readFileSync('data.json','utf8');

  //Get todays data
  risingSearches = await main();
  risingSearches = sortByRising(risingSearches);

  //Remove duplicates between previous date and today
  removeDuplicates(risingSearches, oldSearches);


  fs.writeFile('data.json', JSON.stringify(risingSearches), () => {  
    // success case, the file was saved
    console.log('Data saved!');
  });
})();

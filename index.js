const googleTrends = require('./google-trends-api.min.js');

function daysAgo(days) {
  const previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - days);
  const dateMsg = previousDate.getFullYear() + '-' + (previousDate.getMonth()+1) + '-' + previousDate.getDate();
  return new Date(dateMsg);
};

function sortByRising(data) {
  data = Object.keys(data).sort(function(a,b){return data[a]-data[b]})
  return data;
}

async function getTrends(
  keyword = ' ',
  days = 7,
  category = 0
) {
  let queryRes;
  try {
    queryRes = await googleTrends.relatedQueries({
      keyword: keyword,
      startTime: daysAgo(days),
      geo: 'GB',
      category: category
    })
    queryRes = JSON.parse(queryRes);
  } catch (e) {
    console.log('Error:' + e);
  } finally {
    return queryRes;
  }
}

async function main() {
  let data1 = await getTrends(' ', 3, 3);
  let data2 = await getTrends(' ', 3, 44)

  const data = Object.assign(data1, data2);

  console.log(data.default.rankedList[1].rankedKeyword);
}
main();

// data = sortByRising(data);
// console.log(data);
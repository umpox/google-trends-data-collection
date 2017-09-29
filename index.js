const googleTrends = require('./google-trends-api.min.js');

const aWeekAgo = new Date();
aWeekAgo.setDate(aWeekAgo.getDate() - 5);
const dateMsg = aWeekAgo.getFullYear() + '-' + (aWeekAgo.getMonth()+1) + '-' + aWeekAgo.getDate();

googleTrends.relatedQueries({
  keyword: ' ',
  startTime: new Date(dateMsg),
  category: 0
})
.then((res) => {
  const data = JSON.parse(res);
  console.log(data.default.rankedList[1].rankedKeyword);
})
.catch((err) => {
  console.log(err);
});

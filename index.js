const googleTrends = require('./google-trends-api.min.js');


/* ******************* Related queries **************************/

// googleTrends.relatedQueries({keyword: 'Westminster Dog Show'})
// .then((res) => {
//   console.log(res);
// })
// .catch((err) => {
//   console.log(err);
// })


const aWeekAgo = new Date();
aWeekAgo.setDate(aWeekAgo.getDate() - 4);
const dateMsg = aWeekAgo.getFullYear() + '-' + (aWeekAgo.getMonth()+1) + '-' + aWeekAgo.getDate();

googleTrends.relatedQueries({
  keyword: ' ',
  startTime: new Date(dateMsg),
  geo: 'GB'
})
.then((res) => {
  const data = JSON.parse(res);
  console.log(data.default.rankedList[1].rankedKeyword);
})
.catch((err) => {
  console.log(err);
});

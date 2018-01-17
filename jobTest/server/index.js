var express = require('express');
var app = express();

app.get('/points', function (req, res) {
  console.log('points requested.')
  let points = [
    {
      id: 1,
      name: 'Patronato 344, Recoleta',
      coords: [{
        latitude: -33.4309899,
        longitude: -70.6368761,
      }]
    }, {
      id: 2,
      name: 'Santa María 0410, Providencia',
      coords: [{
        latitude: -33.4341774,
        longitude: -70.6312327,
      }]
    }, {
      id: 3,
      name: 'Francisco Bilbao 6920, Las Condes',
      coords: [{
        latitude: -33.4306589,
        longitude: -70.5592112,
      }]
    }
  ]

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ points }));
});

let server = app.listen(5050, () => {
  console.log(`listening on port ${server.address().port}`)
});
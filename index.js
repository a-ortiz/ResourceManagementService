import axios from 'axios';
import $ from 'jquery';

class Package {
  constructor({ size }) {
    this.size = size;
  }
}

class GeoPoint {
  constructor({ latitude, longitude }) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

class Place {
  constructor({ geoPoint, address }) {
    this.geoPoint = geoPoint;
    this.address = address;
  }
}

class Target {
  constructor({ place, date }) {
    this.place = place;
    this.date = date;
  }
}

class Task {
  constructor({ id, pickup, delivery, _package }) {
    this.id = id;
    this.pickup = pickup;
    this.delivery = delivery;
    this._package = _package
  }
}

class Step {
  constructor({ type, task }) {
    this.type = type;
    this.task = task;
  }
}

class Route {
  constructor({ steps }) {
    this.steps = steps;
  }
}

var id = 0;

function createTask({ pickup, delivery }) {
  const task = new Task({
    id: `t${id++}`,
    pickup: new Target({
      place: new Place({
        geoPoint: {
          latitude: pickup.geoPoint.latitude,
          longitude: pickup.geoPoint.longitude,
        }
      }),
      date: pickup.date
    }),
    delivery: new Target({
      place: new Place({
        geoPoint: {
          latitude: delivery.geoPoint.latitude,
          longitude: delivery.geoPoint.longitude,
        }
      }),
      date: delivery.date
    }),
    _package: new Package({
      size: 3
    })
  });
  return task;
}
window.createTask = createTask;

function generateRoutesFromTasks(tasks, cb) {
  console.log('i1')
  const initTask = tasks[0];
  var services = tasks.map(t => ({
    id: t.id,
    size_index: '0',
    size_value: String(t._package.size),
    coord: {
      lat: t.delivery.place.geoPoint.latitude,
      lng: t.delivery.place.geoPoint.longitude
    }
  }));
  console.log('i2')
  services.unshift({
    id: 'pickup',
    size_index: '0',
    size_value: String(initTask._package.size),
    coord: {
      lat: initTask.pickup.place.geoPoint.latitude,
      lng: initTask.pickup.place.geoPoint.longitude
    }
  });
  console.log('i3')
  const data = {
    problem_type: {
      fleet_size: 'INFINITE',
      fleet_composition: 'HOMOGENEOUS',
      fleet_size_simulate: 10,
      fleet_types_vehicles: ['Car'],
      fleet_capacities_simulate: [10000],
      fleet_cost_by_meter: [2.5]
    },
    services
  };
  console.log(data);
  $.ajax({
		type: 'POST',
		url: 'http://routing.shippify.co/optimization',
		data: JSON.stringify(data),
		dataType: 'json',
		success: function (response) {
      console.log('response');
      console.log(response);
      if (response.code !== 0) {
        cb(new Error(response.message));
        return;
      }
      const taskInfo = tasks.reduce((info, t) => Object.assign({}, info, { [t.id]: t }), {});
      const routes = response.result.routes.map(r => new Route({
        steps: r.steps.map(s => new Step({
          type: s.activity === 'pickupShipment' ? 'pickup' : s.activity === 'deliverShipment' ? 'delivery' : null,
          task: taskInfo[s.task_id] || taskInfo['t0']
        }))
      }))
      cb(null, routes);
		},
		error: function (xhr, ajaxOptions, thrownError){
      console.log('error');
      cb(new Error());
		}
	});

  // return axios.post('http://routing.shippify.co/optimization', {
  //   "problem_type":{
  //     "fleet_size":"INFINITE",
  //     "fleet_composition":"HOMOGENEOUS",
  //     "fleet_size_simulate":100,
  //     "fleet_types_vehicles":["Car"],
  //     "fleet_capacities_simulate":[3],
  //     "fleet_cost_by_meter":[2.5]
  //   },
  //   "services":[
  //     {
  //       "id":1,
  //       "size_index":"0",
  //       "size_value":"2",
  //       "coord":{"lat":-2.208477358326721,"lng":-79.94038581848145}
  //     },
  //     {
  //       "id":2,
  //       "size_index":"0",
  //       "size_value":"2",
  //       "coord":{"lat":-2.2045320740518086,"lng":-79.93051528930664}
  //     },
  //     {
  //       "id":3,
  //       "size_index":"0",
  //       "size_value":"2",
  //       "coord":{"lat":-2.213537598905895,"lng":-79.93300437927246}
  //     },
  //     {
  //       "id":4,
  //       "size_index":"0",
  //       "size_value":"2",
  //       "coord":{"lat":-2.218168990398288,"lng":-79.91334915161133}
  //     },
  //     {
  //       "id":5,
  //       "size_index":"0",
  //       "size_value":"2",
  //       "coord":{"lat":-2.2059043480301757,"lng":-79.9094009399414}
  //     }
  //   ]
  // })
  // .then(response => {
  //   console.log(data);
  //   console.log(response.data);
  //   if (response.data.code !== 0) {
  //     throw new Error(response.data.message);
  //   }
  //   const taskInfo = tasks.reduce((info, t) => Object.assign({}, info, { [t.id]: t }), {});
  //   return response.data.result.routes.map(r => new Route({
  //     steps: r.steps.map(s => new Step({
  //       type: s.activity === 'pickupShipment' ? 'pickup' : s.activity === 'deliverShipment' ? 'delivery' : null,
  //       task: taskInfo[s.task_id]
  //     }))
  //   }))
  // });
}
window.generateRoutesFromTasks = generateRoutesFromTasks;

// (async () => {
//   try {
//     const routes = await generateRoutesFromTasks([task1]);
//     console.log(routes);
//   } catch (error) {
//     console.log(error);
//   }
// })();

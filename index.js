// ***********************************************   Package Imports   ************************************************
const phidget22 = require('phidget22');
const fs = require('fs');

// ***********************************************   Phidget I/O Variables   *******************************************
let phidgetControlSystem = {
  aLED:'', // 0 blue
  bLED:'', // 1 red
  accelerometer:'',
  isActive:false
};
// ***********************************************   Program Variables   *******************************************
let accerationResults = [];


// ***********************************************   Phidget Board Initialization ************************************
console.log('Phidget connecting');
var SERVER_PORT = 5661;
var hostName = '127.0.0.1';
var conn = new phidget22.Connection(SERVER_PORT, hostName, { name: 'Server Connection', passwd: '' });
conn.connect(phidgetControlSystem)
  .then(initializePhidgetBoards(phidgetControlSystem))
  .catch(function (err) {
    console.error('Error connecting to phidget:', err.message);
    process.exit(1);
  });

async function initializePhidgetBoards( phidgetControlSystem) {
  let aLED = new phidget22.DigitalOutput();
  aLED.setHubPort(5);
  aLED.setChannel(0);
  await aLED.open();
  phidgetControlSystem.aLED = aLED;
  console.log('first LED attached');

  let bLED = new phidget22.DigitalOutput();
  bLED.setHubPort(5);
  bLED.setChannel(1);
  await bLED.open();
  phidgetControlSystem.bLED = bLED;
  console.log('second LED attached');

  var accelerometer = new phidget22.Accelerometer();
  accelerometer.setHubPort(3);
//   accelerometer.setChannel(0);
//   accelerometer.setDataInterval(500);
  await accelerometer.open();
  phidgetControlSystem.accelerometer = accelerometer;
  console.log('accelerometer attached');
  
  console.log(`Fractional still control system established`);
  turnOnLEDs(2);
  monitorMotion();
  return true;
}

function turnOffAllLEDs() {
    console.log(`turning off`);
    phidgetControlSystem.aLED.setState(false);
    phidgetControlSystem.bLED.setState(false);
}

function turnOnLEDs(numberOfLEDs) {
    switch (numberOfLEDs) {
        case 0:
            turnOffAllLEDs();
            break;
        case 1:
            phidgetControlSystem.aLED.setState(true);
            phidgetControlSystem.bLED.setState(false);
            break;
        case 2:
            phidgetControlSystem.aLED.setState(true);
            phidgetControlSystem.bLED.setState(true);
            break;
        default:
            turnOffAllLEDs();
    }
}

function runWandProgram() {
	phidgetControlSystem.accelerometer.onAccelerationChange = function (acc, timestamp) {
        let gacc = this.getAcceleration();
        let currentAcceleration = gacc[0]+gacc[1]+gacc[2];
        console.log(currentAcceleration);
	};
}

function monitorMotion() {
    phidgetControlSystem.accelerometer.onAccelerationChange = function() {
        let currentAcceleration = this.getAcceleration();
        let dataPoint = {
            timestamp:Date.now()/1000,
            x:currentAcceleration[0],
            y:currentAcceleration[1],
            z:currentAcceleration[2]
        }
        accerationResults.push(dataPoint);
    }

    setInterval(() => {
        fs.appendFile(`./results/${Date.now()/1000}.txt`, JSON.stringify(accerationResults), (err) => {console.log(err)});
        accerationResults = [];
    },15000)
}

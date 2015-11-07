var mqtt = require('mqtt');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');

//Broker MQTT de Hernan
var PORT = 10000;
var HOST = 'dev.e-mozart.com';
var server = {port:PORT, host:HOST};
var client = mqtt.connect(server);

var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

//Nos conectamos al modulo Xbee mediante el puerto serial
var serialport = new SerialPort("/dev/ttyAMA0", {
    baudrate: 9600,
    parser: xbeeAPI.rawParser()
});

  serialport.on('data', function (data) {
      console.log('data received: ' + data);
  });

  // All frames parsed by the XBee will be emitted here
  xbeeAPI.on("frame_object", function (frame) {

  console.log("FULL FRAME:", frame);

  //Vamos a ver que tipo de datos vienen en el buffer
  try {
    dataTypeBuffer = new Buffer(frame.data.slice(0,2));
    dataType = xBuffer.readInt16BE(0);

    switch (dataType) {
      case 100: //Es del tipo parking
        xBuffer = new Buffer(frame.data.slice(0,2));
        x = xBuffer.readInt16BE(0);
        yBuffer = new Buffer(frame.data.slice(4,6));
        y = yBuffer.readInt16BE(0);
        zBuffer = new Buffer(frame.data.slice(2,4));
        z = zBuffer.readInt16BE(0);
        tempBuffer = new Buffer(frame.data.slice(6,7));
        temperatureRaw = tempBuffer.readUInt8(0)

        console.log('Parking');
        console.log('x:' + x);
        console.log('y:' + y);
        console.log('z:' + z);
        console.log('temp:' + temperatureRaw);

        //Creamos el objeto JSON
        var parkingJSON =
        { "device" :
           {
             "zigbeeId" : frame.remote64,
             "deviceType" : "Parking",
             "measures" :
             {
               "magnetic" :
               {
                 "x" : x,
                 "y" : y,
                 "z" : z
               },
               "temperatureRaw" : temperatureRaw
             }
           }
         };

         //Enviamos el frame JSON al Broker MQTT
         client.publish('technetium/test/parking', JSON.stringify(parkingJSON));
      break;
    }

  } catch(e) {
    console.log("NO DATA");
  }






  });

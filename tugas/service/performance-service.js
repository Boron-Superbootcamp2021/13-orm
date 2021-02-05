/* eslint-disable no-unused-vars */
const nats = require('nats');

const client = nats.connect();

client.on('connect', () => {
  main();
});

client.on('close', (err) => {
  if (err) {
    console.error(err);
  }
  console.log('connection close');
});

function subscriber() {
  let subId1, subId2, subId3;
  subId1 = client.subscribe('log', (msg, reply, subject, sid) => {
    console.log('sub-1: ', msg);
    if (msg === 'unsub') {
      if (subId1) {
        client.unsubscribe(subId1);
        console.log('sub-1: unsubscribed');
      }
    }
  });
//   subId2 = client.subscribe(
//     'command',
//     { queue: 'worker' },
//     (msg, reply, subject, sid) => {
//       console.log('sub-2: ', msg);
//       if (msg === 'close') {
//         console.log('sub-2: close');
//         client.close();
//       }
//       if (msg === 'hi') {
//         setTimeout(() => {
//           client.publish(reply, 'hi juga');
//         }, 500);
//       }
//     }
//   );
//   subId3 = client.subscribe(
//     'command',
//     { queue: 'worker' },
//     (msg, reply, subject, sid) => {
//       console.log('sub-3: ', msg);
//       if (msg === 'close') {
//         console.log('sub-3: close');
//         client.close();
//       }
//       if (msg === 'hi') {
//         setTimeout(() => {
//           client.publish(reply, 'hi juga');
//         }, 500);
//       }
//     }
//   );
}

// function streamer() {
//   let i = 0;
//   let interval;

//   function sendCommand() {
//     if (i === 5) {
//       client.publish('command', 'unsub');
//     }
//     if (i === 7) {
//       client.publish('command', 'close');
//       clearInterval(interval);
//     }
//     if (i === 3) {
//       client.request('command', 'hi', { max: 1, timeout: 1000 }, (msg) => {
//         if (msg instanceof nats.NatsError && msg.code === nats.REQ_TIMEOUT) {
//           console.log('request timed out');
//         } else {
//           console.log('got reply -> ', msg);
//         }
//       });
//     }
//     client.publish('command', JSON.stringify({ data: i }));
//     i++;
//   }

//   interval = setInterval(sendCommand, 1000);
// }

function loggingMsg(from, status){
    let date = new Date()
    let msg = `${date} from ${from} status ${status}`
    client.publish('log', msg)
}

function main() {
  subscriber();
}

module.exports = {
    loggingMsg,
}
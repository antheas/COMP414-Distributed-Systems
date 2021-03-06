const client = require("./connect");
const zookeeper = require("node-zookeeper-client");
const os = require('os');

const getChildrenPromise = (...args) => {
  return new Promise((resolve, reject) => {
    client.getChildren(...args, (error, children, stat) => {
      error ? reject(error) : resolve(children);
    });
  });
};

const nodeDeletePromise = (...args) => {
  return new Promise((resolve, reject) => {
    client.remove(...args, (error) => {
      error ? reject(error) : resolve(true);
    });
  });
};

const getValuePromise = (...args) => {
  return new Promise((resolve, reject) => {
    client.getData(...args, (error, value, stat) => {
      error ? reject(error) : resolve(value);
    });
  });
};

const nodeExistsPromise = (...args) => {
  return new Promise((resolve, reject) => {
    client.exists(...args, (error, stat) => {
      error ? reject(error) : resolve(stat);
    });
  });
};

const nodeCreatePromise = (...args) => {
  return new Promise((resolve, reject) => {
    client.create(...args, (error, path) => {
      error ? reject(error) : resolve(path);
    });
  });
};

async function nodeExists(node) {
  try {
    return await nodeExistsPromise(node);
  } catch (e) {
    console.log(e);
    return false;
  }
}

function getLastIpSegment() {

  let networkInterfaces = os.networkInterfaces( );

  if(networkInterfaces) {
    //networkInterfaces.filter((x :any) => x)
    let prefix = process.env.PLAY_SUBNET_PREFIX;//'192.170.0.';
    var play_ips = Object.keys(networkInterfaces).map((key) => {
      return networkInterfaces[key][0].address;
    })
    .filter(x => {
      return x.indexOf(prefix) !== -1;
    });
    if(play_ips && play_ips.length > 0) {
      let play_ip = play_ips[0];
      let matches = /\.([0-9]+)$/.exec(play_ip);
      if(matches && matches.length == 2) return matches[1];
      else return false;
    } else return false;
  } else return false;
}

function getNameForZookeeper() {
  let segment = getLastIpSegment()
  if(segment !== false) return 'g'+segment;
  throw new Error('Cannot determine last IP segment');
}

async function changeLoadBalancingCounter(id, offset) {
  try {
    if (!id) return false;
    if (!(await nodeExists("/load_balance"))) {
      console.log("Creating load balance node");
      try {
        await nodeCreatePromise(
          "/load_balance",
          null,
          zookeeper.CreateMode.PERSISTENT
        );
      } catch(e) {

      }
    }
    console.log('Offset is: ',offset);
    let children = await getChildrenPromise("/load_balance");
    children = children.map((x) => x.split("_"));
    children = children.map((x) => [x[0], parseInt(x[1])]);

    let current_server = children.filter((x) => x[0] == id);

    if (
      current_server &&
      current_server instanceof Array &&
      current_server.length > 0
    ) {
      current_server = current_server[0];

      let node_path =
        "/load_balance/" + current_server[0] + "_" + current_server[1];
      current_server[1] = offset;
      await nodeDeletePromise(node_path, -1);
    } else {
      current_server = [id, offset];
    }
    let new_node_path =
      "/load_balance/" +
      current_server[0] +
      "_" +
      String(Math.max(current_server[1], 0));
    return await nodeCreatePromise(
      new_node_path,
      null,
      zookeeper.CreateMode.EPHEMERAL
    );
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * @returns For an ip of 192.168.1.123 returns 'g123'
 */
function getNameFromIp(ip) {
  return ip.replace(/^([0-9]+\.){3}/, "g");
}

/**
 * Register the server to the zookeeper using
 * an ephemeral node under /playmasters and an
 * ephemeral node under /load_balancing
 */
async function registerToZookeeper() {
  try {
    let node = "/playmasters/id";
    // FIXME: Hardcoding server name...
    let value = getNameForZookeeper();

    if (!(await nodeExists("/playmasters"))) {
      console.log("Creating playmasters node");
      try {
        await nodeCreatePromise(
          "/playmasters",
          null,
          zookeeper.CreateMode.PERSISTENT
        );
      } catch{
        
      }

    }

    let node_name = await nodeCreatePromise(
      node,
      Buffer.from(value),
      zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL
    );
    let id = node_name.split("/")[2];
    await changeLoadBalancingCounter(id, 0);

    return id;
  } catch (e) {
    console.log(e);
    return false;
  }
}

// async function validateServerClaim(server_id: string,server_ip: any) {
//   try {
//     let node = '/playmasters/'+server_id;

//     return (await getValuePromise(node)).toString('utf8') == server_ip;
//   } catch(e) {
//     console.log(e);
//     return false;
//   }
// }

// async function isServerAvailable(server_id: string) {
//   try {
//     return await nodeExistsPromise('/playmasters/'+server_id);
//   } catch(e) {
//     console.log(e);
//     return false;
//   }
// }

// async function getBestServer() {
//   var children;
//   var best_server_id;
//   var server_ip = "";

//   var counter = 0;

//   while(!server_ip && counter++ < globals.MAX_ZOOKEEPER_REATTEMPTS) {
//     try {

//       children = await getChildrenPromise('/load_balance');

//       if(children.length <= 0 ) throw "Cannot list servers";

//       children = children.map((x: string) => x.split('_'));
//       children = children.map((x: string[]) => [x[0],parseInt(x[1])]);

//       var best_server = children.reduce(function(prev: number[], curr: number[]) {
//         return prev[1] < curr[1] ? prev : curr;
//       });

//       best_server_id = best_server[0];

//     } catch (e) {
//         console.log(e);
//         continue;
//     }

//     try {
//       server_ip = (await getValuePromise('/playmasters/'+best_server_id)).toString('utf8');
//     } catch (e) {
//         console.log(e);
//         continue;
//     }

//   }

//   if(!server_ip) return false;

//   return {id:best_server_id, ip:server_ip};
// }

module.exports = {
  changeLoadBalancingCounter: changeLoadBalancingCounter,
  registerToZookeeper: registerToZookeeper,
  getNameForZookeeper: getNameForZookeeper
};
// module.exports = {
//     client: client,
//     getChildren: getChildrenPromise,
//     getValue: getValuePromise,
//     getBestServer: getBestServer,
//     isServerAvailable: isServerAvailable,
//     registerToZookeeper: registerToZookeeper,
//     validateServerClaim: validateServerClaim
// };

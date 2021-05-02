const Libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const { NOISE } = require("libp2p-noise");
const MPLEX = require("libp2p-mplex");

const { Multiaddr } = require("multiaddr");
const process = require("process");

async function main() {
  const node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
    },
  });

  await node.start();
  console.log("libp2p has started");

  console.log("listening on addresses: ");
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`);
  });

  if (process.argv.length >= 3) {
    const ma = new Multiaddr(process.argv[2]);
    console.log(`pinging remote peer at ${process.argv[2]}`);

    const latency = await node.ping(ma);
    console.log(`pinged ${process.argv[2]} in ${latency}ms`);
  } else {
    console.log("no remote peer address given, skipping ping");
  }

  async function stop() {
    await node.stop();
    console.log("libp2p has stopped");
    process.exit;
  }

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

main();

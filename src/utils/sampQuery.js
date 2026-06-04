const SampQuery = require('samp-query');

function queryServer(ip, port) {
  return new Promise((resolve, reject) => {
    SampQuery({ host: ip, port: port }, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

async function getServerInfo() {
  const ip = process.env.SAMP_IP;
  const port = parseInt(process.env.SAMP_PORT);
  const data = await queryServer(ip, port);
  return {
    online: true,
    hostname: data.hostname,
    gamemode: data.gamemode,
    mapname: data.mapname,
    passworded: data.password,
    players: data.online,
    maxplayers: data.maxplayers,
    playerList: data.players || [],
    rules: data.rules || {},
  };
}

function formatServerStatus(info) {
  const status = info.online ? '🟢 Online' : '🔴 Offline';
  return {
    status,
    hostname: info.hostname || 'N/A',
    gamemode: info.gamemode || 'N/A',
    mapname: info.mapname || 'N/A',
    players: `${info.players}/${info.maxplayers}`,
    password: info.passworded ? 'Sim' : 'Não',
  };
}

module.exports = { getServerInfo, formatServerStatus };

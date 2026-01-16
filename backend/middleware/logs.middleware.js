const logsStore = [];

const logs = (req, res, next) => {
  const log = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  };

  logsStore.push(log);

  // limit memory (keep last 200 logs)
  if (logsStore.length > 600) logsStore.shift();

  console.log(`[${log.time}] ${log.method} ${log.url}`);
  next();
};

module.exports = { logs, logsStore };

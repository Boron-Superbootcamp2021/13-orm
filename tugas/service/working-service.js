const Busboy = require('busboy');
const url = require('url');
const { Writable } = require('stream');
const {
  register,
  list,
  findWorker,
  del,
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
} = require('./working-logic');
const { upload } = require('../database/typeorm/storage');
const { loggingMsg } = require('./performance-service')

function storeWorkerService(req, res) {
  const busboy = new Busboy({ headers: req.headers });
  res.setHeader('content-type', 'application/json');
  const data = {
    name: '',
    email: '',
    biografi: '',
    address: '',
    nohp: '',
    photo: '',
  };

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      loggingMsg('Failed Store Data', res.statusCode);
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        upload(data, fieldname, file, mimetype, abort);
    }
  });

  busboy.on('field', (fieldname, val) => {
    if (['name', 'email', 'biografi', 'nohp', 'address'].includes(fieldname)) {
      data[fieldname] = val;
    }
  });

  busboy.on('finish', async () => {
    try {
      const worker = await register(data);
      await res.write(JSON.stringify(worker));
      loggingMsg('Succes Store Data', res.statusCode);
    } catch (err) {
      if (err === ERROR_REGISTER_DATA_INVALID) {
        res.statusCode = 401;
        loggingMsg(ERROR_REGISTER_DATA_INVALID, res.statusCode);
      } else {
        res.statusCode = 500;
        loggingMsg('Failed store Data', res.statusCode);
      }
      res.write(err);
    }
    await res.end();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

/**
 * service to get list of workers
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
async function getWorkerService(req, res) {
  try {
    const workers = await list();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    loggingMsg('GetWorkerService', res.statusCode);
    res.end();
  } catch (err) {
    res.statusCode = 500;
    loggingMsg('ERROR_WORKER_NOT_FOUND', res.statusCode);
    res.end();
    return;
  }
}

/**
 * service to remove a worker by it's id
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
async function getWorkerByIdService(req, res) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    loggingMsg('Fail Get Worker ID salah', res.statusCode);
    res.end();
    return;
  }
  try {
    const worker = await findWorker(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    loggingMsg('Succes Get Worker ID', res.statusCode);
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      loggingMsg('Get Worker tidak ditemukan', res.statusCode);
      res.end();
      return;
    }
    res.statusCode = 500;
    loggingMsg('Get Worker Gagal', res.statusCode);
    res.end();
    return;
  }
}

async function deleteWorkerService(req, res) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    loggingMsg('Fail Delete Worker ID salah', res.statusCode);
    res.end();
    return;
  }
  try {
    await del(id);
    res.statusCode = 200;
    res.write(`berhasil dihapus`);
    loggingMsg('Succes Delete Worker ID', res.statusCode);
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      loggingMsg('Delete Worker tidak ditemukan', res.statusCode);
      res.end();
      return;
    }
    res.statusCode = 500;
    loggingMsg('Delete Worker Gagal', res.statusCode);
    res.end();
    return;
  }
}

module.exports = {
  storeWorkerService,
  getWorkerService,
  getWorkerByIdService,
  deleteWorkerService
};

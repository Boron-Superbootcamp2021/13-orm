const Busboy = require('busboy');
const url = require('url');
const { register, taskSelesai, taskBatal, ERROR_REGISTER_DATA_INVALID, list } = require('./task-logic');
const { upload } = require('../database/typeorm/storage');
const { loggingMsg } = require('./performance-service')

function storeTaskService(req, res) {
  const busboy = new Busboy({ headers: req.headers });
  res.setHeader('content-type', 'application/json');
  const data = {
    job: '',
    detail: '',
    attach: '',
    assignee: '',
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
      case 'attach':
        upload(data, fieldname, file, mimetype, abort);
    }
  });

  busboy.on('field', (fieldname, val) => {
    if (['job', 'detail', 'attach', 'assignee'].includes(fieldname)) {
      data[fieldname] = val;
    }
  });

  busboy.on('finish', async () => {
    try {
      const task = await register(data);
      await res.write(JSON.stringify(task));
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

async function upTaskService(req, res) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    loggingMsg('Fail Update Task ID salah', res.statusCode);
    res.end();
    return;
  }
  try {
    await taskSelesai(id);
    res.statusCode = 200;
    res.write(`Update ID dengan ${id}`);
    loggingMsg('Succes Update Task', res.statusCode);
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      loggingMsg('Fail Update task Task', res.statusCode);
      res.end();
      return;
    }
    res.statusCode = 500;
    loggingMsg('Fail Update Task', res.statusCode);
    res.end();
    return;
  }
}

async function softDeleteTaskService(req, res) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    await taskBatal(id);
    res.statusCode = 200;
    res.write(`batalkan task dengan ${id}`);
    loggingMsg('Succes Batalkan Task', res.statusCode);
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      loggingMsg('Worker tidak tidemukan pada Task', res.statusCode);
      res.end();
      return;
    }
    res.statusCode = 500;
    loggingMsg('Fail Batalkan Task', res.statusCode);
    res.end();
    return;
  }
}


async function getTaskService(req, res) {
  const value = await list();
  res.setHeader('Content-Type', 'application/json');
  const data = JSON.stringify(value);
  res.statusCode = 200;
  res.write(data);
  loggingMsg('GetTaskService', res.statusCode);
  res.end();
}


module.exports = {
  storeTaskService,
  getTaskService,
  upTaskService,
  softDeleteTaskService
};

const Busboy = require('busboy');
const url = require('url');



function storeTaskService(req, res) {
  let task = {};
  const busboy = new Busboy({ headers: req.headers });

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }
  busboy.on('field', (fieldname, val) => {
    task[fieldname] = val;
  });
  busboy.on('finish', async () => {
    await createTask(task);
    res.write('data berhasil di tambahkan');
    res.end();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

// async function getTaskByNameService(req, res) {
//   const uri = url.parse(req.url, true);
//   const filename = uri.pathname.replace('/cari/', '');
//   if (!filename) {
//     res.statusCode = 400;
//     res.write('request tidak sesuai');
//     res.end();
//   }

//   const value = await getTaskByName(filename);
//   res.setHeader('Content-Type', 'application/json');
//   const data = JSON.stringify(value);
//   res.statusCode = 200;
//   res.write(data);
//   res.end();
// }

async function upTaskByNameService(req, res) {
    const uri = url.parse(req.url, true);
    const filename = uri.pathname.replace('/update/', '');
    if (!filename) {
      res.statusCode = 400;
      res.write('request tidak sesuai');
      res.end();
    }

    const value = await upTaskByName(filename);
  res.setHeader('Content-Type', 'application/json');
  const data = JSON.stringify(value);
  setValueToDb();
  res.statusCode = 200;
  res.write(data);
  res.end();
}


async function getTaskService(req, res) {
  const value = await readTask();
  res.setHeader('Content-Type', 'application/json');
  const data = JSON.stringify(value.task);
  res.statusCode = 200;
  res.write(data);
  res.end();
}
async function softDeleteTaskService(req, res) {
  const uri = url.parse(req.url, true);
  const filename = uri.pathname.replace('/update/', '');
  if (!filename) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }

  const value = await softDeleteTask(filename);
  res.setHeader('Content-Type', 'application/json');
  const data = JSON.stringify(value);
  setValueToDb();
  res.statusCode = 200;
  res.write(data);
  res.end();
}


module.exports = {
  storeTaskService,
  getTaskService,
  upTaskByNameService,
  getTaskByNameService,
  softDeleteTaskService
};

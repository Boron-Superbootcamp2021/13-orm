const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { Writable } = require('stream');
const { Client } = require('minio');

/**
 * set MINIO_ROOT_USER=local-minio
 * set MINIO_ROOT_PASSWORD=pass-minio
 */

const client = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'local-minio',
  secretKey: 'pass-minio',
});

function randomFileName(mimetype) {
  return (
    new Date().getTime() +
    '-' +
    Math.round(Math.random() * 1000) +
    '.' +
    mime.extension(mimetype)
  );
}

function upload(obj, fieldname, file, mimetype, abort) {
  switch (fieldname) {
    case 'photo':
      {
        const destname = randomFileName(mimetype);
        obj.photo = destname;
        file.on('error', abort);
        client.putObject('photo', destname, file, (err, etag) => {
          if (err) {
            console.log(err);
            abort();
          }
        });
      }
      break;
    case 'attach':
      {
        const destname = randomFileName(mimetype);
        obj.attach = destname;
        file.on('error', abort);
        client.putObject('attach', destname, file, (err, etag) => {
          if (err) {
            console.log(err);
            abort();
          }
        })
      };
      break;
    default: {
      const noop = new Writable({
        write(chunk, encding, callback) {
          setImmediate(callback);
        },
      });
      file.pipe(noop);
    }
  }
}
function readServicePhoto(req, res, obj) {
  const filename = obj.photo;
  if (!filename) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  const file = path.resolve(__dirname, `./file-storage/${filename}`);
  const exist = fs.existsSync(file);
  if (!exist) {
    res.statusCode = 404;
    res.write('file tidak ditemukan');
    res.end();
  }
  const fileRead = fs.createReadStream(file);
  res.setHeader('Content-Type', 'application/json', mime.lookup(filename));
  res.statusCode = 200;
  fileRead.pipe(res);
}
function readServiceTask(req, res, obj) {
  const filename = obj.attach;
  if (!filename) {
    res.statusCode = 400;
    res.write('request tidak sesuai');
    res.end();
  }
  const file = path.resolve(__dirname, `./file-storage/${filename}`);
  const exist = fs.existsSync(file);
  if (!exist) {
    res.statusCode = 404;
    res.write('file tidak ditemukan');
    res.end();
  }
  const fileRead = fs.createReadStream(file);
  res.setHeader('Content-Type', 'application/json', mime.lookup(filename));
  res.statusCode = 200;
  fileRead.pipe(res);
  res.end();
}
module.exports = {
  upload,
  readServiceTask,
  readServicePhoto,
};

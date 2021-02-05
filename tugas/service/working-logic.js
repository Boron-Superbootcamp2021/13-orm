const { writeDataWorker,  readDataWorkerDB, getoneDB, deleteData } = require('../database/typeorm/main');

const ERROR_REGISTER_DATA_INVALID = 'data registrasi pekerja tidak lengkap';
const ERROR_WORKER_NOT_FOUND = 'pekerja tidak ditemukan';

async function register(data) {
    if (!data.name || !data.email || !data.biografi || !data.address || !data.nohp || !data.photo) {
      throw ERROR_REGISTER_DATA_INVALID;
    }
    const worker = {
      id: Math.round(Math.random() * 1000).toString(),
      name: data.name,
      email: data.email,
      biografi: data.biografi,
      address: data.address,
      nohp: data.nohp,
      photo: data.photo,
    };
    await writeDataWorker(worker);
    return worker;
}

async function list() {
  const worker = await readDataWorkerDB();
  return worker.find();
}

async function findWorker(id) {
  const worker = await getoneDB(id);
  return worker;
}

async function del(id) {
  try {
      const worker = await deleteData(id);
  } catch (err) {
      throw err;
  }
}


  
  module.exports = {
    register,
    list,
    findWorker,
    del,
    ERROR_REGISTER_DATA_INVALID,
    ERROR_WORKER_NOT_FOUND,
  };
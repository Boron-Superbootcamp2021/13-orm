/* eslint-disable no-unused-vars */
const { getConnection, createConnection } = require('typeorm');
const { TaskSchema, Task } = require('./entities/task');
const { WorkerSchema, Worker } = require('./entities/worker');
const path = require('path');

function init() {
  return createConnection({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'sanbercode',
    // type: 'postgres',
    // host: 'localhost',
    // port: 5432,
    // username: 'postgres',
    // password: 'postgres',
    // database: 'sanbercode2',
    // type: "sqlite",
    // database: path.resolve(__dirname, '../../../../sanbercode.db'),
    synchronize: true,
    dropSchema: false,
    logging: true,
    timezone: 'Asia/Jakarta',
    entities: [TaskSchema, WorkerSchema],
  });
}

async function writeDataWorkerDB(connection, obj) {
  const worker = connection.getRepository('Worker');

  const isiWorker = new Worker(
    null,
    obj.name,
    obj.address,
    obj.email,
    obj.nohp,
    obj.biografi,
    obj.photo
  );
  await worker.save(isiWorker);
}

async function writeDataTaskDB(connection, obj) {
  const task = connection.getRepository('Task');
  const isiTask = new Task(null, obj.job, obj.detail, obj.attach, obj.assignee);
  await task.save(isiTask);
}

function readDataTaskDB(con) {
  const task = con.getRepository('Task');
  return task;
}

function readDataWorkerDB() {
  const worker = getConnection().getRepository('Worker');
  return worker;
}
async function deleteDataDB(con, id) {
  const worker = await con
    .createQueryBuilder()
    .delete()
    .from(Worker)
    .where("id = :id", { id: 1 })
    .execute();
  return worker;
}
async function getoneDB(id) {
  const worker = getConnection()
    .getRepository(Worker)
    .createQueryBuilder('worker')
    .where('worker.id = :id', { id: id })
    .getOne();
  return worker;
}
async function updateDB(con, id, done) {
  const task = con
    .createQueryBuilder()
    .update(Task)
    .set({ done: done })
    .where('id = :id', { id: id })
    .execute();
  return task;
}
async function writeDataWorker(obj) {
  try {
    const conn = getConnection();
    await writeDataWorkerDB(conn, obj);
    conn.close();
  } catch (err) {
    console.error(err);
  }

  // getConnection().close();
}
async function writeDataTask(obj) {
  try {
    const conn = getConnection();
    await writeDataTaskDB(conn, obj);
    conn.close();
  } catch (err) {
    console.error(err);
  }

  // getConnection().close();
}
async function readDataTask() {
  try {
    const conn = getConnection();
    const task = readDataTaskDB(conn);
    let jobs = await task.find({
      relations: ['assignee'],
      where: [
        {done: '1'},
        {done: '2'}
      ]
    });
    conn.close();
    return jobs;
  } catch (err) {
    console.error(err);
  }

  // getConnection().close();
}



async function deleteData(id) {
  try {
    const conn = getConnection();
    await deleteDataDB(conn, id);
    conn.close();
  } catch (err) {
    console.error(err);
  }

  // getConnection().close();
}
async function updateData(id, done) {
  try {
    const conn = getConnection();
    await updateDB(conn, id, done);
    conn.close();
  } catch (err) {
    console.error(err);
  }

  // getConnection().close();
}

module.exports = {
  writeDataWorker,
  writeDataTask,
  init,
  readDataTask,
  deleteData,
  updateData,
  readDataWorkerDB,
  getoneDB,
};

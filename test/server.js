const createTestServer = require('create-test-server');

const writeData = (data, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'Content-Type,X-Requested-With');
  res.send(data);
};

const start = async () => {
  const server = await createTestServer();
  console.warn(server.url);
  console.warn(server.sslUrl);

  const multer = require('multer');
  const upload = multer({ dest: 'test/uploads-files/' });

  // sigle file
  server.options('/test/upload/single', (req, res) => {
    writeData('ok', res);
  });
  server.post('/test/upload/single', upload.single('file'), (req, res) => {
    console.warn('req.headers', req.headers);
    console.warn('req.file', req.file);
    console.warn('req.body', req.body);
    writeData(req.body, res);
  });

  // multi files
  server.options('/test/upload/array', (req, res) => {
    writeData('ok', res);
  });
  server.post('/test/upload/array', upload.array('files'), (req, res) => {
    console.warn('req.headers', req.headers);
    console.warn('req.files', req.files);
    console.warn('req.body', req.body);
    writeData(req.body, res);
  });
};

start();

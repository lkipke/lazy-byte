import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';

import { authWithCode, getActivityLogListForDate } from './fitbit';
import { storeAuthCreds } from './mysql/auth';
import init from './mysql/init';

const port = process.env.NODE_DOCKER_PORT;
const FITBIT_CLIENT_ID = process.env.FITBIT_CLIENT_ID as string;

const allowList: string[] = JSON.parse(process.env.CLIENT_ORIGIN_ALLOW_LIST);
const corsOptions: cors.CorsOptions = {
  origin: allowList,
  credentials: true,
};

const createServer = () => {
  const app = express();
  https
    .createServer(
      {
        key: fs.readFileSync('certs/key.pem'),
        cert: fs.readFileSync('certs/cert.pem'),
      },
      app
    )
    .listen(port, () => {
      console.log(`server is running at port ${port}`);
    });

  app.use(cors(corsOptions));
  app.use(express.json());

  app.get('/', async (req: Request, res: Response) => {
    let html = await fs.promises.readFile('public/index.html', 'utf-8');
    res.send(html.replace('$$CLIENT_ID$$', FITBIT_CLIENT_ID));
  });

  app.get('/fitbit/auth_success', async (req: Request, res: Response) => {
    res.send('successfully connected to fitbit!');
  });

  // app.get('/test', async (req: Request, res: Response) => {
  //   let database: Collection<Document> = req.app.locals.db.fitbitData;
  //   await database.insertMany([{ we: 'did it!' }]);
  //   let auth: Collection<Document> = req.app.locals.db.fitbitAuth;
  //   await auth.insertMany([{ we: 'did it!' }]);
  //   res.send('successful!');
  // });

  app.get('/fitbit/callback', async (req: Request, res: Response) => {
    console.log('CODE', req.query.code);
    let code = req.query.code as string;
    if (!code) {
      return res.status(500).send('Error: Fitbit did not send an auth code.');
    }

    let results = await authWithCode(code);
    console.log('RESULTS', results);

    if (results.success) {
      let { success, ...data } = results;
      storeAuthCreds(data);
      res.redirect('/fitbit/auth_success');
    } else {
      res.status(500).send(results);
    }
  });

  app.get('/fitbit/query/activity_log', async (req: Request, res: Response) => {
    let date = req.query.date as string;
    if (!date) {
      return res.status(400).send('Must send a date');
    }

    await getActivityLogListForDate(date);
    res.send(`successfully got data for date: ${date}`);
  });
};

init().then(createServer);

import express from 'express';
import axios from 'axios';
import { Parser } from 'json2csv';
import { writeFile } from 'fs';
import { parseInputData, updateObjectWithNewData } from '../etc/helper.js';
import { inputData } from '../input.js';

const routes = express.Router();

routes.get('/loadETFs', async (req, res, next) => {
  console.log('routes -> /loadETFs');
  try {
    const response = await axios.get(
      // 'https://jsonplaceholder.typicode.com/todos'
      'https://purposecloud.s3.amazonaws.com/challenge-data.json'
    );

    const jsonData = parseInputData(inputData);
    if (jsonData) {
      res.json(jsonData);
    } else {
      res.status(500).json({ message: 'Unable to parseInput data' });
    }
  } catch (err) {
    next(err);
  }
});

routes.post('/saveETFs', async (req, res, next) => {
  console.log('routes -> /saveETFs');
  try {
    const response = await axios.get(
      // 'https://jsonplaceholder.typicode.com/todos'
      'https://purposecloud.s3.amazonaws.com/challenge-data.json'
    );
    console.log(req.body);

    const parser = new Parser();
    const csv = parser.parse(
      await updateObjectWithNewData(req.body, response.data)
    );
    // console.log('csv parsing complete');
    const path = 'output/etf_' + Date.now() + '.csv';
    writeFile(path, csv, 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        console.log('file wrote successfully at path: ' + path);
        res.status(200).json({ message: 'File saved successfully' });
      }
    });
    // res.status(200).json(req.body);
  } catch (err) {
    console.log('Error while axios csv');
    next(err);
  }
});

export default routes;

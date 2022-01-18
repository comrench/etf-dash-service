import moment from 'moment';
import { presentDate } from './constants.js';

const isJson = (item) => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
};

const isValidDate = (date) => {
  if (date) {
    const dateArr = date.split('-');
    return moment(dateArr).isValid();
  }
  return false;
};

export const parseInputData = (data) => {
  const result = {};
  if (isJson(data)) {
    Object.entries(data).forEach(([fundKey, fundValue]) => {
      const obj = {};
      obj.fundId = fundKey;
      obj.fundName = fundValue?.name?.en;
      obj.aum = fundValue?.aum;

      const series = fundValue?.series;
      const ser = {};
      if (isJson(series)) {
        Object.entries(series).forEach(([key, value]) => {
          const date = series[key]?.latest_nav?.date;
          if (isValidDate(date) && isValidDate(presentDate)) {
            if (moment(presentDate.split('-')).isAfter(date.split('-'))) {
              if (!ser[key]) {
                ser[key] = {};
              }
              ser[key].latest_nav = { ...value?.latest_nav };
            }
          } else {
            console.log('Error: Invalid date so skipping the record');
          }
        });
        if (Object.keys(ser).length > 0) {
          obj.series = ser;
        }
      } else {
        console.log('series is not a valid json');
      }
      if (obj?.series) {
        result[fundKey] = obj;
      }
    });
    console.log(result);
    return result;
  } else {
    console.log('Error: input json is not valid');
    return null;
  }
};

export const updateObjectWithNewData = (newJson, oldJson) => {
  if (isJson(newJson) && isJson(oldJson)) {
    Object.entries(newJson).forEach(([fundKey, fundValue]) => {
      oldJson[fundKey].aum = fundValue.aum;
      const series = newJson[fundKey].series;
      if (isJson(series)) {
        Object.entries(series).forEach(([seriesKey, seriesValue]) => {
          if (oldJson[fundKey].series[seriesKey].latest_nav) {
            oldJson[fundKey].series[seriesKey].latest_nav =
              seriesValue.latest_nav;
          }
        });
      }
    });
  }
  return oldJson;
};

//Configuration of Unsplash API

import axios from 'axios';

export default axios.create({
  baseURL: 'https://api.unsplash.com/',
  headers: {
    Authorization: 'Client-ID XHtcG7gxMEGQNMlvsk9Ow1mx-UEpV8y4DFVsUJkEgRQ',
  },
});

//Configuration of Unsplash API

import axios from 'axios';

export default axios.create({
  baseURL: 'https://api.unsplash.com/',
  headers: {
    Authorization: 'Client-ID KG3JB6gQQy3p-JIDG2CijXvCTp_Ztu7WMGPp6MdN3AA',
  },
});

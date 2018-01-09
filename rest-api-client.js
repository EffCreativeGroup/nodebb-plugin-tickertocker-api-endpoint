'use strict';

const axios = require('axios');

class RestApiClient {
  constructor() {
    var ttapi = require.main.require('nodebb-plugin-tickertocker-api-endpoint');

    this.host = ttapi.settings['ttapi:host'];
    this.apiUrlCurrentUser = ttapi.settings['ttapi:apiUrlCurrentUser'];

    this.client = axios.create({
      baseURL: this.host,
      // timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [
        (data, headers) => {
          headers.Authorization = `Bearer ${this.getToken()}`;

          return data;
        }
      ]
    });
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  currentUser() {
    return this.client.get(this.apiUrlCurrentUser);
  }
}

function createRestApiClient(baseUrl) {
  return new RestApiClient(baseUrl);
}

module.exports = createRestApiClient;

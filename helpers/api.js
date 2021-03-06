// An object to store the ressponse time of completed API requests
const responseTime = {};

// An object to store pending API requests
const responsePending = {};

// Helper methods for making API requests
const API = {
  async get(axios, url) {
    let response = false;

    if(responsePending[url] === undefined || responsePending[url] === false) {
      responsePending[url] = true;

      try {
        const startTime = new Date();
        response = (await axios.get(url)).data;
        const endTime = new Date();

        responseTime[url] = (endTime.getTime() - startTime.getTime()) / 1000;
      } catch(error) {
        // TODO: Trigger the EventBus to display user friendly error messages
        console.error(error);
      } finally {
        responsePending[url] = false;
      }
    } else {
      console.warn(`Warning: A request to ${url} is already in progress. Duplicate connection skipped.`);
    }

    return response;
  },

  // Return the response time if this URL has already been fetched
  responseTime(url) {
    let duration = -1;

    if(responseTime[url] !== undefined) {
      duration = responseTime[url];
    }

    return duration;
  }
}

export default API;

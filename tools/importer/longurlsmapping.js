import fetch from '@adobe/node-fetch-retry';
import { JSDOM } from 'jsdom';

async function parseHTML(text) {
    const jsdom = new JSDOM(text);
    return jsdom.window.document;
}

async function fetchDocument(url) {
    const resp = await fetch(url);
    if (resp.ok) {
      const text = await resp.text();
      return await parseHTML(text);
    } else {
      console.log(`Unable to fetch ${url}. Response status: ${resp.status}`);
    }
}
  
async function fetchLongPath(url) {
    // console.log(`fetching long path from ${url}`);
    const doc = await fetchDocument(url);
    if (doc) {
        return doc.body.getAttribute('data-page-path');
    }
}

const map = async (orgUrl, params) => {
    const longPath = await fetchLongPath(orgUrl); 
    if (longPath) {
        try {
            const url = new URL(orgUrl);
            return `${url.protocol}//${url.hostname}${longPath}`
        } catch (err) {
            console.log(`Unable to get long path for ${orgUrl}. ${err.message}`);
        }
    }
    return orgUrl;
}

export {
    map
}

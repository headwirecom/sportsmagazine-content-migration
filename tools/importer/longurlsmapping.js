import fetch from '@adobe/node-fetch-retry';
import { JSDOM } from 'jsdom';

const unsupportedSelectors = [
    'body.homePage', 'body.landingPage'
]

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

function filterPageTypes(doc, pageSelectors) {
    if (pageSelectors) {
        let supported = false;
        pageSelectors.forEach((sel) => {
            const el = doc.querySelector(sel);
            if (el) {
                supported = true;
            }
        });

        if (!supported) {
            throw new Error("Page doesn't match any valid page selector parameters.");
        }
    }

    unsupportedSelectors.forEach((sel) => {
        const el = doc.querySelector(sel);
        if (el) {
            throw new Error(`Unsapported page type selector '${sel}'`);
        }
    });
}

async function fetchLongPath(url, pageSelectors) {
    // console.log(`fetching long path from ${url}`);
    const doc = await fetchDocument(url);
    if (doc) {
        filterPageTypes(doc, pageSelectors);
        return doc.body.getAttribute('data-page-path');
    }
}

const map = async (orgUrl, params) => {
    try {
        const pageSelectors = (params && params['selectors']) ? params['selectors'] : null; 
        const longPath = await fetchLongPath(orgUrl, pageSelectors); 
        if (longPath) {
            try {
                const url = new URL(orgUrl);
                return `${url.protocol}//${url.hostname}${longPath}`
            } catch (err) {
                console.log(`Unable to get long path for ${orgUrl}. ${err.message}`);
            }
        }
        return orgUrl;
    } catch (err) {
        console.log(`${orgUrl}: ${err.message}`);
    }
}

export {
    map
}

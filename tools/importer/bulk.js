let [log] = [...document.querySelectorAll('.publish-logger')];

/* eslint-disable no-console */
// console.log(log);

const append = (string, el = 'p', showCount = true) => {
  if (log) {
    const p = document.createElement(el);
    p.innerHTML = string;
    log.append(p, showCount);
  }
  /* eslint-disable no-console */
  console.log(string);
};

const bulk = async (urls, operation, logger, apiMethod = 'POST', startCount = 0) => {
  if (logger) {
    log = logger;
  }

  const logIndexResponse = (path, text) => {
    const json = JSON.parse(text);
    const indeces = json.results;
    let logTxt = `${path}`;
    indeces.forEach((index) => {
      if (index.record) {
        let indexRecord = JSON.stringify(index.record);
        logTxt = logTxt + `<br/> Index name "${index.name}": ${indexRecord}`;
      }
    });
    append(logTxt);
  }

  const logStatusResponse = (path, text) => {
    const json = JSON.parse(text);
    let statusTxt = '{ ';
    for (let key of Object.keys(json)) {
      if (json[key].status && key !== 'links') {
        statusTxt = statusTxt + `${key} status: ${json[key].status} `;
      }
    }
    statusTxt = statusTxt + '}';
    append(`${path} ${statusTxt}`, 'div');
  };

  const executeOperation = async (url) => {
    const { hostname, pathname } = new URL(url);
    const [branch, repo, owner] = hostname.split('.')[0].split('--');
    const adminURL = `https://admin.hlx.page/${operation}/${owner}/${repo}/${branch}${pathname}`;
    const resp = await fetch(adminURL, {
      method: apiMethod
    });
    if (log.updateCounter !== "undefined") {
      log.updateCounter();
    }
    const text = await resp.text();
    /* eslint-disable no-console */
    console.log(adminURL);
    console.log(text);
    if (resp.ok) {
      if (operation === 'index') {
        logIndexResponse(url, text);
      } else {
        logStatusResponse(url, text);
      }
    } else {
      append(`FAILED ${operation} ${apiMethod} ${adminURL}: ${text}`, 'div');
    }
  };

  const dequeue = async () => {
    while (urls.length) {
      const url = urls.shift();
      try {
        await executeOperation(url);
      } catch (e) {
        console.error(e);
        if (log.updateCounter !== "undefined") {
          log.updateCounter();
        }
        append(`FAILED ${url}: ${e.message}`, 'div');
      }
    }
  };

  const concurrency = operation === 'live' ? 40 : 5;
  const total = urls.length + startCount;
  // append(`URLs: ${urls.length}`, 'p', false);
  for (let i = 0; i < concurrency; i += 1) {
    dequeue();
  }
};

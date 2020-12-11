/* eslint-disable no-console */
/* global ractive */
let now;

if (window.performance && window.performance.now) {
  now = function () {
    return window.performance.now();
  };
} else if (Date.now) {
  now = function () {
    return Date.now();
  };
} else {
  now = function () {
    return new Date().getTime();
  };
}

const durationMax = 1000;
const totalDurationMax = 3000;

let shouldProfile = false;

window.runSuite = function (tests, version, ractiveUrl, callback) {
  const testResults = { tests: [] };
  const container = document.querySelector('.iframe-container');
  let solo;

  console.group('running performance tests (' + version + ')');

  shouldProfile = ractive.get('shouldProfile');

  tests = tests.filter(t => {
    return !t.skip;
  });

  solo = tests.filter(t => {
    return t.solo;
  });
  if (solo.length) {
    tests = solo;
  }

  function runNextTest() {
    let test, frame;

    test = tests.shift();
    if (!test) {
      console.groupEnd();
      return callback(null, testResults);
    }

    frame = document.createElement('iframe');
    if (ractive.get('showResult')) frame.classList.add('visible');
    container.appendChild(frame);

    runTest(frame.contentWindow, test, version, ractiveUrl, (err, result) => {
      if (err) {
        console.groupEnd();
        err.testName = test.name;
        if (result) testResults.tests.push(result);
        return callback(err, testResults);
      }

      testResults.tests.push(result);
      container.innerHTML = '';

      setTimeout(runNextTest);
    });
  }

  runNextTest();
};

function runTest(context, test, version, ractiveUrl, callback) {
  console.group(test.name);

  window.injectScript(context, ractiveUrl, err => {
    let alreadySetup, setupResult;

    if (err) {
      return callback(err);
    }

    // copy setTimeout from parent to child... prevents errors
    context.setTimeout = window.setTimeout;

    // setup test
    context.setupComplete = function (err, setupResult) {
      let runStart;
      let duration;
      let totalDuration;
      let count = 0;
      const label = version + ': ' + test.name;
      const steps = [];
      let died = false;
      let min;
      let max;
      const durs = [];

      if (err) {
        return callback(err);
      }

      if (alreadySetup) throw new Error('setupComplete callback was called more than once');
      alreadySetup = true;

      if (shouldProfile || test.profile) console.profile(label);

      const start = now();
      duration = totalDuration = min = max = 0;

      context.setupResult = setupResult;

      while (!died && duration < durationMax && totalDuration < totalDurationMax) {
        if (test.beforeEach) {
          context.eval('(' + test.beforeEach.toString() + ')()');
        }

        count += 1;
        runStart = now();

        try {
          if (Array.isArray(test.test)) {
            for (let i = 0; i < test.test.length; i++) {
              const t = test.test[i];
              if (!t.skip) {
                if (t.profile) console.profile(label + ' - ' + t.name);
                window.runStep(context, t, (err, res) => {
                  steps.push(res);
                  if (err) {
                    res.error = err;
                    died = true;
                  }
                });
                if (t.profile) console.profileEnd(label + ' - ' + t.name);
              }
            }
          } else {
            context.eval('(' + test.test.toString() + ')(setupResult)');
          }
        } catch (e) {
          return callback(e);
        }

        const dur = now() - runStart;
        duration += dur;
        durs.push(dur);
        if (!min || dur < min) min = dur;
        if (dur > max) max = dur;
        totalDuration += dur;
      }

      if (shouldProfile || test.profile) console.profileEnd(label);

      console.groupEnd();

      callback(null, {
        test,
        version,
        ractiveUrl,
        name: test.name,
        count,
        steps,
        duration,
        average: duration / count,
        min,
        max,
        durations: durs
      });
    };

    if (test.setup) {
      setupResult = context.eval('(' + test.setup.toString() + ')(setupComplete)');
    }

    if (!test.setup || !test.setup.length) {
      context.setupComplete(null, setupResult);
    }
  });
}

window.runStep = function (context, test, callback) {
  const start = now();
  let count = 0;
  let runStart;
  let setupStart;
  let duration = 0;
  let totalDuration = 0;
  let min = 0;
  let max = 0;
  const durs = [];
  const setups = [];
  let setup;

  console.group(test.name);

  if (typeof test.setup === 'function') {
    setupStart = now();
    context.eval('(' + test.setup.toString() + ')()');
    setup = now() - setupStart;
  }

  while (
    duration < (test.max || durationMax) &&
    totalDuration < (test.totalMax || totalDurationMax)
  ) {
    if (typeof test.beforeEach === 'function') {
      setupStart = now();
      context.eval('(' + test.beforeEach.toString() + ')()');
      setups.push(now() - setupStart);
    }
    runStart = now();
    count++;

    try {
      context.eval('(' + test.test.toString() + ')(setupResult)');
    } catch (e) {
      return callback(e, { name: test.name });
    }

    const dur = now() - runStart;
    duration += dur;
    durs.push(dur);
    if (!min || dur < min) min = dur;
    if (dur > max) max = dur;
    totalDuration = now() - start;

    if (test.maxCount && count >= test.maxCount) break;
  }

  callback(null, {
    name: test.name,
    duration,
    count,
    average: duration / count,
    min,
    max,
    durations: durs,
    setups,
    setup
  });

  console.groupEnd(test.name);
};

window.injectScript = function (context, url, callback) {
  const doc = context.document;

  const script = doc.createElement('script');
  script.src = url;

  const id = Math.random();

  let handleMessage;

  window.addEventListener(
    'message',
    (handleMessage = function (event) {
      if (event.data === id) {
        window.removeEventListener('message', handleMessage);
        callback();
      }
    })
  );

  script.onload = function () {
    window.parent.postMessage(id, window.location.origin);
  };

  script.onerror = function () {
    const err = new Error('Could not load ' + url);
    callback(err);
  };

  doc.body.appendChild(script);
};

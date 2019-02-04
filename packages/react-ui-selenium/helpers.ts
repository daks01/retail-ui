import http from "http";
import chai from "chai";
import { Suite, AsyncFunc, Test, TestFunction, SuiteFunction, Context } from "mocha";
import commonInterface, { CommonFunctions, CreateOptions } from "mocha/lib/interfaces/common";
import { Builder, until, By } from "selenium-webdriver";

import chaiImage from "./chai-image";
import config from "./config";

const testContext: string[] = [];

chai.use(chaiImage(testContext));

type CreateSuite = (options: CreateOptions, parentSuite: Suite) => Suite;
type Describer = (title: string, fn: (this: Suite) => void, createSuite: CreateSuite) => Suite | Suite[];

export function createBrowserSuites(suites: Suite[]) {
  // @ts-ignore `context` and `mocha` args not used here
  const commonGlobal = commonInterface(suites);

  return Object.entries(config.browsers).map(([browserName, capabilities]) => {
    const browserSuite = commonGlobal.suite.create({
      title: browserName,
      file: "",
      fn: () => null
    });

    browserSuite.ctx.browserName = browserName;

    browserSuite.beforeAll(async () => {
      browserSuite.ctx.browser = await new Builder()
        .usingServer(config.gridUrl)
        .withCapabilities(capabilities)
        .build();
    });

    return browserSuite;
  });
}

function getRealIp(): Promise<string> {
  return new Promise((resolve, reject) =>
    http.get("http://fake.dev.kontur/ip", res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Couldn't resolve real ip for \`localhost\`. Status code: ${res.statusCode}`));
      }

      let data = "";

      res.setEncoding("utf8");
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    })
  );
}

function storySuiteFactory(story: string, kindSuite: Suite, suiteCreator: () => Suite) {
  const storySuite = suiteCreator();

  Object.assign(storySuite.ctx, kindSuite.ctx, { story });

  storySuite.beforeEach(async function() {
    const selectedKind = encodeURIComponent(this.kind);
    const selectedStory = encodeURIComponent(this.story);
    const storybookQuery = `selectedKind=${selectedKind}&selectedStory=${selectedStory}`;

    if (config.address.host === "localhost") {
      config.address.host = await getRealIp();
    }

    const hostUrl = `http://${config.address.host}:${config.address.port}/${config.address.path}`;

    await this.browser.get(`${hostUrl}?${storybookQuery}`);
    await this.browser.wait(until.elementLocated(By.css("#test-element")));

    testContext.length = 0;
    testContext.push(this.browserName, this.kind, this.story);
  });

  return storySuite;
}

export function createDescriber(browserSuites: Suite[], suites: Suite[], file: string): Describer {
  return function describer(title: string, fn: (this: Suite) => void, createSuite: CreateSuite): Suite | Suite[] {
    const [parentSuite] = suites;

    if (parentSuite.root) {
      return browserSuites.map(browserSuite => {
        suites.unshift(browserSuite);

        const kindSuite = createSuite({ title, fn, file }, browserSuite);

        suites.shift();

        Object.assign(kindSuite.ctx, browserSuite.ctx, {
          kind: title
        });

        return kindSuite;
      });
    }

    return storySuiteFactory(title, parentSuite, () => createSuite({ title, fn, file }, parentSuite));
  };
}

export function describeFactory(describer: Describer, common: CommonFunctions): SuiteFunction {
  function describe(title: string, fn: (this: Suite) => void) {
    return describer(title, fn, options => common.suite.create(options));
  }

  function only(browsers: string[], title: string, fn: (this: Suite) => void): Suite | Suite[] {
    return describer(
      title,
      fn,
      (options, parentSuite) =>
        browsers.includes(parentSuite.ctx.browserName) ? common.suite.only(options) : common.suite.create(options)
    );
  }

  function skip(browsers: string[], title: string, fn: (this: Suite) => void): Suite | Suite[] {
    return describer(
      title,
      fn,
      (options, parentSuite) =>
        browsers.includes(parentSuite.ctx.browserName) ? common.suite.skip(options) : common.suite.create(options)
    );
  }

  describe.only = only;
  describe.skip = skip;

  // NOTE We can't redefine interface, only extend it
  return describe as SuiteFunction;
}

function wrap(origFn: AsyncFunc, callback: () => void): AsyncFunc {
  function fn(this: Context) {
    callback();

    return origFn.call(this);
  }
  fn.toString = function toString() {
    return origFn.toString();
  };
  return fn;
}

export function itFactory(suites: Suite[], file: string, common: CommonFunctions): TestFunction {
  // NOTE copy-paste from bdd-interface
  function it(title: string, fn?: AsyncFunc): Test {
    const [parentSuite] = suites;
    if (parentSuite.isPending()) {
      fn = undefined;
    }
    const test = new Test(title, fn && wrap(fn, () => testContext.push(title)));
    test.file = file;
    parentSuite.addTest(test);
    return test;
  }

  function only(browsers: string[], title: string, fn?: AsyncFunc): Test {
    const [parentSuite] = suites;

    return browsers.includes(parentSuite.ctx.browserName) ? common.test.only(mocha, it(title, fn)) : it(title, fn);
  }

  function skip(browsers: string[], title: string, fn?: AsyncFunc): Test {
    const [parentSuite] = suites;

    return browsers.includes(parentSuite.ctx.browserName) ? it(title) : it(title, fn);
  }
  function retries(n: number): void {
    common.test.retries(n);
  }

  it.only = only;
  it.skip = skip;
  it.retries = retries;

  // NOTE We can't redefine interface, only extend it
  return it as TestFunction;
}

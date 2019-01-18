import Mocha, {
  Suite,
  SuiteFunction,
  Func,
  AsyncFunc,
  Test,
  TestFunction,
  MochaGlobals
} from "mocha";
import commonInterface, { CommonFunctions } from "mocha/lib/interfaces/common";
import { Builder, until, By } from "selenium-webdriver";

interface Config {
  gridUrl: string;
  hostUrl: string;
  browsers: { [key: string]: { browserName: string } };
}

const config: Config = {
  gridUrl: "http://screen-dbg:shot@grid.testkontur.ru/wd/hub",
  hostUrl: "http://10.34.0.149:6060/iframe.html",
  browsers: {
    chrome: { browserName: "chrome" },
    firefox: { browserName: "firefox" },
    ie11: { browserName: "internet explorer" }
  }
};

// TODO Tests?

function createBrowserSuites(suites: Suite[]) {
  // @ts-ignore `context` and `mocha` args not used here
  const commonGlobal = commonInterface(suites);

  return Object.entries(config.browsers).map(([browser, capabilities]) => {
    const browserSuite = commonGlobal.suite.create({
      title: browser,
      file: "",
      fn() {
        /* noop */
      }
    });

    browserSuite.beforeAll(async () => {
      browserSuite.ctx.browser = await new Builder()
        .usingServer(config.gridUrl)
        .withCapabilities(capabilities)
        .build();
    });

    return browserSuite;
  });
}

function describeFactory(
  browserSuites: Suite[],
  suites: Suite[],
  file: string,
  common: CommonFunctions
): SuiteFunction {
  function describe(title: string, fn: (this: Suite) => void): Suite[] | Suite {
    if (suites.length === 1) {
      return browserSuites.map(browserSuite => {
        suites.unshift(browserSuite);

        const kindSuite = common.suite.create({ title, file, fn });

        suites.shift();

        if (kindSuite.parent) {
          Object.assign(kindSuite.ctx, kindSuite.parent.ctx, { kind: title });
        }

        return kindSuite;
      });
    }

    const storySuite = common.suite.create({ title, file, fn });

    if (storySuite.parent) {
      Object.assign(storySuite.ctx, storySuite.parent.ctx, { story: title });

      storySuite.beforeEach(async function() {
        const kind = encodeURIComponent(this.kind);
        const story = encodeURIComponent(this.story);
        await this.browser.get(
          `${config.hostUrl}?selectedKind=${kind}&selectedStory=${story}`
        );
        await this.browser.wait(until.elementLocated(By.css("#test-element")));
      });
    }

    return storySuite;
  }
  // TODO only browsers. Do we need check suite.length?
  // run for only specified browsers
  function only(
    browsers: string,
    title: string,
    fn: (this: Suite) => void
  ): Suite[] {
    // traverce up, check browser
    // @ts-ignore
    return browserDescriber(suites, function describeFn() {
      return common.suite.only({ title, file, fn });
    });
  }
  // TODO skip browsers. Do we need check suite.length?
  // skip specified browsers
  function skip(title: string, fn: (this: Suite) => void): Suite[] {
    // @ts-ignore
    return browserDescriber(suites, function describeFn() {
      return common.suite.skip({ title, file, fn });
    });
  }
  // @ts-ignore
  describe.only = only;
  // @ts-ignore
  describe.skip = skip;

  // @ts-ignore
  return describe as SuiteFunction;
}

function itFactory(
  suites: Suite[],
  context: MochaGlobals,
  file: string,
  common: CommonFunctions
): TestFunction {
  // NOTE copy-paste from bdd-interface
  function it(title: string, fn?: Func | AsyncFunc) {
    const [suite] = suites;
    if (suite.isPending()) {
      fn = undefined;
    }
    const test = new Test(title, fn);
    test.file = file;
    suite.addTest(test);
    return test;
  }
  function only(title: string, fn: Func | AsyncFunc): Test {
    return common.test.only(mocha, context.it(title, fn));
  }
  // TODO skip browsers
  function skip(title: string): Test {
    return context.it(title);
  }
  function retries(n: number): void {
    // @ts-ignore
    context.retries(n);
  }
  // @ts-ignore
  it.only = only;
  // @ts-ignore
  it.skip = skip;
  // @ts-ignore
  it.retries = retries;

  return it as TestFunction;
}

// @ts-ignore
export default (Mocha.interfaces.selenium = function seleniumInterface(
  suite: Suite
) {
  const suites = [suite];
  const browserSuites = createBrowserSuites(suites);

  suite.on("pre-require", function preRequire(context, file, mocha) {
    const common = commonInterface(suites, context, mocha);

    const describe = describeFactory(browserSuites, suites, file, common);
    const it = itFactory(suites, context, file, common);

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay ? common.runWithSuite(suite) : () => null;

    context.describe = context.context = describe;
    context.xdescribe = context.xcontext = context.describe.skip;

    context.it = context.specify = it;
    context.xit = context.xspecify = context.it.skip;
  });
});

// browsers
// parallel
// TODO react-selenium-testing

// simple API
/*

describe("Button", () => {
  describe("Story", browser => {
    it("scenario", () => {
      // click
      // hover
      // type
    });

    it("idle", () => {
      browser
        .getElement("#test-element")
        .capture("hover", { ignore: "loader" })
        .capture("click", '[class^="123"]')
        .capture("type", "1234") // type 1
        .capture("type", "1234"); // type 2
    });

    it("");
  });
});

*/

// Draft

/*
class Browser {
  constructor(config) {
    this.config = config;
    this.context = [];
  }

  async setStory(story) {
    this.driver = await new Builder()
      .usingServer(this.config.gridUrl)
      .withCapabilities(this.config.capabilities)
      .build();
    await this.driver.get(
      this.config.hostUrl +
        `?selectedKind=${this.config.kind}&selectedStory=${story}`
    );
  }

  getElement(selector) {
    this.queue.push({
      selector: [...(this.queue.slice(-1)[0].selector || []), selector]
    });
    this.context.push(selector);
    return this;
  }

  async flush() {}
}
*/

/*
const { describe, it } = context;

    context.describe = function(title, fn) {
      describe.call(this, title, async function() {
        if (fn.length == 1) {
          if (!this.browser) {
            throw new Error("You can't use `browser` on root level describe");
          }
          await this.browser.setStory(title);

          return fn.call(this, this.browser);
        }
        this.browser = new Browser({ ...config, kind: title });
        return fn.call(this);
      });
    };

    context.it = function(title, fn) {
      it.call(this, title, async function() {
        fn.call(this);

        await browser.flush();
      });
    };
    */

import Mocha, {
  Suite,
  Func,
  AsyncFunc,
  Test,
  TestFunction,
  SuiteFunction
} from "mocha";
import commonInterface, {
  CommonFunctions,
  CreateOptions
} from "mocha/lib/interfaces/common";
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
// browsers
// parallel
// TODO react-selenium-testing
// TODO refactor DRY

type CreateSuite = (options: CreateOptions, parentSuite: Suite) => Suite;
type Describer = (
  title: string,
  fn: (this: Suite) => void,
  createSuite: CreateSuite
) => Suite | Suite[];

function createBrowserSuites(suites: Suite[]) {
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

function storySuiteFactory(
  story: string,
  kindSuite: Suite,
  suiteCreator: () => Suite
) {
  const storySuite = suiteCreator();

  Object.assign(storySuite.ctx, kindSuite.ctx, { story });

  storySuite.beforeEach(async function() {
    const selectedKind = encodeURIComponent(this.kind);
    const selectedStory = encodeURIComponent(this.story);
    const storybookQuery = `selectedKind=${selectedKind}&selectedStory=${selectedStory}`;
    await this.browser.get(`${config.hostUrl}?${storybookQuery}`);
    await this.browser.wait(until.elementLocated(By.css("#test-element")));
  });

  return storySuite;
}

function createDescriber(
  browserSuites: Suite[],
  suites: Suite[],
  file: string
): Describer {
  return function describer(
    title: string,
    fn: (this: Suite) => void,
    createSuite: CreateSuite
  ): Suite | Suite[] {
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

    return storySuiteFactory(title, parentSuite, () =>
      createSuite({ title, fn, file }, parentSuite)
    );
  };
}

function describeFactory(
  describer: Describer,
  common: CommonFunctions
): SuiteFunction {
  function describe(title: string, fn: (this: Suite) => void) {
    return describer(title, fn, options => common.suite.create(options));
  }

  function only(
    browsers: string[],
    title: string,
    fn: (this: Suite) => void
  ): Suite | Suite[] {
    return describer(
      title,
      fn,
      (options, parentSuite) =>
        browsers.includes(parentSuite.ctx.browserName)
          ? common.suite.only(options)
          : common.suite.create(options)
    );
  }

  function skip(
    browsers: string[],
    title: string,
    fn: (this: Suite) => void
  ): Suite | Suite[] {
    return describer(
      title,
      fn,
      (options, parentSuite) =>
        browsers.includes(parentSuite.ctx.browserName)
          ? common.suite.skip(options)
          : common.suite.create(options)
    );
  }

  describe.only = only;
  describe.skip = skip;

  // NOTE We can't redefine interface, only extend it
  return describe as SuiteFunction;
}

function itFactory(
  suites: Suite[],
  file: string,
  common: CommonFunctions
): TestFunction {
  // NOTE copy-paste from bdd-interface
  function it(title: string, fn?: Func | AsyncFunc): Test {
    const [parentSuite] = suites;
    if (parentSuite.isPending()) {
      fn = undefined;
    }
    const test = new Test(title, fn);
    test.file = file;
    parentSuite.addTest(test);
    return test;
  }

  function only(
    browsers: string[],
    title: string,
    fn?: Func | AsyncFunc
  ): Test {
    const [parentSuite] = suites;

    return browsers.includes(parentSuite.ctx.browserName)
      ? common.test.only(mocha, it(title, fn))
      : it(title, fn);
  }

  function skip(
    browsers: string[],
    title: string,
    fn?: Func | AsyncFunc
  ): Test | void {
    const [parentSuite] = suites;

    return browsers.includes(parentSuite.ctx.browserName)
      ? it(title)
      : it(title, fn);
  }
  // function retries(n: number): void {
  //   common.test.retries(n);
  // }

  it.only = only;
  it.skip = skip;
  // it.retries = retries;

  // NOTE We can't redefine interface, only extend it
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

    const describer = createDescriber(browserSuites, suites, file);
    const describe = describeFactory(describer, common);
    const it = itFactory(suites, file, common);

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

// simple API
/*
describe("Button", () => {
  describe("Story", () => {
    it("scenario", () => {
      // click
      // hover
      // type
    });

    it("idle", () => {
      this.browser
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

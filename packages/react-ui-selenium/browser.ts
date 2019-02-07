import http from "http";
import chai from "chai";
import { Context } from "mocha";
import { Builder, until, By } from "selenium-webdriver";
import config, { Config, Capabilities } from "./config";
import chaiImage from "./chai-image";

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

export async function getBrowser(config: Config, capabilities: Capabilities) {
  const browser = await new Builder()
    .usingServer(config.gridUrl)
    .withCapabilities(capabilities)
    .build();

  if (config.address.host === "localhost") {
    config.address.host = await getRealIp();
  }

  const hostUrl = `http://${config.address.host}:${config.address.port}/${config.address.path}`;
  const storybookQuery = "selectedKind=All&selectedStory=Stories";

  await browser.get(`${hostUrl}?${storybookQuery}`);
  await browser.wait(until.elementLocated(By.css("#root")), 10000);

  return browser;
}

export async function switchStory(this: Context, testContext: string[]) {
  const test = this.currentTest!.title;
  const story = this.currentTest!.parent!.title;
  const kind = this.currentTest!.parent!.parent!.title;
  const browserName = this.currentTest!.parent!.parent!.parent!.title;

  // TODO reset mouse position
  await this.browser.executeScript(
    // tslint:disable
    // @ts-ignore
    function(kind, story) {
      window.scrollTo(0, 0);
      // @ts-ignore
      window.renderStory({
        kind: kind,
        story: story
      });
      // tslint:enable
    },
    kind,
    story
  );

  testContext.length = 0;
  testContext.push(browserName, kind, story, test);
}

export function describeBrowser(browserName: string) {
  const testContext: string[] = [];

  chai.use(chaiImage(testContext));

  describe(browserName, function() {
    before(async function() {
      this.browser = await getBrowser(config, config.browsers[browserName]);
    });

    beforeEach(async function() {
      await switchStory.call(this, testContext);
    });

    require("./tests/Button");
  });
}

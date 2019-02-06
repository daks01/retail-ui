import http from "http";
import chai, { expect } from "chai";
import { By, Builder, until, WebDriver } from "selenium-webdriver";

import config from "../config";
import chaiImage from "react-ui-selenium/chai-image";

// ---------boilerplate start---------

const testContext: string[] = [];

chai.use(chaiImage(testContext));

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

const browserName = "firefox";

describe(browserName, function() {
  // @ts-ignore
  let browser: WebDriver = null;

  before(async function() {
    browser = await new Builder()
      .usingServer(config.gridUrl)
      .withCapabilities(config.browsers[browserName])
      .build();

    if (config.address.host === "localhost") {
      config.address.host = await getRealIp();
    }

    const hostUrl = `http://${config.address.host}:${config.address.port}/${config.address.path}`;
    const storybookQuery = "selectedKind=All&selectedStory=Stories";

    await browser.get(`${hostUrl}?${storybookQuery}`);
    await browser.wait(until.elementLocated(By.css("#root")), 10000);

    this.browser = browser;
  });

  function getBeforeEach(kind: string, story: string) {
    return async function() {
      // TODO reset mouse position
      await browser.executeScript(
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
      testContext.push(browserName, kind, story);
    };
  }

  // ---------boilerplate end--------- and modified

  function button() {
    it("idle", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));

      await expect(await element.takeScreenshot()).to.matchImage("idle");
    });

    it("hover", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));
      const button = await element.findElement(By.css("button"));

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .move({ origin: button })
        .perform();

      await expect(await element.takeScreenshot()).to.matchImage("hover");
    });

    it("leave", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));
      const button = await element.findElement(By.css("button"));
      const body = await this.browser.findElement(By.css("body"));

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .move({ origin: button })
        .move({ origin: body })
        .perform();

      await expect(await element.takeScreenshot()).to.matchImage("leave");
    });

    it("pressed", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));
      const button = await element.findElement(By.css("button"));

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .move({ origin: button })
        .press()
        .perform();

      await expect(await element.takeScreenshot()).to.matchImage("pressed");

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .release()
        .perform();
    });

    it("clicked", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .click(await element.findElement(By.css("button")))
        .perform();

      await expect(await element.takeScreenshot()).to.matchImage("clicked");
    });

    it("clickedOutside", async function() {
      testContext.push(this.test!.title);
      const element = await this.browser.findElement(By.css("#test-element"));

      // @ts-ignore
      await this.browser
        .actions({ bridge: true })
        .click(await element.findElement(By.css("button")))
        .click(await this.browser.findElement(By.css("body")))
        .perform();

      await expect(await element.takeScreenshot()).to.matchImage("clickedOutside");
    });
  }

  // ----------modified-----------
  describe("Button", function() {
    describe("playground", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      button();
    });
    describe("use link", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      button();
    });
    describe("use link with icon", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      button();
    });
    describe("multiline text with link button", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      button();
    });
    describe("with error", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      button();
    });

    describe("arrow table", function() {
      beforeEach(getBeforeEach(this.parent!.title, this.title));
      it("plain", async function() {
        testContext.push(this.test!.title);
        const element = await this.browser.findElement(By.css("#test-element"));

        await expect(await element.takeScreenshot()).to.matchImage("idle");
      });
    });
  });
});

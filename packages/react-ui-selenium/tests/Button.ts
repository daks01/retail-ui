import { expect } from "chai";
import { WebDriver, until, By } from "selenium-webdriver";
import { Context } from "mocha";

describe("Button", function() {
  describe("playground", function() {
    it("should have expected text", async function() {
      const { browser, kind, story }: Context = this;
      const driver: WebDriver = browser;
      await driver.get(
        `http://10.34.0.149:6060/iframe.html?selectedKind=${kind}&selectedStory=${story}`
      );
      await driver.wait(until.elementLocated(By.css("#test-element")));

      const text = await driver.findElement(By.css("button")).getText();

      expect(text).to.equal("Hello");
    });
  });
});

import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Input", function() {
  describe("Inputs with different states", function() {
    it("should have expected text 1", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      return expect(await element.takeScreenshot()).to.matchImage("inputs");
    });
    it("should have expected text 2", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      return expect(await element.takeScreenshot()).to.matchImage("inputs");
    });
    it("should have expected text 3", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      return expect(await element.takeScreenshot()).to.matchImage("inputs");
    });
    it("should have expected text 4", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      return expect(await element.takeScreenshot()).to.matchImage("inputs");
    });
    it("should have expected text 5", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      return expect(await element.takeScreenshot()).to.matchImage("inputs");
    });
  });

  // describe.skip(["chrome"], "playground", function() {
  //   it("should have expected text", async function() {
  //     const text = await this.browser.findElement(By.css("button")).getText();

  //     expect(text).to.equal("Hello");
  //   });
  // });
});

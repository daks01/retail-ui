import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Input", function() {
  describe("Inputs with different states", function() {
    it.skip(["firefox", "ie11"], "should have expected text", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      expect(element.takeScreenshot()).to.matchImage("inputs");
    });
  });

  // describe.skip(["chrome"], "playground", function() {
  //   it("should have expected text", async function() {
  //     const text = await this.browser.findElement(By.css("button")).getText();

  //     expect(text).to.equal("Hello");
  //   });
  // });
});

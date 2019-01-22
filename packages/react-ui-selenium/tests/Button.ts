import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Button", function() {
  describe("playground", function() {
    it.skip(["firefox", "ie11"], "should have expected text", async function() {
      // @ts-ignore
      const text = await this.browser.findElement(By.css("button")).getText();

      console.log(
        // @ts-ignore
        await this.browser.findElement(By.css("button")).takeScreenshot()
      );

      expect(text).to.equal("Hello");
    });
  });

  // describe.skip(["chrome"], "playground", function() {
  //   it("should have expected text", async function() {
  //     const text = await this.browser.findElement(By.css("button")).getText();

  //     expect(text).to.equal("Hello");
  //   });
  // });
});

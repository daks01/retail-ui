import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Button", function() {
  describe("playground", function() {
    it("should have expected text", async function() {
      const text = await this.browser.findElement(By.css("button")).getText();

      expect(text).to.equal("Hello");
    });
  });

  describe.skip(["chrome"], "playground", function() {
    it("should have expected text", async function() {
      const text = await this.browser.findElement(By.css("button")).getText();

      expect(text).to.equal("Hello");
    });
  });
});

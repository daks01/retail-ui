import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Button", function() {
  describe("playground", function() {
    it("should have expected text", async function() {
      // const { browser }: Context = this;

      const text = await this.browser.findElement(By.css("button")).getText();

      expect(text).to.equal("Hello");
    });
  });

  describe.skip(["123"], "playground", function() {
    it("should have expected text", async function() {
      // const { browser }: Context = this;

      const text = await this.browser.findElement(By.css("button")).getText();

      expect(text).to.equal("Hello");
    });
  });
});

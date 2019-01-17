import { expect } from "chai";
import { By } from "selenium-webdriver";

describe("Hint", function() {
  describe("playground", function() {
    it("should have expected text", async function() {
      // const { browser }: Context =  this;

      // @ts-ignore
      const text = await this.browser.findElement(By.css("span")).getText();

      expect(text).to.equal("Plain hint with knobs");
    });
  });
});

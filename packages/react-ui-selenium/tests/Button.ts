// import { it, describe } from "mocha";
import { expect } from "chai";
import { Builder, WebDriver, until, By } from "selenium-webdriver";

// Browsers

describe("Button", function() {
  let driver: WebDriver | null = null;
  before(async function() {
    // console.log(Date.now());
    driver = await new Builder()
      .usingServer("http://screen-dbg:shot@grid.testkontur.ru/wd/hub")
      // @ts-ignore
      .withCapabilities({ browserName: this.test.parent.parent.title })
      .build();
    // console.log(Date.now());
  });
  describe("playground", function() {
    it("idle", async function() {
      await driver!.get(
        "http://10.34.0.149:6060/iframe.html?selectedKind=Button&selectedStory=playground"
      );
      await driver!.wait(until.elementLocated(By.id("test-element")));
      const text = await driver!
        .findElement(By.id("test-element"))
        .findElement(By.tagName("button"))
        .getText();
      // driver!.findElement(By.id("test-element")).takeScreenshot();
      // // diff?
      // console.log(text);
      // // @ts-ignore
      // console.log(
      //   // @ts-ignore
      //   this.test.title,
      //   // @ts-ignore
      //   this.test.parent.title,
      //   // @ts-ignore
      //   this.test.parent.parent.title
      // );
      expect(text).to.equal("Hello", "Expected one to equal two.");
    });
  });
});

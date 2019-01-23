import { expect } from "chai";
import { By } from "selenium-webdriver";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import addContext from "mochawesome/addContext";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

describe("Input", function() {
  describe("Inputs with different states", function() {
    it.skip(["firefox", "ie11"], "should have expected text", async function() {
      // const text = await this.browser.findElement(By.css("button")).getText();

      const imagePath = join(__dirname, "../report/image");
      // const orig = PNG.sync.read(readFileSync(`${imagePath}-orig.png`));
      // const diff = new PNG({ width: orig.width, height: orig.height });
      const base64String = await this.browser
        .findElement(By.css("#test-element"))
        .takeScreenshot();
      // const actual = PNG.sync.read(Buffer.from(base64String, "base64"));
      const actual = Buffer.from(base64String, "base64");

      // pixelmatch(orig.data, actual.data, diff.data);

      // writeFileSync(`${imagePath}-actual.png`, actual.data);
      // writeFileSync(`${imagePath}-diff.png`, diff.data);
      writeFileSync(`${imagePath}.png`, actual);

      addContext(this, `file://${imagePath}.png`);

      // expect(text).to.equal("Hello");
    });
  });

  // describe.skip(["chrome"], "playground", function() {
  //   it("should have expected text", async function() {
  //     const text = await this.browser.findElement(By.css("button")).getText();

  //     expect(text).to.equal("Hello");
  //   });
  // });
});

// selector -> screenshot -> readFile -> compare -> save for report

// How update?

// // expect assertion
// const element = await this.browser.findElement("selector");

// expect(element.capture()).to.matchImage("image name 1");

// await element.click("another selector");

// expect(element.capture("selector")).to.matchImage("image name 2");

// // gemini/hermione style
// this.browser
//   .getElement("selector")
//   .assertView("image name 1")
//   .click("another selector")
//   .assertView("image name 2", "selector");

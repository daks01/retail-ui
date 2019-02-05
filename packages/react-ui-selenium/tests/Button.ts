import { expect } from "chai";
import { By } from "selenium-webdriver";

function button() {
  it("idle", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));

    await expect(await element.takeScreenshot()).to.matchImage("idle");
  });

  it("hover", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));
    const button = await element.findElement(By.css("button"));

    await this.browser
      .actions()
      // @ts-ignore
      .move({ origin: button })
      .perform();

    await expect(await element.takeScreenshot()).to.matchImage("hover");
  });

  it("leave", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));
    const button = await element.findElement(By.css("button"));
    const body = await this.browser.findElement(By.css("body"));

    await this.browser
      .actions()
      // @ts-ignore
      .move({ origin: button })
      .move({ origin: body })
      .perform();

    await expect(await element.takeScreenshot()).to.matchImage("leave");
  });

  it("pressed", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));
    const button = await element.findElement(By.css("button"));

    await this.browser
      .actions()
      // @ts-ignore
      .move({ origin: button })
      .press()
      .perform();

    await expect(await element.takeScreenshot()).to.matchImage("pressed");

    await this.browser
      .actions()
      // @ts-ignore
      .release()
      .perform();
  });

  it("clicked", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));

    await this.browser
      .actions()
      .click(await element.findElement(By.css("button")))
      .perform();

    await expect(await element.takeScreenshot()).to.matchImage("clicked");
  });

  it("clickedOutside", async function() {
    const element = await this.browser.findElement(By.css("#test-element"));

    await this.browser
      .actions()
      .click(await element.findElement(By.css("button")))
      .click(await this.browser.findElement(By.css("body")))
      .perform();

    await expect(await element.takeScreenshot()).to.matchImage("clickedOutside");
  });
}

describe("Button", function() {
  describe("playground", button);
  describe("use link", button);
  describe("use link with icon", button);
  describe("multiline text with link button", button);
  describe("with error", button);

  describe("arrow table", function() {
    it("plain", async function() {
      const element = await this.browser.findElement(By.css("#test-element"));

      await expect(await element.takeScreenshot()).to.matchImage("idle");
    });
  });
});

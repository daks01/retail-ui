// NOTE Chai don't have right types, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/29922
export default function chaiImage({ Assertion }, utils) {
  utils.addMethod(Assertion.prototype, "matchImage", function matchImage(base64Str: string): void {
    const element: WebElement = utils.flag(this, "object");

    element.getDriver();
    // browser + kind + story + test + file
    const imagePath = join(__dirname, "../report/image");
    // const orig = PNG.sync.read(readFileSync(`${imagePath}-orig.png`));
    // const diff = new PNG({ width: orig.width, height: orig.height });
    const base64String = await this.browser.findElement(By.css("#test-element")).takeScreenshot();
    // const actual = PNG.sync.read(Buffer.from(base64String, "base64"));
    const actual = Buffer.from(base64String, "base64");
    // pixelmatch(orig.data, actual.data, diff.data);
    // writeFileSync(`${imagePath}-actual.png`, actual.data);
    // writeFileSync(`${imagePath}-diff.png`, diff.data);
    writeFileSync(`${imagePath}.png`, actual);
    addContext(this, `file://${imagePath}.png`);
  });
}

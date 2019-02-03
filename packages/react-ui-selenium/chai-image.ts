import fs, { Stats } from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import mkdirp from "mkdirp";

import config from "./config";

function getStat(filePath: string): Stats | null {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function normalizeImageSize(image: PNG, width: number, height: number): Buffer {
  const normalizedImage = new Buffer(4 * width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (x < image.width && y < image.height) {
        const j = (y * image.width + x) * 4;
        normalizedImage[i + 0] = image.data[j + 0];
        normalizedImage[i + 1] = image.data[j + 1];
        normalizedImage[i + 2] = image.data[j + 2];
        normalizedImage[i + 3] = image.data[j + 3];
      } else {
        normalizedImage[i + 0] = 0;
        normalizedImage[i + 1] = 0;
        normalizedImage[i + 2] = 0;
        normalizedImage[i + 3] = 0;
      }
    }
  }
  return normalizedImage;
}

function compareImages(expect: Buffer, actual: Buffer): Buffer {
  // TODO types
  const expectImage = PNG.sync.read(expect);
  const actualImage = PNG.sync.read(actual);

  const width = Math.max(actualImage.width, expectImage.width);
  const height = Math.max(actualImage.height, expectImage.height);

  const diffImage = new PNG({ width, height });

  let actualImageData = actualImage.data;
  if (actualImage.width < width || actualImage.height < height) {
    actualImageData = normalizeImageSize(actualImage, width, height);
  }

  let expectImageData = expectImage.data;
  if (expectImage.width < width || expectImage.height < height) {
    expectImageData = normalizeImageSize(expectImage, width, height);
  }

  pixelmatch(expectImageData, actualImageData, diffImage.data, width, height, { threshold: 0 });

  return PNG.sync.write(diffImage);
}

function saveImages(imageDir: string, imageName: string, expect: Buffer, actual: Buffer, diff: Buffer) {
  const imagePath = path.join(imageDir, `${imageName}`);

  mkdirp.sync(imageDir);
  fs.writeFileSync(`${imagePath}-expect.png`, expect);
  fs.writeFileSync(`${imagePath}-actual.png`, actual);
  fs.writeFileSync(`${imagePath}-diff.png`, diff);
}

// TODO read async?

// NOTE Chai don't have right types, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/29922
export default (context: string[]) =>
  function chaiImage({ Assertion }: any, utils: Chai.ChaiUtils) {
    utils.addMethod(Assertion.prototype, "matchImage", function matchImage(imageName: string) {
      const actualBase64: string = utils.flag(this, "object");
      const actual = Buffer.from(actualBase64, "base64");

      // context => [browser, kind, story, test]
      const expectImageDir = path.join(config.screenDir, ...context);
      const expectImageStat = getStat(path.join(expectImageDir, `${imageName}.png`));

      const reportImageDir = path.join(config.reportDir, ...context);

      if (!expectImageStat) {
        // TODO правильный месадж
        mkdirp.sync(reportImageDir);
        fs.writeFileSync(path.join(reportImageDir, `${imageName}-actual.png`), actual);
        throw new Error("Нет картинки");
      }

      // TODO если эксепшон не будет срабатывать, то можно перенести его после условия
      const expect = fs.readFileSync(expectImageDir);

      if (expectImageStat.size === actual.length) {
        if (!actual.equals(expect)) {
          throw new Error("Картинки равны по размеру, но отличаются по контенту");
        }
        return;
      }

      const diff = compareImages(expect, actual);

      saveImages(reportImageDir, imageName, expect, actual, diff);

      throw new Error("Картинки не совпадают");
    });
  };

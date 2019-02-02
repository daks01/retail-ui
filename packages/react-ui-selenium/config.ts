import path from "path";

interface Config {
  gridUrl: string;
  hostUrl: string;
  imagesPath: string;
  browsers: { [key: string]: { browserName: string } };
}

const config: Config = {
  gridUrl: "http://screen-dbg:shot@grid.testkontur.ru/wd/hub",
  hostUrl: "http://10.34.0.149:6060/iframe.html",
  imagesPath: path.join(__dirname, "images"),
  browsers: {
    chrome: { browserName: "chrome" },
    firefox: { browserName: "firefox" },
    ie11: { browserName: "internet explorer" }
  }
};

export default config;

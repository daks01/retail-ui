import path from "path";

export interface Capabilities {
  browserName: string;
}

export interface Config {
  gridUrl: string;
  address: {
    host: string;
    port: number;
    path: string;
  };
  screenDir: string;
  reportDir: string;
  browsers: { [key: string]: Capabilities };
}

const config: Config = {
  gridUrl: "http://screen-dbg:shot@grid.testkontur.ru/wd/hub",
  address: {
    host: "localhost",
    port: 6060,
    path: "/iframe.html"
  },
  screenDir: path.join(__dirname, "images"),
  reportDir: path.join(__dirname, "report"),
  browsers: {
    chrome: { browserName: "chrome" },
    firefox: { browserName: "firefox" },
    ie11: { browserName: "internet explorer" }
  }
};

export default config;

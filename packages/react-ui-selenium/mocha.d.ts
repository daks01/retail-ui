import {
  SuiteFunction,
  ExclusiveSuiteFunction,
  PendingSuiteFunction,
  Suite,
  MochaGlobals,
  Context
} from "mocha";
import { WebDriver } from "selenium-webdriver";

declare module "mocha" {
  // NOTE @types/mocha don't have `retries` method in MochaGlobals
  export interface MochaGlobals extends MochaGlobals {
    retries: (n: number) => MochaGlobals;
  }

  export interface Context extends Context {
    browser: WebDriver;
    browserName: string;
    kind: string;
    story: string;
  }

  export interface SuiteFunction extends SuiteFunction {
    (title: string, fn: (this: Suite) => void): Suite | Suite[];
    only: ExclusiveSuiteFunction;
    skip: PendingSuiteFunction;
  }

  export interface ExclusiveSuiteFunction extends ExclusiveSuiteFunction {
    (browsers: string[], title: string, fn: (this: Suite) => void): Suite;
  }

  export interface PendingSuiteFunction extends PendingSuiteFunction {
    (
      browsers: string[],
      title: string,
      fn: (this: Suite) => void
    ): Suite | void;
  }
}

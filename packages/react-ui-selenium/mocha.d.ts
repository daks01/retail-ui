import {
  SuiteFunction,
  ExclusiveSuiteFunction,
  PendingSuiteFunction,
  TestFunction,
  ExclusiveTestFunction,
  PendingTestFunction,
  Suite,
  Test,
  Func,
  AsyncFunc,
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
    (browsers: string[], title: string, fn: (this: Suite) => void):
      | Suite
      | Suite[];
  }

  export interface PendingSuiteFunction extends PendingSuiteFunction {
    (browsers: string[], title: string, fn: (this: Suite) => void):
      | Suite
      | Suite[];
  }

  export interface TestFunction extends TestFunction {
    only: ExclusiveTestFunction;
    skip: PendingTestFunction;
  }

  export interface ExclusiveTestFunction extends ExclusiveTestFunction {
    (browsers: string[], title: string, fn?: Func | AsyncFunc): Test;
  }

  export interface PendingTestFunction extends PendingTestFunction {
    (browsers: string[], title: string, fn?: Func | AsyncFunc): Test;
  }
}

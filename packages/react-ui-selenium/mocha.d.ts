import {
  SuiteFunction as C,
  ExclusiveSuiteFunction as A,
  PendingSuiteFunction as B,
  Suite,
  MochaGlobals as D
} from "mocha";
import selenium from "./selenium";

declare module "mocha" {
  // NOTE @types/mocha don't have `retries` method in MochaGlobals
  export interface MochaGlobals extends D {
    retries: (n: number) => MochaGlobals;
  }

  export interface SuiteFunction extends C {
    (title: string, fn: (this: Suite) => void): Suite;
    only: ExclusiveSuiteFunction;
    skip: PendingSuiteFunction;
  }

  export interface ExclusiveSuiteFunction extends A {
    (browsers: string[], title: string, fn: (this: Suite) => void): Suite;
  }

  export interface PendingSuiteFunction extends B {
    (
      browsers: string[],
      title: string,
      fn: (this: Suite) => void
    ): Suite | void;
  }
}

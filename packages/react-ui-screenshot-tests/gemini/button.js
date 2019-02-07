/* global gemini */

const renderStory = require("./utils").renderStory;

const testScenario = (kind, story) => {
  gemini.suite(`${kind}_${story}_idle`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("idle");
  });
  gemini.suite(`${kind}_${story}_hover`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("hover", (actions, find) => {
        actions.mouseMove(find("button"));
      });
  });
  gemini.suite(`${kind}_${story}_mouseLeave`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("mouseLeave", (actions, find) => {
        actions.mouseMove(find("button"));
        actions.mouseMove(find("body"), [0, 0]);
      });
  });
  gemini.suite(`${kind}_${story}_pressed`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("pressed", (actions, find) => {
        actions.mouseDown(find("button"));
      })
      .after((actions, find) => {
        actions.mouseUp(find("button"));
      });
  });
  gemini.suite(`${kind}_${story}_clicked`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("clicked", (actions, find) => {
        actions.click(find("button"));
      });
  });
  gemini.suite(`${kind}_${story}_clickedOutside`, suite => {
    suite
      .before(renderStory(kind, story))
      .setCaptureElements("#test-element")
      .capture("clickedOutside", (actions, find) => {
        actions.click(find("button"));
        actions.click(find("body"), 0, [1, 1]);
      });
  });
};

gemini.suite("button", suite => {
  testScenario("Button", "playground");
  testScenario("Button", "use link");
  testScenario("Button", "use link with icon");
  testScenario("Button", "multiline text with link button");
  testScenario("Button", "with error");

  suite
    .before(renderStory("Button", "arrow table"))
    .setCaptureElements("#test-element")
    .capture("plain");
});

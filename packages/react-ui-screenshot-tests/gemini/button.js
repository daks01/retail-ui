/* global gemini */

const renderStory = require("./utils").renderStory;

const testScenario = story => {
  gemini.suite("idle", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("idle");
  });
  gemini.suite("hover", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("hover", (actions, find) => {
        actions.mouseMove(find("button"));
      });
  });
  gemini.suite("mouseLeave", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("mouseLeave", (actions, find) => {
        actions.mouseMove(find("button"));
        actions.mouseMove(find("body"), [0, 0]);
      });
  });
  gemini.suite("pressed", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("pressed", (actions, find) => {
        actions.mouseDown(find("button"));
      });
  });
  gemini.suite("clicked", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("clicked", (actions, find) => {
        actions.click(find("button"));
      });
  });
  gemini.suite("clickedOutside", suite => {
    suite
      .before(story)
      .setCaptureElements("#test-element")
      .capture("clickedOutside", (actions, find) => {
        actions.click(find("button"));
        actions.click(find("body"), 0, [1, 1]);
      });
  });
};

gemini.suite("button", suite => {
  testScenario(renderStory("Button", "playground"));
  testScenario(renderStory("Button", "use link"));
  testScenario(renderStory("Button", "use link with icon"));
  testScenario(renderStory("Button", "multiline text with link button"));
  testScenario(renderStory("Button", "with error"));

  suite
    .before(renderStory("Button", "arrow table"))
    .setCaptureElements("#test-element")
    .capture("plain");
});

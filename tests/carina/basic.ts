import { EnhancedPageObject, NightwatchBrowser, NightwatchTests } from "nightwatch";
import { CarinaPage, CarinaSections } from "../page_objects/Carina";
import {
  expectAllPresent,
  expectAllNotPresent,
  expectAllVisible,
  expectAllNotVisible
} from "../utils";

type CarinaTests = NightwatchTests & { app: CarinaPage };

const tests: CarinaTests = {

  // Kinda kludgy, but this makes things work TypeScript-wise
  // We need to do this since the value get initialized in the `before` method
  app: null as unknown as (EnhancedPageObject & CarinaPage),

  before: function(browser: NightwatchBrowser): void {
    browser.globals.waitForConditionTimeout = 30000;
    this.app = browser.page.Carina();
  },

  'Navigation and loading': function() {
    this.app.navigate().waitForReady();
  },

  'Initial configuration': function(browser: NightwatchBrowser) {
    const sections = this.app.section as CarinaSections;
    app.expect.title().to.equal(this.app.props.title);
    expectAllPresent(this.app, [
      "@splashScreen",
      "@splashClose",
      "@videoDialog",
      "@infoSheet"
    ]);
    expectAllVisible(this.app, [
      "@splashScreen",
      "@splashClose",
    ]);
    expectAllNotVisible(this.app, [
      "@videoDialog",
      "@infoSheet"
    ]);
    
    browser.click("@splashClose");
    expectAllNotPresent(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);

    const topContent = sections.topContent;
    expectAllVisible(topContent, [
      "@videoIconWrapper",
      "@showHideButton",
      "@resetIconWrapper",
      "@textIconWrapper"
    ]);
  },

  after: function(browser: NightwatchBrowser) {
    browser.end();
  }
};

export default tests;

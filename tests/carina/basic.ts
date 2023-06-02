import { CarinaPage, CarinaSections } from "../page_objects/Carina";
import {
  EnhancedPageObject,
  NightwatchBrowser,
  NightwatchTests,
  WindowSize
} from "nightwatch";

import { assert } from "chai";

import {
  expectAllNotPresent,
  expectAllVisible,
} from "../utils";

type CarinaTests = NightwatchTests & { app: CarinaPage; sections: CarinaSections };

const tests: CarinaTests = {

  // Kinda kludgy, but this makes things work TypeScript-wise
  // We need to do this since the value get initialized in the `before` method
  app: null as unknown as (EnhancedPageObject & CarinaPage),
  sections: null as unknown as CarinaSections,

  before: function(browser: NightwatchBrowser): void {
    browser.globals.waitForConditionTimeout = 30000;
    this.app = browser.page.Carina();
    this.sections = this.app.section as CarinaSections;
  },

  'Navigation and loading': function() {
    this.app.navigate().waitForReady();
  },

  'Initial configuration': function() {
    app.expect.title().to.equal(this.app.props.title);
    expectAllVisible(this.app, [
      "@splashScreen",
      "@splashClose",
    ]);
    expectAllNotPresent(this.app, [
      "@videoDialog",
      "@infoSheet"
    ]);

    this.app.click("@splashClose");
    expectAllNotPresent(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);

    expectAllVisible(this.sections.topContent, [
      "@videoIconWrapper",
      "@showHideButton",
      "@resetIconWrapper",
      "@textIconWrapper"
    ]);

    const bottomContent = this.sections.bottomContent;
    expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits",
    ]);

    bottomContent.expect.elements("@creditIcon").count.to.equal(bottomContent.props.creditIconCount);

  },

  'Layer buttons': function() {
    const bottomContent = this.sections.bottomContent;
    bottomContent.click("@hubbleButton");
    bottomContent.expect.element("@slider").value.to.equal("0");

    bottomContent.click("@jwstButton");
    bottomContent.expect.element("@slider").value.to.equal("100");

    const topContent = this.sections.topContent;
    topContent.click("@showHideButton");
    
    expectAllNotPresent(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider"
    ]);
    bottomContent.expect.element("@credits").to.be.visible;

    topContent.click("@showHideButton");
    expectAllVisible(bottomContent, [
      "@tools",
      "@hubbleButton",
      "@jwstButton",
      "@slider",
      "@credits"
    ]);
  },

  'Open video': function() {
    this.sections.topContent.click("@videoIconWrapper");
    this.app.expect.element("@videoDialog").to.be.visible;
    expectAllVisible(this.sections.videoDialog, [
      "@video", "@closeIcon",
    ]);

    this.sections.videoDialog.click("@closeIcon");
    this.app.expect.element("@videoDialog").to.not.be.present;
  },

  'Info text': function(browser: NightwatchBrowser) {
    this.sections.topContent.click("@textIconWrapper");
    this.app.expect.element("@infoSheet").to.be.visible;

    const infoSheet = this.sections.infoSheet;
    expectAllVisible(infoSheet, [
      "@closeIcon",
      "@infoTabHeader",
      "@wwtTabHeader",
      "@infoText"
    ]);
    infoSheet.expect.element("@wwtText").to.not.be.present;
    infoSheet.expect.elements("@tabHeader").count.to.equal(infoSheet.props.tabCount);
    
    // getWindowSize seems to return the height of the browser
    // (that is, including the tab and address bars)
    // but we want just the height of the viewport
    this.app.getElementSize("html", (windowSize) => {
      this.app.getElementSize("@mainContent", (mainContentSize) => {
        const wsize = windowSize.value as WindowSize;
        const csize = mainContentSize.value as WindowSize;
        assert(Math.round(csize.height - 0.66 * wsize.height) < 2);
        browser.assert.equal(wsize.width, csize.width);
      });
    });

    infoSheet.click("@wwtTabHeader");
    infoSheet.expect.element("@infoText").to.be.present;
    infoSheet.expect.element("@infoText").to.not.be.visible;

    infoSheet.click("@infoTabHeader");
    infoSheet.expect.element("@wwtText").to.be.present;
    infoSheet.expect.element("@wwtText").to.not.be.visible;
  },

  after: function(browser: NightwatchBrowser) {
    browser.end();
  }
};

export default tests;

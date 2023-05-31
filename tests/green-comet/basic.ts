import { GreenCometPage, GreenCometSections } from "../page_objects/GreenComet";
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
  hasClass
} from "../utils";

type GreenCometTests = NightwatchTests & { app: GreenCometPage; sections: GreenCometSections };

const tests: GreenCometTests = {

  app: null as unknown as (EnhancedPageObject & GreenCometPage),
  sections: null as unknown as GreenCometSections,

  before: function(browser: NightwatchBrowser): void {
    browser.globals.waitForConditionTimeout = 30000;
    this.app = browser.page.GreenComet();
    this.sections = this.app.section as GreenCometSections;
  },

  'Navigation and loading': function() {
    this.app.navigate().waitForReady();
  },

  'Initial configuration': function() {
    app.expect.title().to.equal(this.app.props.title);
    expectAllVisible(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);
    expectAllNotPresent(this.app, [
      "@videoDialog",
      "@locationDialog",
      "@infoSheet"
    ]);

    this.app.click("@splashClose");
    expectAllNotPresent(this.app, [
      "@splashScreen",
      "@splashClose"
    ]);

    expectAllVisible(this.sections.topContent, [
      "@videoIconWrapper",
      "@textIconWrapper",
      "@mapIconWrapper"
    ]);

    const bottomContent = this.sections.bottomContent;
    expectAllVisible(bottomContent, [
      "@playPauseIconWrapper",
      "@slider"
    ]);

    bottomContent.expect.elements("@creditIcon").count.to.equal(bottomContent.props.creditIconCount);
    
    const folderView = this.sections.folderView;
    folderView.expect.elements("@folderItem").count.to.equal(folderView.props.folderImageCount);
    folderView.expect.element("@expandHeader").text.to.match(folderView.props.expandedHeaderText);
    folderView.expect.element("@expandChevron").to.have.attribute("data-icon", "chevron-up");

    const controls = this.sections.controls;
    controls.expect.element("@openCloseButton").to.have.attribute("data-icon", "chevron-down");
    controls.expect.element("@gridInput").to.be.selected;
    controls.expect.element("@constellationsInput").to.not.be.selected;
    controls.expect.element("@horizonInput").to.not.be.selected; 

    controls.expect.element("@selectedLocationTimeLabel").text.to.match(controls.props.selectedLocationTimeText);
    controls.expect.element("@centerOnNowButtonContent").text.to.match(controls.props.centerOnNowText);
    controls.expect.element("@playCometImagesContent").text.to.match(controls.props.playCometImagesText);

    expectAllVisible(controls, [
      "@topRow", "@openCloseButton",
      "@gridCheckbox", "@constellationsCheckbox", "@horizonCheckbox",
      "@selectedLocationTimeLabel", "@selectedLocationTimeInput",
      "@timeIcon", "@centerOnNowButton", "@playCometImagesButton"
    ]);
  },

  'Open video': function() {
    this.sections.topContent.click("@videoIconWrapper");
    this.app.expect.element("@videoDialog").to.be.visible;
    expectAllVisible(this.sections.videoDialog, [
      "@video", "@closeIcon"
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

    infoSheet.click("@closeIcon");
    this.app.expect.element("@infoSheet").to.not.be.present;
  },

  'Location selector': function() {
    this.sections.topContent.click("@mapIconWrapper");
  
    const locationDialog = this.sections.locationDialog;
    expectAllVisible(locationDialog, [
      "@useMyLocationButton",
      "@mapContainer"
    ]);
    locationDialog.expect.element("@useMyLocationButtonContent").text.to.match(locationDialog.props.useMyLocationText);
    locationDialog.expect.element("@actionText").text.to.match(locationDialog.props.actionText);

    browser.sendKeys("html", browser.Keys.ESCAPE); 
    this.app.expect.element("@locationDialog").to.not.be.present;
  },

  'Folder View': function() {
    const folderView = this.sections.folderView;
    folderView.click("@expandRow");
    folderView.expect.elements("@folderItem").count.to.equal(0);
    folderView.expect.element("@expandHeader").text.to.match(folderView.props.contractedHeaderText);
    folderView.expect.element("@expandChevron").to.have.attribute("data-icon", "chevron-down");

    folderView.click("@expandRow");
    folderView.expect.elements("@folderItem").count.to.equal(folderView.props.folderImageCount);
    folderView.expect.element("@expandHeader").text.to.match(folderView.props.expandedHeaderText);
    folderView.expect.element("@expandChevron").to.have.attribute("data-icon", "chevron-up");
  },

  'Control Panel': function() {
    const controls = this.sections.controls;

    controls.click("@openCloseButton");
    controls.expect.element("@openCloseButton").to.have.attribute("data-icon", "gear");
    expectAllNotPresent(controls, [
      "@gridInput", "@constellationsInput", "@horizonInput",
      "@selectedLocationTimeLabel", "@selectedLocationTimeInput",
      "@timeIcon", "@centerOnNowButton", "@playCometImagesButton"
    ]);

    controls.click("@openCloseButton");
    controls.expect.element("@openCloseButton").to.have.attribute("data-icon", "chevron-down");
    expectAllVisible(controls, [
      "@topRow", "@openCloseButton",
      "@gridCheckbox", "@constellationsCheckbox", "@horizonCheckbox",
      "@selectedLocationTimeLabel", "@selectedLocationTimeInput",
      "@timeIcon", "@centerOnNowButton", "@playCometImagesButton"
    ]);
    
  },

  after: function(browser: NightwatchBrowser) {
    browser.end();
  }
};

export default tests;

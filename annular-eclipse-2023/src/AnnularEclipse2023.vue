<template>
<v-app
  id="app"
  :style="cssVars"
>

  <!-- Top content box with map, location, time, and option icons -->
  <v-container id="guided-content-container" v-if="showGuidedContent">
    <div id="close-guided-content-container">
      <font-awesome-icon
        v-model="showGuidedContent"
        size="xl"
        class="ma-1"
        :color="accentColor"
        :icon="`square-xmark`"
        @click="() => {
          console.log('showGuidedContent = ', showGuidedContent);
          showGuidedContent = !showGuidedContent;
          onResize();
        }"
        @keyup.enter="showGuidedContent = !showGuidedContent"
        tabindex="0"
        tooltip-location="start"
      /> 
    </div>
    <v-row>
      <v-col cols="6" id="non-map-container">
        <v-row id="title-row" class="non-map-row">
          <v-col>
            <div id="title">
              <span v-if="learnerPath=='Explore'"
                >Watch and Compare
              </span>
              <span v-if="learnerPath=='Answer'"
                >Identify Eclipse Path
              </span>
              <span v-if="learnerPath=='Choose'"
                >Choose Any Location
              </span>
            </div>
          </v-col>
        </v-row>
        <v-row id="instructions-row" class="non-map-row">
          <v-col id="top-container-main-text">
            <!-- Learn Path -->
            <div class="instructions-text" v-if="learnerPath=='Explore'">
              <span class="description">
                <p>Click <font-awesome-icon icon="play" size="l" class="bullet-icon"/> to "watch" the eclipse in Albuquerque, NM.</p>
                <p>Click highlighted cities on the map to switch locations and view the eclipse from there.</p>
                <p>Explore until you can identify which locations will see an annular eclipse.</p>
              </span>
            </div>
            
            <div class="instructions-text" v-if="learnerPath=='Answer'">
              <span class="description">
                <p>Have you determined the eclipse path? Click to select it.</p>
                <p>If you are not sure, click <font-awesome-icon icon="rocket" class="bullet-icon"/> to keep exploring.</p>
              </span>
            </div>
            
            <!-- Choose Path -->
            <div class="instructions-text" v-if="learnerPath=='Choose'">
              <span class="description">
                <p>Select any location you like by double-{{ touchscreen ? "tapping" : "clicking" }} on the map, and view the eclipse from there.</p>
                <p>You can create a url that shares the view from a location by clicking <font-awesome-icon icon="share-nodes" class="bullet-icon"/>.</p>
              </span>
            </div>
          </v-col>
        </v-row>
        <v-row id="button-row" class="non-map-row">
          <!-- <v-col> -->
            <div id="top-container-buttons">
              <icon-button
                :model-value="learnerPath == 'Explore'"
                fa-icon="rocket"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="'View eclipse from multiple locations'"
                :tooltip-location="'bottom'"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Explore'}"
              ></icon-button>
              <icon-button
                :model-value="learnerPath == 'Choose'" 
                fa-icon="location-dot"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="'Choose any viewing location'"
                :tooltip-location="'bottom'"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Choose'}"
              ></icon-button>
              <icon-button
                :model-value="learnerPath == 'Answer'"
                fa-icon="puzzle-piece"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="'Identify eclipse path'"
                :tooltip-location="'bottom'"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Answer'}"
              ></icon-button>   
              <icon-button
                v-model="showInfoSheet"
                fa-icon="book-open"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showInfoSheet ? 'Hide Info' : 'More on Eclipses'"
                :tooltip-location="'bottom'"
                :box-shadow="false"
              ></icon-button>
              <icon-button
                v-model="showWWTGuideSheet"
                fa-icon="computer-mouse"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showWWTGuideSheet ? 'Hide Info' : 'User Guide'"
                :tooltip-location="'bottom'"
                :box-shadow="false"
              ></icon-button>
            </div>
          <!-- </v-col> -->
        </v-row>
      </v-col>
      <v-col cols="6" id="map-column">
        <div id="map-container" >
          <location-selector
            v-if="learnerPath == 'Explore'"
            :model-value="locationDeg"
            @place="(place: typeof places[number]) => updateLocation(place.name)"
            :detect-location="false"
            :map-options="presetMapOptions"
            :places="places"
            :initial-place="places.find(p => p.name === 'selectedLocation')"
            :place-circle-options="placeCircleOptions"
            :selected-circle-options="selectedCircleOptions"
            :selectable="false"
            class="leaflet-map"
          ></location-selector>

          <span v-if="learnerPath=='Answer'">
            <img alt="CosmicDS Logo" src="../../assets/EclipseMapPaths.png"/>
          </span>

          <location-selector
            v-if="learnerPath == 'Choose'"
            :model-value="locationDeg"
            @update:modelValue="updateLocationFromMap"
            :detect-location="false"
            :map-options="userSelectedMapOptions"
            :selected-circle-options="selectedCircleOptions"
            class="leaflet-map"
          ></location-selector>
        </div>
      </v-col>
    </v-row>
  </v-container>
  <div v-if="!showGuidedContent" id="closed-top-container">
    <font-awesome-icon
      v-model="showGuidedContent"
      size="lg"
      class="ma-1"
      :color="accentColor"
      :icon="`gear`"
      @click="() => {
        console.log('showGuidedContent = ', showGuidedContent);
        showGuidedContent = !showGuidedContent;
        onResize();
      }"
      @keyup.enter="showGuidedContent = !showGuidedContent"
      tabindex="0"
      tooltip-location="start"
    /> 
  </div>
  
  

    <v-dialog
      scrim="false"
      transition="slide-y-transition"
      v-model="showInfoSheet" 
      class='bottom-sheet'
      id="text-bottom-sheet"
      :style="cssVars"
    >
      <v-card
        class="bottom-sheet-card">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="accentColor"
          :slider-color="accentColor"
          id="tabs"
          dense
          grow
        >
          <v-tab tabindex="0"><h3 class="tab-title">Information</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showInfoSheet = false"
          @keyup.enter="showInfoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-row>
            <v-col cols="6" id="info-text-box">
              <div id="main-info-text">
                <p>
                Get ready, North America, for not one, but two solar eclipses! On October 14, 2023, North, Central, and South America will be treated to a beautiful annular eclipse. Only 6 months later, on April 8, 2024, an awe-inspiring total solar eclipse will stretch from coast-to-coast across the United States and Canada.
                </p>
                <p>
                This interactive lets you explore the October "Ring of Fire" eclipse from different locations. 
                </p>
                <p id="safety-warning">
                  SAFETY FIRST: NEVER look directly at the Sun without proper eye protection.
                </p>
              </div>  
                <div id="FAQ">
                  <details>
                    <summary>
                      What causes Solar Eclipses?
                    </summary>
                    <p>
                      A solar eclipse happens when the Moon passes between the Earth and the Sun and blocks the Sun from our view. Partial eclipses occur about every 6 months, somewhere on the Earth. The U.S. is lucky to be in the path of the next two solar eclipses. 
                    </p>
                  </details>
                  
                  <details>
                    <summary> Total vs. Annular Eclipse</summary>
                    <p>
                      During a total eclipse, the Moon covers the entire face of the Sun. Because the Moon doesn't orbit the Earth in a perfect circle, sometimes it is farther away from Earth and appears smaller. When this happens, the Moon doesn't cover the entire face of the Sun, and during the eclipse we can still see a bright ring of light around the Moon. This is called an Annular Eclipse.
                    </p>
                  </details>
                  
                  <details> 
                    <summary> Why can only some places see the eclipse?</summary>
                    <p>
                      An eclipse is caused by the Moon casting a shadow on the Earth. People who are directly behind the Moon will see an annular or total eclipse. As the Moon moves in its orbit around Earth, and as Earth rotates, the location of the shadow will move, sweeping out a path across the surface of the Earth. For a larger number of people who are not directly behind the moon, a smaller amount of the Sun will be blocked, causing a partial eclipse. Even further outside the shadow the Sun will not be blocked at all, and there will be no eclipse visible.
                    </p>
                    <p> 
                      The figure shows the parts of Earth that are directly behind the Moon (in the darkest shadow) and partially behind the moon (in the lighter shadow).
                    </p> 
                  </details>
                </div>
            </v-col>
            <v-col cols="6">
              <figure>
                <!-- <v-img src="https://www.nasa.gov/sites/default/files/thumbnails/image/tsis_eclipse-1.gif"></v-img> -->
                <gif-play-pause startPaused :gif='require("./assets/eclipse.gif")' :still='require("./assets/eclipse_static.gif")' alt="Cartoon of a Solar Eclipse"/>
                <figcaption>Image credit: NASA Goddard / Katy Mersmann</figcaption>
              </figure>
            </v-col>
          </v-row>
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>
    
    <v-dialog
      scrim="false"
      transition="slide-y-transition"
      v-model="showWWTGuideSheet" 
      class='bottom-sheet'
      id="wwt-guide-sheet"
      :style="cssVars"
    >
      <v-card
        class="bottom-sheet-card">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="accentColor"
          :slider-color="accentColor"
          id="tabs"
          dense
          grow
        >
          <v-tab tabindex="0"><h3 class="tab-title">User Guide</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showWWTGuideSheet = false"
          @keyup.enter="showWWTGuideSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-container>
              <v-row align="center">
              <v-col cols="4">
                  <v-chip
                    label
                    outlined
                  >
                    Pan
                  </v-chip>
                </v-col>
                <v-col cols="8" class="pt-1">
                  <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? ":" : "or" }}  <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                </v-col>
              </v-row>
              <v-row align="center">
                <v-col cols="4">
                  <v-chip
                    label
                    outlined
                  >
                    Zoom
                  </v-chip>
                </v-col>
                <v-col cols="8" class="pt-1">
                  <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":" : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div
                      style="min-height: 120px;"
                  >
                    <p>
                      This Mini Data Story allows you to display the October 14, 2023 Annular Eclipse from any location. 
                    </p>
                    
                    <h4 class="user-guide-header">Time Controls:</h4>
                    <p  class="mb-3">(See bottom-left of the screen)</p>
                    <ul class="text-list">
                      <li>
                        Click <font-awesome-icon
                              class="bullet-icon"
                              icon="play"
                              size="lg" 
                            ></font-awesome-icon>
                        to move time forward at 1000x the real speed.
                      </li>
                      <li>
                        If playing, click <font-awesome-icon
                              class="bullet-icon"
                              icon="pause"
                              size="lg" 
                            ></font-awesome-icon>
                        to pause time.
                      </li>
                      <li>
                        Click <font-awesome-icon
                              class="bullet-icon"
                              icon="angle-double-down"
                              size="lg" 
                            ></font-awesome-icon>
                        to decrease speed by 10x.                        
                      </li>
                      <li>
                        Click <font-awesome-icon
                              class="bullet-icon"
                              icon="angle-double-up"
                              size="lg" 
                            ></font-awesome-icon>
                        to increase speed by 10x. 
                      </li>
                      <li>
                        You can also control time by dragging <v-icon
                          class="bullet-icon"
                          icon="mdi-circle"
                          size="medium" 
                        ></v-icon> along the slider.
                      </li>
                    </ul>

                    <v-divider thickness="2px" class="solid-divider"></v-divider>
                    
                    <h4 class="user-guide-header">Viewing Mode:</h4>
                    <p  class="mb-3">(See upper-right of the screen)</p>
                    <ul class="text-list">
                      <li>
                        The <span 
                        style="color: blue; background-color: white;
                        padding-inline: 0.7em;
                        border-radius: 20px;
                        font-weight: bold ">selected location</span> is displayed under the map.
                      </li>
                      <li>
                        <v-icon
                          class="bullet-icon"
                          icon="mdi-telescope"
                          size="large" 
                        ></v-icon> <span class="user-guide-emphasis">Solar Scope:</span> Display zoomed in Sun and Moon as through a dark solar filter or eclipse glasses.
                      </li>
                      <li>
                        <v-icon
                          class="bullet-icon"
                          icon="mdi-image-filter-hdr"
                          size="large" 
                        ></v-icon> <span class="user-guide-emphasis">Horizon:</span> Display motion of Sun and Moon as they travel through the sky relative to the ground.
                      </li>
                      <li>
                        <v-icon
                          class="bullet-icon"
                          icon="mdi-white-balance-sunny"
                          size="large" 
                        ></v-icon> <span class="user-guide-emphasis">Track Sun:</span> Always keep camera centered on Sun.
                      </li>
                      <li>
                        <v-icon
                          class="bullet-icon"
                          icon="mdi-image"
                          size="large" 
                        ></v-icon> <span class="user-guide-emphasis">Don't Track Sun:</span> In Horizon View, show motion of Sun (and Moon) against the sky.
                      </li>
                    </ul>

                    <v-divider thickness="2px" class="solid-divider"></v-divider>
                    
                    <h4 class="user-guide-header">Display Options:</h4>
                    <p  class="mb-3">(See bottom-right of the screen)</p>
                    <ul class="text-list">
                      <li>
                        <span class="user-guide-emphasis-white">Sky Grid:</span> Display altitude/azimuth grid with cardinal directions.
                      </li>
                      <li>
                        <span class="user-guide-emphasis-white">Ecliptic:</span> Display path on sky that Sun appears to travel throughout a year.
                      </li>
                      <li>
                        <span class="user-guide-emphasis-white">Horizon:</span> Display a virtual "ground" that delineates where the Sun rises and sets.                     
                      </li>
                      <li>
                        <span class="user-guide-emphasis-white">Visible Moon:</span> Solar Eclipses occur during a New Moon, when the Moon is not normally visible in the sky. This option makes it easier to see the Moon against the sky.                     
                      </li>
                    </ul>

                  </div>
                          

                  <p class="mt-5">This Mini Data Story is powered by WorldWide Telescope (WWT).</p>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div class="credits">
                  <h3>Credits:</h3>
                  <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4>
                  Pat Udomprasert<br>
                  Jon Carifio<br>
                  John Lewis<br>
                  Alyssa Goodman<br>
                  Mary Dussault<br>
                  Harry Houghton<br>
                  Anna Nolin<br>
                  Evaluator: Sue Sunbury<br>
                  <br>
                  <h4>WorldWide Telescope Team:</h4>
                  Peter Williams<br>
                  A. David Weigel<br>
                  Jon Carifio<br>
                  </div>
                  <v-spacer class="end-spacer"></v-spacer>
                </v-col>
              </v-row>
            </v-container>              
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>


  <div
    id="main-content"
  >
    <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>
    <div>
      <div v-if="selectedLocation === 'User Selected'" id="share-button-wrapper">
        <icon-button
          id="share"
          fa-icon="share-nodes"
          :color="accentColor"
          :focus-color="accentColor"
          background-color="transparent"
          :box-shadow="false"
          tooltip-text="Share view of this location"
          @activate="copyShareURL"
        ></icon-button>
      </div>
    </div>
    
    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      :style="cssVars"
      id="splash-overlay"
    >
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
      <div
          id="first-splash-row"
        >
          <div
            id="close-splash-button"
            @click="closeSplashScreen"
            >&times;</div>
          <div id="splash-screen-text">
            <p>WATCH the October </p>
            <p class="highlight"> Annular Eclipse </p>
          </div>
        </div>
        
        <div id="splash-screen-guide">
          <v-row>
            <v-col cols="12">
              <font-awesome-icon
                icon="rocket"
              /> Explore the view 
            </v-col>
            <v-col cols="12">
              <font-awesome-icon
                icon="puzzle-piece"
              /> Identify the path 
            </v-col>
            <v-col cols="12">
              <font-awesome-icon
                icon="location-dot"
              /> Choose any location 
            </v-col>
            <v-col cols="12">
              <font-awesome-icon
                icon="book-open"
              /> Learn more 
            </v-col>
        </v-row>
        </div>
        
        <div id="splash-screen-acknowledgements">
          This Mini Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-icons">
            <mini-credits/>
          </div>
        </div>
      </div>
    </v-overlay>

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>

  <!-- Opening Dialog Sequence -->

    <v-dialog
      v-model="inIntro"
      :style="cssVars"
      :scrim="false"
      :persistent="false"
      >
      <div v-if="inIntro" id="introduction-overlay" class="elevation-10">
        <v-window v-model="introSlide">
          <v-window-item :value="1">
            <div class="intro-text">
              <p class="mb-5">
              On October 14, 2023, the Americas will experience
              a partial solar eclipse, where the Moon 
              will appear to travel across the Sun and 
              block a portion of it.
              </p>
              <p  class="mb-5">
              A lucky segment of the U.S., Central, and South America will experience a dazzling <b>"Ring of Fire"</b> created by an <b>annular eclipse</b>.
              </p>
              <p class="mb-5">
              Use your detective skills to identify where those lucky people are in our map quiz.
              </p>
            </div>
          </v-window-item>
          
          <v-window-item :value="2">
            <div class="intro-text mb-3">
              <p class="mb-3">
                In this interactive page you can:
              </p>
              
              <ul
              >
                <v-list-item>
                  <template v-slot:prepend>
                    <font-awesome-icon icon="rocket" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Explore what the eclipse will look like from different parts of the U.S.
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <font-awesome-icon icon="puzzle-piece" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Identify the Path of Visibility in the U.S. for the annular eclipse in our map quiz
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <font-awesome-icon icon="location-dot" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Choose any location around the world and see how the eclipse would look from there
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <font-awesome-icon icon="book-open" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Learn more about solar eclipses 
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <font-awesome-icon icon="computer-mouse" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Learn more about how to navigate this app 
                </v-list-item>
              </ul>
            </div>
          </v-window-item>
        </v-window>

        <div id="intro-bottom-controls">
          <div>
            <v-btn
              v-if="introSlide > 1"
              id="intro-next-button"
              :color="accentColor"
              @click="introSlide--"
              @keyup.enter="introSlide--"
              elevation="0"
              >
              Back
            </v-btn>
          </div>
          
          <v-btn
            id="intro-next-button"
            :color="accentColor"
            @click="introSlide++"
            @keyup.enter="introSlide++"
            elevation="0"
            >
            {{ introSlide === 1 ? 'Next' : 'Get Started' }}
          </v-btn>
        </div>
      </div>
    </v-dialog>
  
  <div id="top-wwt-content">
      <div id="location-date-display">
        <v-chip 
          prepend-icon="mdi-map-marker-radius"
          variant="outlined"
          size="small"
          elevation="2"
          :text="selectedLocationText"
          @click="() => {
            showGuidedContent = true; 
            learnerPath = 'Choose'
            }"
        > </v-chip>
        <v-chip 
          prepend-icon="mdi-calendar"
          variant="outlined"
          size="small"
          elevation="2"
          :text="selectedLocalDateString"
        > </v-chip>
      </div>
      <div id="top-switches">
        <v-tooltip
            location="left"
            :color="accentColor"
            :style="cssVars"
          >
          <template v-slot:activator="{props}">
            <div 
              v-bind="props"
              id="viewer-mode-switch"
              >
              <v-switch
                inset
                hide-details
                :ripple="false"
                v-model="viewerMode"
                :color="accentColor"
                false-value="SunScope"
                false-icon="mdi-telescope"
                true-value="Horizon"
                true-icon="mdi-image-filter-hdr"
              >
              </v-switch>
            
            </div>
          </template>
          Switch to {{ viewerMode === 'SunScope' ? 'Horizon' : 'Eclipse Scope' }} View
        </v-tooltip>

        <div id="track-sun-switch"> 
          <v-tooltip
              location="left"
              :color="accentColor"
              :style="cssVars"
            >
            <template v-slot:activator="{props}">
              <div 
                v-bind="props"
              >
                <v-switch
                  inset
                  hide-details
                  v-model="toggleTrackSun"
                  :ripple="false"
                  :color="accentColor"
                  true-icon="mdi-white-balance-sunny"
                  false-icon="mdi-image"
                >
                </v-switch>
                
              </div>
            </template>
            {{ toggleTrackSun ? "Don't Track Sun" : 'Center on Sun' }}
          </v-tooltip>
        </div>
      </div>
    </div>
    
    <div class="bottom-content">
      <div
        id="controls"
        class="control-icon-wrapper"
      >
        <div id="controls-top-row">
          <font-awesome-icon
            size="lg"
            :color="accentColor"
            :icon="showControls ? `chevron-down` : `gear`"
            @click="showControls = !showControls"
            @keyup.enter="showControls = !showControls"
            tabindex="0"
          /> 
        </div>
        <transition-expand>
          <div v-if="showControls" id="control-checkboxes">
            <v-checkbox
              :color="accentColor"
              v-model="showAltAzGrid"
              @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Sky Grid"
              hide-details 
            />
            <v-checkbox
              :color="accentColor"
              v-model="showEcliptic"
              @keyup.enter="showEcliptic = !showEcliptic"
              label="Ecliptic"
              hide-details
            />
            <v-checkbox
              :color="accentColor"
              v-model="showHorizon"
              @keyup.enter="showHorizon = !showHorizon"
              label="Horizon"
              hide-details
            />
          <v-checkbox
              :color="accentColor"
              v-model="useRegularMoon"
              @keyup.enter="useRegularMoon = !useRegularMoon"
              label="Visible Moon"
              hide-details
            />
          </div>
        </transition-expand>
      </div>

      <div id="tools">
        <span class="tool-container">
          <div id="speed-control">
            <icon-button
              id="play-pause-icon"
              :fa-icon="!(playing) ? 'play' : 'pause'"
              @activate="() => {
                playing = !(playing);
              }"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="Play/Pause"
              tooltip-location="top"
              tooltip-offset="5px"
            ></icon-button>
            <icon-button
              id="speed-down"
              :fa-icon="'angle-double-down'"
              @activate="() => {
                    speedIndex -= 1;
                    playbackRate = Math.pow(10, speedIndex);
                    playing = true;
                  }"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="10x slower"
              tooltip-location="top"
              tooltip-offset="5px"
            ></icon-button>
            <icon-button
              id="speed-up"
              :fa-icon="'angle-double-up'"
              @activate="() => {
                    speedIndex += 1;
                    playbackRate = Math.pow(10, speedIndex);
                    playing = true;
                  }"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="10x faster"
              tooltip-location="top"
              tooltip-offset="5px"
            ></icon-button>
            <div id="speed-text">
              Time rate: 
              <span v-if="playbackRate===1 && playing">
                Real time
              </span>
              <span v-if="playbackRate!=1 && playing">
                {{ playbackRate }}&times;
              </span>
              <span v-if="!playing">
                Paused
              </span>
            </div>
          </div>
          <v-slider
            id="slider"
            v-model='selectedTime'
            :max="maxTime"
            :min="minTime"
            :color="accentColor"
            :ripple="false"
            hide-details
            track-size="4px"
            thumb-size="14px"
            thumb-label="always"
            :step="millisecondsPerInterval"
            >
            <template v-slot:thumb-label="item">
              {{ toTimeString(new Date(item.modelValue)) }}
            </template>
          </v-slider>
          <!-- <icon-button
            id="set-time-now-button"
            @activate="() => {
              selectedTime = times.reduce((a, b) => {
                return Math.abs(b - Date.now()) < Math.abs(a - Date.now()) ? b : a;
              });
              playing = !(playing);
            }"
            :color="accentColor"
            tooltip-text="Go to current time"
            tooltip-location="top"
            tooltip-offset="5px"
          >
            <template v-slot:button>
              Now
            </template>
          </icon-button> -->
        </span>      
      </div>
      <div id="credits" class="ui-text">
        <div id="icons-container">
          <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer"
            ><img alt="CosmicDS Logo" src="../../assets/cosmicds_logo_for_dark_backgrounds.png"
          /></a>
          <a href="https://worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer"
            ><img alt="WWT Logo" src="../../assets/logo_wwt.png"
          /></a>
          <a href="https://science.nasa.gov/learners" target="_blank" rel="noopener noreferrer" class="pl-1"
            ><img alt="SciAct Logo" src="../../assets/logo_sciact.png"
          /></a>
          <a href="https://nasa.gov/" target="_blank" rel="noopener noreferrer" class="pl-1"
            ><img alt="SciAct Logo" src="../../assets/NASA_Partner_color_300_no_outline.png"
          /></a>
          <!-- <ShareNetwork
            v-for="network in networks"
            :key="network.name"
            :network="network.name"
            :class="`${network.name}-button`"
            :style="{ backgroundColor: network.color, width: 'fit-content' }"
            :description="description"
            :url="url"
            :title="title"
            :hashtags="hashtagString"
            :quote="description"
            twitter-user="WWTelescope"
          >
            <font-awesome-icon
              :class="`${network.name}-icon`"
              :icon="['fab', network.name]"
              size="lg"
            ></font-awesome-icon>
          </ShareNetwork> -->
        </div>
      </div>
    </div>

    <!-- This contains the informational content that is displayed when the book icon is clicked. -->

  <notifications group="copy-url" position="top right" />
  </div>
</v-app>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets } from "@minids/common";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Folder, Grids, LayerManager, Planets, Poly, Settings, WWTControl, Place, Texture } from "@wwtelescope/engine";
import { Annotation2, Poly2 } from "./Annotation2";

import { getTimezoneOffset, formatInTimeZone } from "date-fns-tz";
import tzlookup from "tz-lookup";

import { drawSkyOverlays, makeAltAzGridText, layerManagerDraw, updateViewParameters, renderOneFrame } from "./wwt-hacks";

type SheetType = "text" | "video" | null;
type LearnerPath = "Explore" | "Choose" | "Learn" | "Answer";
type ViewerMode = "Horizon" | "SunScope";
type MoonImageFile = "moon.png" | "moon-dark-gray-overlay.png" | "moon-sky-blue-overlay.png";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

// const startTime = new Date("2023-10-14T10:10"); 
// const finishTime = new Date("2023-10-14T11:10");

// number of milliseconds since January 1, 1970, 00:00:00 UTC
// month is indexed from 0..?!
// https://www.timeanddate.com/eclipse/solar/2023-october-14#eclipse-table
const eclipseStartTime = Date.UTC(2023, 9, 14, 15, 3); // partial eclipse starts at 15:03 UTC
const eclipseFinishTime = Date.UTC(2023, 9, 14, 20, 55); // partial eclipse ends at  20:55 UTC
const extraTime = 1000 * 60 * 60 * 5; // add 2 hours to the end time to make sure we get the full eclipse
// const minTime = Date.UTC(2023, 9, 14, 8, 0); // eclipse starts at 9:13am MT in Albuquerque
// const maxTime = Date.UTC(2023, 9, 14, 25, 30); // eclipse ends at 12:09pm MT in Albuquerque
const minTime = eclipseStartTime - extraTime;
const maxTime = eclipseFinishTime + extraTime;

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 40;
const MILLISECONDS_PER_INTERVAL = 1000 * secondsInterval;

const times: number[] = [];

let t = minTime;
while (t <= maxTime) {
  times.push(t);
  times.push(t + MILLISECONDS_PER_INTERVAL);
  t += MILLISECONDS_PER_INTERVAL;
}

// const options = { timeout: 10000, enableHighAccuracy: true };

type LocationRad = {
  longitudeRad: number;
  latitudeRad: number;
};

interface EclipseLocation extends LocationRad {
  name: string;
  eclipseFraction: number | null;
}

type LocationDeg = {
  longitudeDeg: number;
  latitudeDeg: number;
};


type EquatorialRad = {
  raRad: number;
  decRad: number;
};

type HorizontalRad = {
  altRad: number;
  azRad: number;
};

let queryData: LocationDeg | null = null;

export default defineComponent({
  extends: MiniDSBase,
  
  props: {
    wwtNamespace: {
      type: String,
      required: true
    },
    
    initialCameraParams: {
      type: Object as PropType<Omit<GotoRADecZoomParams, 'instant'>>,
      default() {
        return {
          // RA/Dec of Sun in Albuquerque close to max annularity
          raRad: 3.481,
          decRad: -0.145,
          zoomDeg: 1
        };
      },
    },
  },
  data() {
    const annularEclipseTimeNMTZ = new Date("2023-10-14T10:48");
    const _annularEclipseTimeUTC = new Date("2023-10-14T16:48:00Z");
    console.log("min/max time UTC", minTime, maxTime);
    const minutc = new Date(minTime);
    const maxutc = new Date(maxTime);
    console.log("Date(min/maxTime):", minutc, maxutc);
    console.log("min max date", minutc.toUTCString(), maxutc.toUTCString());
    console.log("date:", annularEclipseTimeNMTZ);

    const sunPlace = new Place();
    sunPlace.set_names(["Sun"]);
    sunPlace.set_classification(Classification.solarSystem);   
    sunPlace.set_target(SolarSystemObjects.sun);
    sunPlace.set_zoomLevel(20);

    const moonPlace = new Place();
    moonPlace.set_names(["Moon"]);
    moonPlace.set_classification(Classification.solarSystem);
    moonPlace.set_target(SolarSystemObjects.moon);
    const initialView = {
      initialLocation: {
        latitudeDeg: 38,
        longitudeDeg: -97
      },
      initialZoom: 3
    };

    return {
      showSplashScreen: false, // FIX later
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,

      showMapTooltip: false,
      showTextTooltip: false,
      showControls: true, 
      showMapSelector: false,
      showLocationSelector: false,

      showWWTGuideSheet: false,
      
      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,  

      // Albuquerque, NM
      timeOfDay: { hours: annularEclipseTimeNMTZ.getHours(), minutes: annularEclipseTimeNMTZ.getMinutes(), seconds: annularEclipseTimeNMTZ.getSeconds() },
      selectedTime: _annularEclipseTimeUTC.getTime(), //1697302060000,
      selectedTimezone: "America/Denver",
      location: queryData ? {
        latitudeRad: D2R * queryData.latitudeDeg,
        longitudeRad: D2R * queryData.longitudeDeg
      } : {
        latitudeRad: D2R * 35.106766,
        longitudeRad: D2R * -106.629181
      } as LocationRad,
      selectedLocation: queryData ? "User Selected" : "Albuquerque, NM",
      locationErrorMessage: "",
      
      syncDateTimeWithWWTCurrentTime: true,
      syncDateTimewithSelectedTime: true,

      presetMapOptions: {
        templateUrl: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}",
        minZoom: 1,
        maxZoom: 16,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg',
        ...initialView
      },

      userSelectedMapOptions: queryData ? { ...queryData, initialZoom: 5 } : initialView,

      eclipsePathLocations: {
        "Albuquerque, NM": {
          name: "Albuquerque, NM",
          latitudeRad: D2R * 35.106766,
          longitudeRad: D2R * -106.629181,
          eclipseFraction: 0.97
        },
        "Eugene, OR": {
          name: "Eugene, OR",
          latitudeRad: D2R * 44.052069,
          longitudeRad: D2R * -123.086754,
          eclipseFraction: .95
        },
        "San Antonio, TX": {
          name: "San Antonio, TX",
          latitudeRad: D2R * 29.434210,
          longitudeRad: D2R * -98.486798,
          eclipseFraction: .96
        },
        // "Las Vegas, NV": {
        //   name: "Las Vegas, NV",
        //   latitudeRad: D2R * 36.169941,
        //   longitudeRad: D2R * -115.139830,
        //   eclipseFraction: .87
        // },
        "Denver, CO": {
          name: "Denver, CO",
          latitudeRad: D2R * 39.739235,
          longitudeRad: D2R * -104.990250,
          eclipseFraction: .85
        },
        "Bismarck, ND": {
          name: "Bismarck, ND",
          latitudeRad: D2R * 46.806673,
          longitudeRad: D2R * -100.797396,
          eclipseFraction: .64
        },
        "Los Angeles, CA": {
          name: "Los Angeles, CA",
          latitudeRad: D2R * 34.05,
          longitudeRad: D2R * -118.24,
          eclipseFraction: .78
        },
        // "Omaha, NE": {
        //   name: "Omaha, NE",
        //   latitudeRad: D2R * 41.256538,
        //   longitudeRad: D2R * -95.934502,
        //   eclipseFraction: .68
        // },
        "Chicago, IL": {
          name: "Chicago, IL",
          latitudeRad: D2R * 41.878113,
          longitudeRad: D2R * -87.629799,
          eclipseFraction: .54
        },
        // "New York, NY": {
        //   name: "New York, NY",
        //   latitudeRad: D2R * 40.712776,
        //   longitudeRad: D2R * -74.005974,
        //   eclipseFraction: .35
        // },
        "Boston, MA": {
          name: "Boston, MA",
          latitudeRad: D2R * 42.360081,
          longitudeRad: D2R * -71.058884,
          eclipseFraction: .29
        },
        "Charlotte, NC": {
          name: "Charlotte, NC",
          latitudeRad: D2R * 35.227085,
          longitudeRad: D2R * -80.843124,
          eclipseFraction: .53
        },
        "User Selected": { // by default, user selected is Albaquerque
          name: "User Selected",
          latitudeRad: D2R * 35.106766,
          longitudeRad: D2R * -106.629181,
          eclipseFraction: 0.97
        }
      } as Record<string, EclipseLocation>,

      places: [] as (LocationRad & { name: string })[],
        
      placeCircleOptions: {
        color: "#0000FF",
        fillColor: "#0000FF",
        fillOpacity: 0.7,
        radius: 5 
      },

      selectedCircleOptions: {
        color: "#FF0000",
        fillColor: "#FF0000",
        fillOpacity: 0.7,
        radius: 5
      },

      learnerPath: (queryData ? "Choose" : "Explore") as LearnerPath,
      
      playing: false,
      playingIntervalId: null as ReturnType<typeof setInterval> | null,
      playingWaitCount: 0,

      showAltAzGrid: true,
      showHorizon: true,
      showEcliptic: false, 
      
      toggleTrackSun: true,
      
      times: times, 
      minTime: minTime,
      maxTime: maxTime,
      millisecondsPerInterval: MILLISECONDS_PER_INTERVAL,
      
      accentColor: "#ef7e3d",
      moonColor: "#CFD8DC",
      guidedContentHeight: "300px",
      showGuidedContent: true,
      inIntro: true, //FIX

      tab: 0,
      introSlide: 1,

      viewerMode: 'SunScope' as ViewerMode,

      showSky: true,
      skyColorNight: "#1F1F1F",
      skyColorLight: "#4190ED",
      skyColor: "#4190ED",
      skyOpacity: 0.6,
      horizonOpacity: 1,
      useRegularMoon: false,
      moonTexture: 'moon-sky-blue-overlay.png' as MoonImageFile,

      playbackRate: 1,
      horizonRate: 1000, //this.getplaybackRate('2 hours per 15 seconds'),
      scopeRate: 1000, //this.getplaybackRate('2 hours per 30 seconds'),
      speedIndex: 3,

      startPaused: false,

      sunPlace,
      moonPlace,

      queryData
    };
  },

  beforeCreate() {
    const searchParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lon = parseFloat(searchParams.get("lon") ?? "");
    if (lat && lon) {
      queryData = { latitudeDeg: lat, longitudeDeg: lon };
    }

  },

  created() {
    this.places = Object.entries(this.eclipsePathLocations).filter(([key, _]) => key !== "User Selected").map(([_, pl]) => {
      return {
        ...pl,
        latitudeDeg: R2D * pl.latitudeRad,
        longitudeDeg: R2D * pl.longitudeRad
      };
    });


  },

  mounted() {
    this.waitForReady().then(async () => {

      this.backgroundImagesets = [...skyBackgroundImagesets];

      console.log("initial camera params RA, Dec:", R2D * this.initialCameraParams.raRad/15, R2D * this.initialCameraParams.decRad);

      console.log(this);
      this.setTime(this.dateTime);

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);
      this.wwtSettings.set_showEcliptic(this.showEcliptic);
      this.wwtSettings.set_showEclipticOverviewText(false);

      // This is kinda horrible, but it works!

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._drawSkyOverlays = drawSkyOverlays;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Grids._makeAltAzGridText = makeAltAzGridText;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      LayerManager._draw = layerManagerDraw;      

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl._updateViewParameters = updateViewParameters.bind(this.wwtControl);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.renderOneFrame = renderOneFrame.bind(this.wwtControl);

      // Force the render of one frame so that planet textures will be loaded
      // We don't want to attach the callback before this so that we don't mess up sun tracking
      this.wwtControl.renderOneFrame();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.wwtControl.renderFrameCallback = this.onWWTRenderFrame;

      /* eslint-disable @typescript-eslint/no-var-requires */
      Planets['_planetTextures'][0] = Texture.fromUrl(require("./assets/2023-09-19-SDO-Sun.png"));
      this.setForegroundImageByName("Digitized Sky Survey (Color)");
      this.setBackgroundImageByName("Black Sky Background");
      this.setForegroundOpacity(100);
      this.updateMoonTexture(true);

      this.updateWWTLocation();
      this.setClockSync(false); // set to false to pause
      this.setClockRate(1); //

      this.playbackRate = 1;  //this.setplaybackRate('8 minutes per second'); // 500;
      
      // If there are layers to set up, do that here!
      this.layersLoaded = true;

      if (this.viewerMode == 'SunScope') {
        this.startSolarScopeMode();
      } else {
        this.startHorizonMode();
      }
      this.trackSun().then(() => this.positionSet = true);

      this.setTimeforSunAlt(10); // 10 degrees above horizon
      
      console.log("selected time", this.selectedTime);

    });

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });
  },

  computed: {

    dateTime() {
      return new Date(this.selectedTime);
    },

    selectedTimezoneOffset() {
      return getTimezoneOffset(this.selectedTimezone);
    },

    selectedLocalDateString() {
      return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MMMM dd, yyyy');
    },
    
    selectedLocaledTimeDateString() {
      return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd/yyyy HH:mm (zzz)');
    },

    ready(): boolean {
      return this.layersLoaded && this.positionSet;
    },
    isLoading(): boolean {
      return !this.ready;
    },
    selectedDate(): Date {
      return new Date(this.selectedTime);
    },
    smallSize(): boolean {
      return this.$vuetify.display.smAndDown;
    },
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--sky-color': this.skyColorLight,
        '--app-content-height': this.showInfoSheet ? '100%' : '100%',
        '--top-content-height': this.inIntro ? '0px' : (this.showGuidedContent? this.guidedContentHeight : this.guidedContentHeight),
        '--moon-color': this.moonColor,
      };
    },
    wwtControl(): WWTControl {
      return WWTControl.singleton;
    },

    wwtSettings(): Settings {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Settings.get_active();
    },
    // dontSetTime(): boolean {
    //   return this.selectedTime %MILLISECONDS_PER_DAY !== 0;
    // },
    dayFrac(): number {
      const dateForTOD = new Date();
      const timezoneOffsetHours = this.selectedTimezoneOffset / (60 * 60 * 1000);
      dateForTOD.setUTCHours(this.timeOfDay.hours - timezoneOffsetHours, this.timeOfDay.minutes, this.timeOfDay.seconds);
      const todMs = 1000 * (3600 * dateForTOD.getUTCHours() + 60 * dateForTOD.getUTCMinutes() + dateForTOD.getUTCSeconds());
      return todMs / MILLISECONDS_PER_DAY;
    },
    showInfoSheet: {
      get(): boolean {
        return this.sheet === 'text';
      },
      set(_value: boolean) {
        this.selectSheet('text');
      }
    },

    locationDeg: {
      get(): LocationDeg {
        return {
          latitudeDeg: R2D * this.location.latitudeRad,
          longitudeDeg: R2D * this.location.longitudeRad
        };
      },
      set(value: LocationDeg) {
        this.location = {
          latitudeRad: D2R * value.latitudeDeg,
          longitudeRad: D2R * value.longitudeDeg
        };
      }
    },

    tickDurationMS(): number {
      return MILLISECONDS_PER_INTERVAL / (this.playbackRate);
    },

    maxPlaybackRate(): number {
      const minDuration = 10; //min setInterval on Chrome is ~5ms
      console.log('maxPlaybackRate', MILLISECONDS_PER_INTERVAL / minDuration);
      return MILLISECONDS_PER_INTERVAL / minDuration;
    },
    
    sunPosition(): EquatorialRad & HorizontalRad {
      const sunAltAz = this.equatorialToHorizontal(this.sunPlace.get_RA() * 15 * D2R,
        this.sunPlace.get_dec() * D2R,
        this.location.latitudeRad,
        this.location.longitudeRad,
        this.dateTime);

      return {
        raRad: this.sunPlace.get_RA() * 15 * D2R,
        decRad: this.sunPlace.get_dec() * D2R,
        ...sunAltAz
      };
    },

    moonPosition(): EquatorialRad & HorizontalRad {
      const moonAltAz = this.equatorialToHorizontal(this.moonPlace.get_RA() * 15 * D2R,
        this.moonPlace.get_dec() * D2R,
        this.location.latitudeRad,
        this.location.longitudeRad,
        this.dateTime);

      return {
        raRad: this.moonPlace.get_RA() * 15 * D2R,
        decRad: this.moonPlace.get_dec() * D2R,
        ...moonAltAz
      };
    },

    sunAboveHorizon(): boolean {
      return this.sunPosition.altRad > 0;
    },


    selectedLocationText(): string {
      if (this.selectedLocation !== 'User Selected') {
        return this.selectedLocation;
      } else {
        const ns = this.locationDeg.latitudeDeg >= 0 ? 'N' : 'S';
        const ew = this.locationDeg.longitudeDeg >= 0 ? 'E' : 'W';
        const lat = Math.abs(this.locationDeg.latitudeDeg).toFixed(3);
        const lon = Math.abs(this.locationDeg.longitudeDeg).toFixed(3);
        return `${lat}° ${ns}, ${lon}° ${ew}`;
      }
    },

    trackingSun: {
      set(value: boolean) {
        this.toggleTrackSun = value;
      },
      
      get(): boolean {
        // do something more useful later
        return this.toggleTrackSun;
      }
      
    },
    defaultRate(): number {
      return this.viewerMode === 'Horizon' ? this.horizonRate : this.scopeRate;
    },

  },

  methods: {

    async trackSun(): Promise<void> {
      return this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: true,
        trackObject: true
      });
    },

    async centerSun(): Promise<void> {
      return this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: true,
        trackObject: this.trackingSun
      });
    },


    onWWTRenderFrame(wwtControl: WWTControl) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.trackingSun = wwtControl._trackingObject === this.sunPlace;
    },

    textureFromAssetImage(assetFilename: MoonImageFile): Texture {
      /* eslint-disable @typescript-eslint/no-var-requires */
      return Texture.fromUrl(require(`./assets/${assetFilename}`));
    },

    updateMoonTexture(force=false) {
      let filename: MoonImageFile = "moon.png";
      if (!this.useRegularMoon) {
        // Are we even using showSky?
        const blueMoon = (this.showHorizon && this.showSky) &&
                         this.moonPosition.altRad > 0 &&
                         this.viewerMode !== 'SunScope';
        filename = blueMoon ? 'moon-sky-blue-overlay.png' : 'moon-dark-gray-overlay.png';
      }
      if (force || (filename !== this.moonTexture && Planets._planetTextures)) {
        Planets._planetTextures[9] = this.textureFromAssetImage(filename);
        this.moonTexture = filename;
      }
    },

    clearPlayingInterval() {
      if (this.playingIntervalId !== null) {
        clearInterval(this.playingIntervalId);
        this.playingIntervalId = null;
      }
    },

    moveOneIntervalForward() {
      this.selectedTime += MILLISECONDS_PER_INTERVAL;
    },

    moveOneIntervalBackward() {
      this.selectedTime -= MILLISECONDS_PER_INTERVAL;
    },

    toUTCDateString(date: Date) {
      // date = new Date(date.getTime() + this.selectedTimezoneOffset) // ignore timezone
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    toUTCTimeString(date: Date) {
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      return `${date.getUTCHours()}:${minuteString} ${ampm}`;
    },

    toLocaleDateString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
    },

    toLocaleTimeString(date: Date) {
      date = new Date(date.getTime() + this.selectedTimezoneOffset);
      const minutes = date.getUTCMinutes();
      const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // get am pm
      const ampm = date.getUTCHours() < 12 ? "AM" : "PM";
      // get the 12hr time
      const hours = date.getUTCHours() % 12;
      
      return `${hours != 0 ? hours : 12}:${minuteString} ${ampm}`;
    },

    toTimeString(date: Date) {
      // return this.toLocaleTimeString(date);
      return formatInTimeZone(date, this.selectedTimezone, 'h:mm aaa (zzz)');
    },

    closeSplashScreen() {
      this.showSplashScreen = false; 
    },

    updateWWTLocation() {
      this.wwtSettings.set_locationLat(R2D * this.location.latitudeRad);
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad );
      if(this.showHorizon) {
        this.updateHorizon();
      }
    },

    updateLocation(location: string) {
      if (location == null) {
        return;
      }
      console.log("updateLocation", location);
      this.selectedLocation = location;
      this.location = {
        latitudeRad: this.eclipsePathLocations[location].latitudeRad,
        longitudeRad: this.eclipsePathLocations[location].longitudeRad
      };

    },

    updateLocationFromMap(location: LocationDeg) {
      if (location == null) {
        return;
      }
      console.log("updateLocationFromMap", location);
      this.selectedLocation = 'User Selected';
      this.locationDeg = location;

      this.eclipsePathLocations['User Selected'] = {
        name: `User Selected: ${location.latitudeDeg.toFixed(2)}, ${location.longitudeDeg.toFixed(2)}`,
        latitudeRad: D2R * location.latitudeDeg,
        longitudeRad: D2R * location.longitudeDeg,
        eclipseFraction: null
      };

      const citySelector = this.$refs.citySelector;
      // There's got to be a way to export the component data/method definitions
      // but that's a problem for another day
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      citySelector?.onMapSelect({
        latlng: {
          lat: location.latitudeDeg,
          lng: location.latitudeDeg
        }
      });

    },

    onTimeSliderChange() {
      this.$nextTick(() => {
        this.updateHorizon(this.dateTime);
      });
    },

    logLocation() {
      console.log(this.location.latitudeRad * R2D, this.location.longitudeRad * R2D);
    },
    
    logPosition() {
      console.log(this.wwtRARad * R2D, this.wwtDecRad * R2D);
    },

    printUTCDate(date: Date) {
      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
    },    

    selectSheet(name: SheetType) {
      if (this.sheet === name) {
        this.sheet = null;
        this.$nextTick(() => {
          this.blurActiveElement();
        });
      } else {
        this.sheet = name;
      }
    },

    // WWT does have all of this functionality built in
    // but it doesn't seem to be exposed
    // We should do that, but for now we just copy the web engine code
    // https://github.com/Carifio24/wwt-webgl-engine/blob/master/engine/wwtlib/Coordinates.cs
    altAzToHADec(altRad: number, azRad: number, latRad: number): { ra: number; dec: number; } {
      azRad = Math.PI - azRad;
      if (azRad < 0) {
        azRad += 2 * Math.PI;
      }
      let ra = Math.atan2(Math.sin(azRad), Math.cos(azRad) * Math.sin(latRad) + Math.tan(altRad) * Math.cos(latRad));
      if (ra < 0) {
        ra += 2 * Math.PI;
      }
      const dec = Math.asin(Math.sin(latRad) * Math.sin(altRad) - Math.cos(latRad) * Math.cos(altRad) * Math.cos(azRad));
      return { ra, dec };
    },

    getJulian(utc: Date): number {
      let year = utc.getUTCFullYear();
      let month = utc.getUTCMonth()+1;
      const day = utc.getUTCDate();
      const hour = utc.getUTCHours();
      const minute = utc.getUTCMinutes();
      const second = utc.getUTCSeconds() + utc.getUTCMilliseconds() / 1000.0;

      if (month == 1 || month == 2)
      {
        year -= 1;
        month += 12;
      }

      const a = Math.floor(year / 100);
      const b = 2 - a + Math.floor(a / 4.0);
      const c = Math.floor(365.25 * year);
      const d = Math.floor(30.6001 * (month + 1));

      // gives julian date: number of days since Jan 1, 4713 BC
      const jd = b + c + d + 1720994.5 + day + (hour + minute / 60.00 + second / 3600.00) / 24.00;
      return jd;

    },
    
    mstFromUTC2(utc: Date, longRad: number): number {
      const lng = longRad * R2D;

      const modifiedJD = this.getJulian(utc)  - 2451545;

      const julianCenturies = modifiedJD / 36525.0;
      // this form wants julianDays - 2451545
      let mst = 280.46061837 + 360.98564736629 * modifiedJD + 0.000387933 * julianCenturies * julianCenturies - julianCenturies * julianCenturies * julianCenturies / 38710000 + lng;

      if (mst > 0.0) {
        while (mst > 360.0) {
          mst = mst - 360.0;
        }
      } else {
        while (mst < 0.0) {
          mst = mst + 360.0;
        }
      }

      return mst;
    },

    horizontalToEquatorial(altRad: number, azRad: number, latRad: number, longRad: number, utc: Date): EquatorialRad {
      const st = this.mstFromUTC2(utc, longRad); // siderial time 
  
      const haDec = this.altAzToHADec(altRad, azRad, latRad); // get Hour Angle and Declination
      
      const ha = haDec.ra * R2D;

      let ra = st + ha;
      if (ra < 0) {
        ra += 360;
      }
      if (ra > 360) {
        ra -= 360;
      }
      // ra -= 180;
      // console.log(`Alt: ${(altRad*R2D).toFixed(2)} Az: ${(azRad*R2D).toFixed(2)} Ra: ${ra.toFixed(2)} Dec: ${(haDec.dec*R2D).toFixed(2)}`)

      return { raRad: D2R * ra, decRad: haDec.dec };
    },

    equatorialToHorizontal(raRad: number, decRad: number, latRad: number, longRad: number, utc: Date): HorizontalRad {
      let hourAngle = this.mstFromUTC2(utc, longRad) - R2D * raRad;
      if (hourAngle < 0) {
        hourAngle += 360;
      }

      const ha = D2R * hourAngle;
      const dec = decRad;
      const lat = latRad;
      
      const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
      const altitude = Math.asin(sinAlt);
      const cosAz = (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) / (Math.cos(altitude) * Math.cos(lat));
      let azimuth = Math.acos(cosAz);

      azimuth = azimuth + (Math.PI * 80) % (Math.PI * 2);

      if (Math.sin(ha) > 0) {
        azimuth = 2 * Math.PI - azimuth;
      }
      return { altRad: altitude, azRad: azimuth };

    },

    createHorizon(when: Date | null = null) {

      const color = '#01362C';
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [-Math.PI / 2, i * delta],
          [0, (i + 1) * delta]
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const poly = new Poly2();
        points.forEach(point => poly.addPoint(...point));
        poly.set_lineColor(color);
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(this.horizonOpacity);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Annotation2.addAnnotation(poly);
      }
    },

    createSky(when: Date | null = null) {
      const color = this.skyColor || '#4190ED';
      // const opacity = 0.5;
      const date = when || this.dateTime || new Date();

      // The initial coordinates are given in Alt/Az, then converted to RA/Dec
      // Use N annotations to cover below the horizon
      const n = 6;
      const delta = 2 * Math.PI / n;
      // const delta = 360/n;
      for (let i = 0; i < n; i++) {
        let points: [number, number][] = [
          [0, i * delta],
          [0, (i + 1) * delta],
          [Math.PI / 2, i * delta] // In addition to using +pi/2 instead of -pi/2, I had to switch the order of the 2nd & 3rd points relative to the horizon set. I don't know why, but before I switched them, the polygons didn't render.
        ];
        points = points.map((point) => {
          const raDec = this.horizontalToEquatorial(...point, this.location.latitudeRad, this.location.longitudeRad, date);
          return [R2D * raDec.raRad, R2D * raDec.decRad];
        });
        const poly = new Poly();
        points.forEach(point => poly.addPoint(...point));
        poly.set_fill(true);
        poly.set_fillColor(color);
        poly.set_opacity(this.skyOpacity);
        poly.set_lineWidth(0); // This removes the seam that appears between the polygons when opacity < 1
        this.addAnnotation(poly);
      }

    },

    removeAnnotations() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Annotation2.clearAll();
      this.clearAnnotations();
    },    

    onPointerMove(event: PointerEvent) {
      if (!this.isPointerMoving && this.pointerStartPosition !== null) {
        const dist = Math.sqrt((event.pageX - this.pointerStartPosition.x) ** 2 + (event.pageY - this.pointerStartPosition.y) ** 2);
        if (dist > this.pointerMoveThreshold) {
          this.isPointerMoving = true;
        }
      }
    },

    onPointerDown(event: PointerEvent) {
      this.isPointerMoving = false;
      this.pointerStartPosition = { x: event.pageX, y: event.pageY };
    },

    onPointerUp() {
      this.pointerStartPosition = null;
      this.isPointerMoving = false;
    },


    updateForDateTime() {
      if (this.syncDateTimeWithWWTCurrentTime) {
        this.setTime(this.dateTime);
      }
      this.updateHorizon(this.dateTime); 
    },

    updateHorizon(when: Date | null = null) {
      try {
        this.removeAnnotations();
      }
      finally {
        if (this.showHorizon) {
          this.createHorizon(when);
          if (this.showSky) {
            this.createSky(when);
          }
        }
      }
    },

    updateGuidedContentHeight() {
      let guidedContentContainer = null as HTMLElement | null;
      if (this.showGuidedContent) { 
        guidedContentContainer = document.getElementById('guided-content-container') as HTMLElement;
      } else {
        guidedContentContainer = document.getElementById('closed-top-container') as HTMLElement;
      }
      
      if (guidedContentContainer) {
        const height = guidedContentContainer.clientHeight;
        console.log("height", height);
        this.guidedContentHeight = `${height}px`;
        
      }
    },
    
    onResize() {
      // get height of #guided-content-container
      this.$nextTick(() => {
        this.updateGuidedContentHeight();
      });
    },

    startHorizonMode() {
      // turn on local horizon mode
      this.wwtSettings.set_localHorizonMode(true);
      this.showAltAzGrid = true;
      this.skyColor = this.skyColorLight;
      this.showHorizon = true; // automatically calls it's watcher and updates horizon
      this.horizonOpacity = 1;
      // this.setForegroundImageByName("Digitized Sky Survey (Color)");
      this.sunPlace.set_zoomLevel(60);
      this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: false,
        trackObject: this.toggleTrackSun
      });
      this.playbackRate = this.horizonRate;
      console.log('=== startHorizonMode ===');
      return;
    },

    startSolarScopeMode() {
      this.wwtSettings.set_localHorizonMode(false);
      this.showAltAzGrid = false;
      this.skyColor = this.skyColorNight;
      this.horizonOpacity = 0.6;
      this.updateHorizon(); // manually update horizon
      this.playbackRate = this.scopeRate;
      // this.setForegroundImageByName("Black Sky Background");
      // this.setForegroundOpacity(100);
      this.sunPlace.set_zoomLevel(20); // the original default value
      // track sun
      this.gotoTarget({
        place: this.sunPlace,
        instant: true,
        noZoom: false,
        trackObject: true
      });
      console.log('=== startSolarScopeMode ===');
      return;
    },
  
    getSunAltitudeAtTime(time: Date): { altRad: number; azRad: number; } {
      const sunAltAz = this.equatorialToHorizontal(this.sunPosition.raRad, this.sunPosition.decRad, this.location.latitudeRad, this.location.longitudeRad, time);
      return sunAltAz;
    },

    // function that finds at what time the sun will reach a given altitude during the current day to within 15 minutes
    getTimeforSunAlt(altDeg: number): { rising: number | null; setting: number | null; } {
      // takes about 45ms to run
      // search for time when sun is at given altitude
      // start at 12:00am and search every MINUTES_PER_INTERVAL
      const minTime = this.selectedTime - (this.selectedTime % MILLISECONDS_PER_DAY) - this.selectedTimezoneOffset;
      const maxTime = minTime + MILLISECONDS_PER_DAY;
      // const ehr = this.eclipticHorizonAngle(this.location.latitudeRad, this.dateTime);
      let time = minTime;
      let sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad; // negative
      // find the two times it crosses the given altitude
      while ((sunAlt < altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const rising = time == maxTime ? null : time;
      while ((sunAlt > altDeg * D2R) && (time < maxTime)) {
        time += MILLISECONDS_PER_INTERVAL;
        sunAlt = this.getSunAltitudeAtTime(new Date(time)).altRad;
      }
      const setting = time == maxTime ? null : time;
      
      return {
        'rising': (rising !== null && setting !== null) ? Math.min(rising, setting) : rising,
        'setting': (rising !== null && setting !== null) ? Math.max(rising, setting) : setting
      };
    },
    
    
    setTimeforSunAlt(altDeg: number) {
      const out = this.getTimeforSunAlt(altDeg);
      console.log("rise", this.toLocaleDateString(new Date(out.rising as number)) + " " + this.toLocaleTimeString(new Date(out.rising as number)));
      console.log("set", this.toLocaleDateString(new Date(out.setting as number)) + " " + this.toLocaleTimeString(new Date(out.setting as number)));
      if (out.rising == null && out.setting == null) {
        return;
      }

      function matchTime(time: number | null, times: number[]) {
        if (time === null) {
          return -1;
        }
        const dt = time - times[0];
        return times[0] + dt - (dt % MILLISECONDS_PER_INTERVAL);
      }

      const risingTime = matchTime(out.rising, this.times);
      const settingTime = matchTime(out.setting, this.times);
      if (this.times.includes(risingTime)) {
        this.selectedTime = risingTime;
      } else if (this.times.includes(settingTime)) {
        this.selectedTime = settingTime;
      } else {
        console.log("time not in times array");
        // best to leave it alone so it doesn't jump around
        // this.selectedTime = Math.max(minTime, Math.min(newTime, maxTime));
      }
      

    },

    getplaybackRate(rate: string) {
      console.log('setplaybackRate', rate);
      // parse a string that looks like "x [time] per y [time]"
      // e.g. "1 second per 1 minute"
      // returns a number that is the ratio of the two times converted to seconds/seconds
      // e.g. 1/60
      // if the string is not parseable, returns 1
      function unitToSec(unitString: string): number {
        if (unitString[0] == 'h') {
          return 3600;
        } else if (unitString[0] == 'm') {
          return 60;
        } else if (unitString[0] == 's') {
          return 1;
        } else {
          return 0;
        }
      }
      
      // parse string
      const parsedString = rate.match(/(\d+(\.(\d+)?)?)\s(\w+)\sper\s(\d+(\.(\d+)?)?)?\s?(\w+)/);

      if (parsedString === null) {
        return 1;
      }
      const num1 = parseInt(parsedString[1]) * unitToSec(parsedString[4]);
      const num2 = (parseInt(parsedString[5]?? 1) ) * unitToSec(parsedString[8]);
      
      return num1 / num2;
    },
  
    copyShareURL() {
      const url = `${window.location.origin}?lat=${this.locationDeg.latitudeDeg}&lon=${this.locationDeg.longitudeDeg}`;
      navigator.clipboard
        .writeText(url)
        .then(() =>
          this.$notify({
            group: "copy-url",
            type: "success",
            text: "URL successfully copied"
          })
        )
        .catch((_err) =>
          this.$notify({
            group: "copy-url",
            type: "error",
            text: "Failed to copy URL"
          })
        );
    },


  },

  watch: {
    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },

    showEcliptic(show: boolean) {
      this.wwtSettings.set_showEcliptic(show);
      this.wwtSettings.set_showEclipticOverviewText(false);
    },

    showHorizon(_show: boolean) {
      this.updateHorizon();
      this.updateMoonTexture();
    },

    showSky(_show: boolean) {
      this.updateHorizon();
      this.updateMoonTexture();
    },

    useRegularMoon(_show: boolean) {
      this.updateMoonTexture();
    },

    dateTime(_date: Date) {
      this.updateForDateTime();
    },

    selectedTime(_time: number) {
      return;
    },

    wwtCurrentTime(time: Date) {
      if (time.getTime() >= this.maxTime || time.getTime() < this.minTime) {
        if (this.playing) {
          this.playing = false;
          this.selectedTime = this.minTime;
          setTimeout(() => {
            this.playing = true;
          }, 1000);
        }
        
        return;
      }
      
      this.selectedTime = time.getTime();
      this.updateHorizon(time);
    },

    selectedTimezone(newTz: string, oldTz: string) {
      const newOffset = getTimezoneOffset(newTz);
      const oldOffset = getTimezoneOffset(oldTz);
      let newHours = this.timeOfDay.hours + ((newOffset - oldOffset) / (1000*60*60));
      if (newHours >= 24) {
        newHours -= 24;
        this.moveOneIntervalForward();
      } else if (newHours < 0) {
        newHours += 24;
        this.moveOneIntervalBackward();
      }
      this.timeOfDay.hours = newHours;
    },

    location(loc: LocationRad, oldLoc: LocationRad) {
      const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
      
      if (oldLoc.latitudeRad * loc.latitudeRad < 0) {
        Grids._altAzTextBatch = null;
      }

      this.selectedTimezone = tzlookup(...locationDeg);
      this.playing = false;
      this.updateWWTLocation();

      // We need to let the location update before we redraw the horizon
      this.$nextTick(() => {
        this.updateHorizon();
      });

      this.centerSun();
    },

    selectedLocation(locname: string) {
      if (!(locname in this.eclipsePathLocations)) {
        console.log(`location ${locname} not found in eclipsePathLocations`);
        return;
      }
      console.log("selected location", locname);
    },
    
    playing(play: boolean) {
      console.log(`${play ? 'Playing:' : 'Stopping:'} at ${this.playbackRate}x real time`);
      this.setClockSync(play);
    },

    showSplashScreen(val: boolean) {
      if (!val) {
        this.inIntro = false; //Set to false for now to make coding other things easier. FIX later
      }
    },
    
    introSlide(val: number) {
      this.inIntro = val < 3;
      return;
    },

    viewerMode(mode: ViewerMode) {
      if (mode === 'Horizon') {
        this.startHorizonMode();
      } else if (mode === 'SunScope') {
        this.horizonOpacity = 0.6;
        this.startSolarScopeMode();
      }
      this.updateMoonTexture();
    },

    skyColor(_color: string) {
      this.updateHorizon();
    },

    sunAboveHorizon(isAbove: boolean) {
      console.log(`The sun is ${isAbove ? 'above' : 'below'} the horizon`);
      // this.showSky = isAbove; // just turn it off
      this.horizonOpacity = isAbove ? 1 : 0.85;
    },

    sunPosition(pos: EquatorialRad & HorizontalRad) {

      const _civilTwilight = -6 * D2R;
      // const _nauticalTwilight = 2 * _civilTwilight;
      const astronomicalTwilight = 3 * _civilTwilight;
      
      const sunAlt = pos.altRad;
      this.skyOpacity = (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
      this.updateMoonTexture();

      const dssOpacity = sunAlt > 0 ? 0 : 1 - (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
      this.setForegroundOpacity(dssOpacity * 100);
      return;
    },

    toggleTrackSun(val: boolean) {
      // this turns of sun tracking
      console.log("toggleTrackSun", val);
      if (val) {
        this.trackSun();
        return;
      } else {
        const currentPlace = new Place();
        currentPlace.set_RA(this.wwtRARad * R2D / 15);
        currentPlace.set_dec(this.wwtDecRad * R2D);
        this.gotoTarget({
          place: currentPlace,
          instant: true,
          noZoom: true,
          trackObject: false
        });
        return;
      }
    },
    
    playbackRate(val: number) {
      
      if (val > 11_000) {
        console.warn('playbackRate too high, setting to maxPlaybackRate');
        this.speedIndex = 4;
        this.playbackRate = 10_000;
      }

      if (val < .1) {
        console.warn('playbackRate too low, setting to minPlaybackRate');
        this.speedIndex = -1;
        this.playbackRate = .1;
      }
      
      this.setClockRate(val);
    },

  },
});
</script>


<!-------------------------  STYLE ----------------------------->
<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("../../assets/HighwayGothicNarrow.ttf");
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;

  overflow: hidden;
  -ms-overflow-style: none;

  // We don't want a scrollbar for the overall canvas
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#main-content {
  position: relative;
  // top: var(--top-content-height);
  width: 100%;
  height: calc(var(--app-content-height) - var(--top-content-height));
  overflow: hidden;

  // transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: relative;
    // top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("../../assets/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

#modal-readytostart {
  cursor: pointer;
  color: #999;

  &:hover {
    color: #2aa5f7;
  }

  div {
    margin: 0;
    padding: 0;
    background-image: url("../../assets/wwt_globe_bg.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    width: 20rem;
    height: 20rem;
    max-width: 70%;
    max-height: 70%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 60%;
      height: 60%;
      margin-left: 14%;
      margin-top: 3%;
    }
  }
}

.pointer {
  cursor: pointer;
}

.control-icon {
  pointer-events: auto;

  &:hover {
    cursor: pointer;
  }

}

// these are now in #top-content




#share-button-wrapper {
  position: absolute;
  top: 0.7rem;
  left: 1rem;
  
  .icon-wrapper {
    padding-inline: 0.5em;
    padding-block: 0.6em;
    border: 2px solid var(--accent-color);
  }

}

.top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  #center-buttons {
    display: flex;
    flex-direction: row;
  }
}

.bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#tools {
  z-index: 10;
  color: #fff;
  width: 100%;

  .opacity-range {
    width: 50vw;
  }

  .clickable {
    cursor: pointer;
  }

  select {
    background: white;
    color: black;
    border-radius: 3px;
  }
}

.tool-container {
  display: flex;
  width: 99%;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  pointer-events: auto;

  div.icon-wrapper {
  padding: 5px 5px;
  min-width: 30px;
  }
}

#controls {
  background: black;
  padding-block: 0.5em;
  padding-right: 0.5em;
  border-radius: 5px;
  border: solid 1px var(--comet-color);
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  pointer-events: auto;

  .v-label {
    color: var(--comet-color);
    opacity: 1;

    @media (max-width: 500px){ //SMALL
      font-size: 0.8em;
    }

    @media (min-width: 501px){ //LARGE
      font-size: 1.1em;
    }
  }

  #control-checkboxes {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    @media (max-width: 750px){ //SMALL
      
      .v-checkbox .v-selection-control {
      height: 1.5em !important;
      min-height: 1em !important;
      }

    }

    @media (min-width: 751px){ //LARGE
      .v-checkbox .v-selection-control {
      height: 2.1em !important;
      min-height: 1em !important;
      }
    }


    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      font-size: 0.75em;
      white-space: break-spaces;
      width: 150px;
    }
  }
  #controls-top-row {
    padding-left: 0.5em;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#show-controls {
  color: var(--accent-color);
}

#credits {
  color: #ddd;
  font-size: calc(0.7em + 0.2vw);
  justify-self: flex-end;
  align-self: flex-end;
  display: flex;
  justify-content: center;
  align-items: center;

  p {
    margin: 0;
    padding: 0;
    line-height: 1;
  }

  a {
    text-decoration: none;
    color: #fff;
    pointer-events: auto;

    &:hover {
      text-decoration: underline;
    }

    &[class^="share-network"]:hover {
      text-decoration: none;
      filter: brightness(75%);
    }
  }

  img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
  }
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

#splash-overlay {
  position: fixed;
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  color: var(--moon-color);
  max-height: calc(min(90vh, 2040px));
  max-width: 90vw;
  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;

  border-radius: 10%;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;

  div {
    margin-inline: auto;
    text-align: center;
  }
  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: bold;
    vertical-align: middle;
  }
    
  p.highlight {
    color: var(--moon-color);
    -webkit-text-stroke: 0.1px var(--accent-color);
    filter: drop-shadow(0px 0px 0.25em var(--accent-color));

    // make uppercase
    font-size: 1.15em;
    text-transform: uppercase;
    font-weight: bolder;
  }
  
  p.small {
    font-size: .75em;
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    text-align: end;
    margin-top: 0%;
    margin-right: 6%;
    color: var(--accent-color-2);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    
  }

  #splash-screen-guide {
    margin-block: 1em;
    font-size: .6em;
    width: 75%;

    .v-col{
      padding: 0;
    }
    
    .svg-inline--fa {
      color:var(--accent-color);
      margin: 0 10px;
    }
  }

  #splash-screen-acknowledgements {
    font-size: .5em;
    width: 70%; 
  }

  #splash-screen-icons {
    margin-top: 0.5em;
    margin-bottom: 0.75em;
    
    #credits {
      background-color: transparent;
      border: 2px solid transparent;
    }
  }
  
  a {
    text-decoration: none;
    color: var(--accent-color-3);
    white-space: nowrap;
  }
}

#wwt-sheet-card {
  width: 50%;
  align-self: center;
}

.bottom-sheet {

  .tab-title {
    font-size: ~"max(18px, calc(1.1em + 0.3vw))";
  }

  #info-text-box {
    font-size: ~"max(16px, calc(1em + 0.3vw))";
    line-height: ~"max(20px, calc(1.1em + 0.4vw))";
  }
  #main-info-text {
    padding-inline: 0.5em;
  }

  #safety-warning{
    margin-top: 0.4em;
    font-weight: bold;
    color: var(--accent-color);
    font-size: ~"max(20px, calc(1em + 0.3vw))";
  }
  
  #FAQ{
    margin-top: 1em;

    details {
      padding-block: 0.7em;
      padding-inline: 1.2em;
      height: fit-content;
      background-color: #486273;
      
      summary {
        font-weight: bold;
        font-size: ~"max(16px, calc(0.8em + 0.3vw))";
        cursor: pointer;
      }
      
      p {

        padding-top: 0.5em;
        padding-inline: 1em;
      }
    
    }
  }

  figure {
    position: sticky;
    top: 0;
    figcaption{
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 0.5em;
      background-color: #4a4a4a4a;
      border-radius: 10px 0 0 0;
      padding-inline: 10px 5px;
    }
  }
  
  .v-overlay__content {
    align-self: center;
    padding: unset;
    margin: unset;
  }
  
  .bottom-sheet-card {
    height: fit-content;
    width: 100%;
    align-self: center;
    border-bottom: solid #212121 0.5em;
  }
  
  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }

  .v-card-text {
    height: 40vh;
    
    & a {
      text-decoration: none;
    }
  }

  .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;

    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }

  .scrollable {
    overflow-y: auto;
  }

  .no-bottom-border-radius {
    // border-bottom-left-radius: 0px !important;
    // border-bottom-right-radius: 0px !important;
    width: auto;
  }
  

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }

  .user-guide-header {
    margin-top: 1rem;
    color: var(--accent-color);
    font-size: larger;
  }

  .user-guide-emphasis {
    color: var(--accent-color);
    font-weight: bold;
  }

  .user-guide-emphasis-white {
    font-weight: bold;
  }

  .solid-divider {
    margin-top: 1rem;
    color: var(--sky-color);
    opacity: 0.7;
  }
}

// Styling the slider


.v-slider {
  .v-slider-track {
    --v-slider-track-size: 4px !important;

    .v-slider-track__background {
      background-color: #CCC !important;
    }

    .v-slider-track__fill {
      background-color: rgb(255 193 203)!important;
      height: var(--v-slider-track-size) !important;
    }

    .v-slider-track__background--opacity {
      opacity: 1 !important;
    }
  }

  .v-slider-thumb {
    
    .v-slider-thumb__surface {
      border: 1px solid black !important;
    }
  }
  

  .v-slider-thumb__label {
    min-width: fit-content;
    white-space: nowrap;
    color: black;
    padding-inline: 0.7rem;
    background-color: var(--accent-color);

    @media (max-width: 750px ) { //SMALL
      font-size: 1rem;
      padding-block: 0.7rem;
    } 

    @media (min-width: 751px ) { //LARGE
      font-size: 1.1rem;
      padding-block: 1rem;
    } 
  }
  
  .v-slider-thumb__label::before {
    color: var(--accent-color);
  }
}

#slider {
  width: 100% !important;
  margin: 5px 30px;
}

.v-container {
  max-width: 100%;
}

#closed-top-container {
    position: absolute;
    margin-top: 0.5rem;
    margin-left: 0.5rem;
    z-index: 500;
  }

#guided-content-container {
  --top-content-max-height: max(30vmin, 35vh);
  --map-max-height: var(--top-content-max-height); // Keep this about 3 smaller than above // not used any more
  --margin: 0.5rem;
  --container-padding: 0.5rem;
  position: relative;
  margin: var(--margin);
  padding: var(--container-padding);

  width: calc(100% - 2*var(--margin));
  max-height: var(--top-content-max-height);
  align-items: center;
  gap: 0.5rem;
  // border-bottom: 1px solid var(--accent-color);
  background-color: #272727;
  user-select: none;
  border: solid 1.5px var(--accent-color);
  
  font-size: clamp(8px, 3vmin, 0.9em);
  overflow-y: auto;
  
  transition: height 0.5s ease-in-out;

  > div.v-row {
    height: 100%;
    display: flex;
  }

  .v-row {
    margin: 0px;
    padding: 0px;
  }

  .v-col {
    margin: 0px;
    padding: 0px;
  }

  #close-guided-content-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 500;
  }  

  #non-map-container { // Keep content away from the x to close
    --padding-left: 1rem;
    
    @media (max-width: 600px) { //phone-size
      --padding-left: 0em;
    }
    
    padding-left: var(--padding-left);
    // padding-right: padding+left + container-padding;
    padding-right: calc(var(--padding-left) + var(--container-padding));
  
  }

  .non-map-row {
    @media (min-width: 750px) {
      margin-bottom: 0.5em;
    }
  }
    
    // .v-row.non-map-row#title-row
  #title-row {
    color: var(--accent-color);
    font-weight: bold;
    text-align: right;
    padding-left: 1rem;
    
    font-size: clamp(0.9rem, 2.1vw, 2rem);

  }
    
    // .v-row.non-map-row#instructions-row
  #instructions-row { 
    
    // v-col
    #top-container-main-text { 
    
      // div
      .instructions-text {
        border: 1.5px solid var(--sky-color);
        border-radius: 5px;
        padding-inline: 0.7em;
        padding-block: 0.4em; // this plus the margin on p give .7 em on top and bottom
        
        font-size: clamp(0.6rem, 1.75vw, 1.2rem);

        // span
        .description {
          line-height: 1.4em;
          color: white;
          text-align: left;
          
          p {
            margin-block: .3em;
          }
        }
      }
    }
  }

  #button-row {
    padding-top: 0.5em;
    align-self: flex-end;

    #top-container-buttons{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      
      flex-grow: 1;
      gap: 0.5em;
            
      .icon-wrapper {
        background-color: rgba(209, 209, 209, .2);
        border: none;
        border-radius: 5px;
        padding-block: 4px;
        width: calc(100%/6);
        
        @media (max-width: 500px) {
          padding-inline: 0px;
        }

        &.active {
          border: 2px solid var(--sky-color);

          
        }
      }
    }
  }


}

#map-column { // v-col
  position: relative;
  --map-max-height: calc(var(--top-content-max-height) - 2*var(--margin) - 2*var(--container-padding));
  height: 100%;
  // max-height: var(--map-max-height);
  width: 100%;
  aspect-ratio: 5 / 3;

  #map-container {
    height: 100%;
  
    span {
      padding: 0;
      margin: 0;
    }
    
    img {
      width: 100%;
    }

    .leaflet-control-zoom-in, .leaflet-control-zoom-out {

      background-color: #fff;
      cursor: pointer; /* Change cursor on hover */
      
      span {
        color: black;
      }
    } 

    .leaflet-touch {
      line-height: 1;
    }
    
    .leaflet-control-attribution {
      font-size: .75em;
    }
  }
}

.bullet-icon {
  color: var(--accent-color)
}

#introduction-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 75%;
  height: fit-content;
  // outline: 5px solid var(--accent-color);
  border-radius: 1em;
  padding: 2em;

  // rotated translucent background gradient
  background: linear-gradient(45deg,
                            rgb(14, 30, 40), 
                            rgb(22, 50, 65), 
                            rgb(30 70 90));

  
  @media (max-width: 750px){ //SMALL
    font-size: 1em;    
    }

  @media (min-width: 751px){ //LARGE
      font-size: 1.1em;
  }

  .v-list-item__prepend {
    margin-right: 0.75em;
  }
  
  .intro-text {
    color: white;
  }
  
  div#intro-bottom-controls {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;

    gap: 1em;
    margin-top:1em;

    .v-btn.v-btn--density-default {
        max-height: 8em;
      }  
        
    @media (max-width: 750px){ //SMALL
      .v-btn--size-default {
      font-size: 0.8em;
      }  
    }

    @media (min-width: 751px){ //LARGE
      .v-btn--size-default {
      font-size: 0.9em;
      }    
    }

  
    #intro-reminder {
      outline: 1px solid red;
    }
    
    #intro-next-button {
      background-color: rgba(18, 18, 18,.5);
    }
  }
}

#share-button {
  margin: auto;
  width: 2em;
}

#speed-control {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-left: 10px;

  .icon-wrapper {
    padding-inline: 0.5em;
    padding-block: 0.6em;
    border: 2px solid var(--accent-color);
  }

}

#speed-text {
    position: absolute;
    bottom: 0.3rem;
    left: 0.3rem;
    background-color: rgba(0, 0, 0, 0.5);
    padding-inline: 0.4em;
    padding-block: 0.15em;
    border-radius: 0.3em;

    @media (max-width: 750px){ //SMALL
          font-size: 0.9rem;
        }
    @media (min-width: 751px){ //LARGE
          font-size: 1.1rem;
    }
  }  

#top-wwt-content {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;

  #location-date-display  {
  
    display: flex;
    justify-content: flex-end;
    flex-wrap: column;
    gap:5px;

    .v-chip {
      border: none;
      color: blue;
      background-color: white;
      opacity: 0.9;

      @media (max-width: 750px){ //SMALL
        font-size: 1em;
        padding: 1em;
      }

      @media (min-width: 751px){ //LARGE
        font-size: 1.1em;
        padding: 1.1em;
      }
    }
  }
    .v-switch__thumb {
      color: #f39d6c;
      background-color: black; 

      @media (min-width: 751px) { //LARGE
        height: 2.1rem;
        width: 2.2rem;
      }

    }

    .v-input--density-default {
      --v-input-control-height: 0;
    }

    .v-selection-control--density-default {
      --v-selection-control-size: auto;
    } 

    .v-switch--inset .v-switch__track {
      @media (min-width: 751px) { //LARGE
        height: 2.5rem;
        width: 4.2rem;
      }
    }

    pointer-events: auto;

  #top-switches {
    position: absolute;
    right: 0;

    @media (max-width: 750px ) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px ) { //LARGE
      margin-top: 0.7rem;
    } 

  }
 
  #track-sun-switch {
    @media (max-width: 750px ) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px ) { //LARGE
      margin-top: 0.7rem;
    } 
  }
}

</style>

<template>
<v-app
  id="app"
  :style="cssVars"
>

  <!-- Top content box with map, location, time, and option icons -->
  <div id="closed-top-container" :class="[!showGuidedContent ?'budge' : '']">
    <icon-button
      v-model="showGuidedContent"
      :fa-icon="showGuidedContent ? 'chevron-up' : 'chevron-down'"
      :fa-size="showGuidedContent ? 'lg' : 'xl'"
      :color="accentColor"
      :focus-color="accentColor"
      :tooltip-text="showGuidedContent ? 'Hide' : 'Click to learn more'"
      :tooltip-location="'bottom'"
      :show-tooltip="!mobile"
      :box-shadow="false"
      @activate="() => {
        // console.log('showGuidedContent = ', showGuidedContent);
        // showGuidedContent = !showGuidedContent;
        onResize();
      }"
    >
    <template v-if="!showGuidedContent" v-slot:button>
      Learn & Explore <font-awesome-icon icon="chevron-down" class="bullet-icon"/>
    </template>
  </icon-button>
  </div>
  <v-container id="guided-content-container" v-show="showGuidedContent">
    <hover-tooltip
      :tooltip-text="scrollUp ? 'Scroll to top' : 'Scroll to bottom'"
      :disabled="mobile"
      id="scrollButton"
      >
      <template #target>
    <v-btn
      v-if="!smAndUp"
      :icon="scrollUp ? 'mdi-arrow-up' : 'mdi-arrow-down'"
      @click="scrollToTop"
      size="small"
      density="comfortable"
      :color="accentColor"
      variant="flat"
    />
      </template>
    </hover-tooltip>
    <div id="non-map-container">
        <div id="title-row" class="non-map-row">

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

        </div>
        <div id="instructions-row" class="non-map-row">
          <div id="top-container-main-text">
            <!-- Learn Path -->
            <div class="instructions-text" v-if="learnerPath=='Explore'">
              <span class="description">
                <p v-if="!queryData"><strong>{{ touchscreen ? "Tap" : "Click" }}</strong> <font-awesome-icon icon="play" class="bullet-icon"/> to "watch" the eclipse at the location marked by the red dot.</p>

                <p><strong>{{ touchscreen ? "Tap" : "Click" }} highlighted cities</strong> on the map to switch locations and view the eclipse from there.</p>
                <p><strong>Explore</strong> until you can identify which locations will see an annular eclipse!</p>
              </span>
            </div>
            
            <div class="instructions-text" v-if="learnerPath=='Answer'">
              <span class="description">
                <p>Have you determined the eclipse path? <strong>{{ touchscreen ? "Tap" : "Click" }} a card</strong> to select it.</p>
                <p>If you are not sure, {{ touchscreen ? "tap" : "click" }} <font-awesome-icon icon="rocket" class="bullet-icon"/> to keep exploring.</p>
              </span>
              <mc-radiogroup
                v-if="learnerPath=='Answer'"
                id = "mc-radiogroup-container"
                row
                hide-input
                :preselected="quizAnswer"
                :radio-options="['A', 'B','C']"
                :feedbacks="['Not that one.<br/>Try again!', 'Not that one.<br/>Try again!', 'Yes! It passes from Oregon to Texas']"
                :correct-answers="[2]"
                @select="onAnswerSelected"
                colorWrong="transparent"
                colorRight="transparent"
                > 
                <!-- for images width=100px, height=58px for correct aspect ratio -->
                <template #default="{index, text, selected, color, feedback}">
                    <flip-transition
                      :id="text"
                      :width="(xSmallSize ? `21vw` : `12vw`)"
                      height="9vh"
                      duration="0.8s"
                      :flipBackAfter="3000" 
                      tabindex="0"
                      role="button"
                      borderRadius="5px"
                      >
                      <template v-slot:front>
                      <image-label 
                        id="front"
                        :alt-text="longAnswers[index]"
                        :color="['rgb(0,180,200)','rgb(255, 110,0)','#f0f'][index]"
                        :background-color="(selected ? `${color}` : '#F0DCB9')"
                        :background-opacity="1"
                        fontSize="5vh"
                        fontWeight="bold"
                        :width="(xSmallSize ? `21vw` : `12vw`)"
                        height="9vh"
                        :border="'1px solid white'"
                        borderRadius="5px"
                        @click="() => { console.log('clicked'); quizAnswer = index;}"
                      >
                      {{ text }}
                      </image-label>
                      </template>
                      <template v-slot:back>
                        <image-label
                          id="front" 
                          :color="['rgb(0,180,200)','rgb(255, 110,0)','#f0f'][index]"
                          background-color="black"
                          :background-opacity="1"
                          :width="(xSmallSize ? `21vw` : `12vw`)"
                          height="9vh"
                          :fontSize="(xSmallSize ? `min(2vh,2.5vw)` : `min(1.6vh,1.6vw)`)"
                          fontWeight="bold"
                          lineHeight="(xSmallSize ? `min(2.2vh,2.7vw)` : `min(1.8vh,1.8vw)`)"
                          :border="'1px solid white'"
                          borderRadius="5px"
                        >
                        <span v-html="feedback"></span>
                        </image-label>
                      </template>
                  </flip-transition>
                </template>
              </mc-radiogroup>
              <div v-if="showLinkToPath" class="my-1">
                See NASA's map with the October annular eclipse path <a href="https://science.nasa.gov/eclipses/future-eclipses/eclipse-2024/where-when/" target="_blank" rel="noopener noreferrer">here.</a>
              </div>
            </div>
            
            <!-- Choose Path -->
            <div class="instructions-text" v-if="learnerPath=='Choose'">
              <span class="description">
                <p v-if="queryData">
                  <strong>{{ touchscreen ? "Tap" : "Click" }}</strong> <font-awesome-icon icon="play" size="l" class="bullet-icon"/> to "watch" the eclipse from the location shared in your link.
                </p>
                <p>
                  <strong>{{ touchscreen ? "Tap" : "Click" }}</strong> on the map to select any <span v-if="queryData">other</span> location and view the eclipse from there.
                </p>
                <p>
                  <strong>Share</strong> the view from a location by {{ touchscreen ? "tapping" : "clicking" }} <font-awesome-icon icon="share-nodes" class="bullet-icon"/> to copy the url.
                </p>
                <p>
                  View the eclipse from <strong>My Location</strong> by {{ touchscreen ? "tapping" : "clicking" }} <font-awesome-icon icon="street-view" class="bullet-icon"/>. (Location services must be enabled on device).
                </p>
              </span>
            </div>
          </div>
        </div>
      <!-- </toggle-content> -->
        <div id="button-row" class="non-map-row">
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
                :show-tooltip="!mobile"
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
                :show-tooltip="!mobile"
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
                :show-tooltip="!mobile"
                :box-shadow="false"
                @activate="() => { learnerPath = 'Answer'}"
              ></icon-button>   
              <icon-button
                v-model="showInfoSheet"
                fa-icon="book-open"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showInfoSheet ? null : 'More on Eclipses'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
              ></icon-button>
              <icon-button
                v-model="showWWTGuideSheet"
                fa-icon="circle-info"
                fa-size="xl"
                :color="accentColor"
                :focus-color="accentColor"
                :tooltip-text="showWWTGuideSheet ? null : 'User Guide'"
                :tooltip-location="'bottom'"
                :show-tooltip="!mobile"
                :box-shadow="false"
              ></icon-button>
            </div>
          <!-- </v-col> -->
        </div>
      </div>
      <div id="map-column">
      <v-hover v-slot="{isHovering, props}">
        <v-btn v-bind="props" v-if="false &&!isHovering && !smAndUp" color="blue" :width="'100%'">Tap here to reveal map</v-btn>
        <v-slide-y-transition
          :disabled="smAndUp"
        >
          <div v-if="!smAndUp || smAndUp" id="map-container" >
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
              :geo-json-files="geojson"
            ></location-selector>

            <span id="eclipse-path-map" v-if="learnerPath=='Answer'">
              <img alt="This is a map of the US with three possible paths for the April 2024 solar eclipse. In choice A, the eclipse moves North to South from Bismarck, ND through Denver, CO and Albuquerque, NM. In choice B, the eclipse moves West to East from Los Angeles, CA to Charlotte, NC. In Choice C, the eclipse moves Northwest to South from Eugene, OR to San Antonio, TX." src="./assets/AnnularEclipseMap.png"/>
            </span>

            <location-selector
              v-if="learnerPath == 'Choose'"
              :model-value="locationDeg"
              @update:modelValue="updateLocationFromMap"
              :detect-location="false"
              :map-options="userSelectedMapOptions"
              :selected-circle-options="selectedCircleOptions"
              class="leaflet-map"
              :geo-json-files="geojson"
            ></location-selector>
          </div>
        </v-slide-y-transition>
      </v-hover>
    </div>
  </v-container>
  
  <v-dialog
    id="video-container"
    v-model="showVideoSheet"
    transition="slide-y-transition"
    close-on-back
    fullscreen
  >
    <div class="video-wrapper">
      <font-awesome-icon
        id="video-close-icon"
        class="close-icon"
        icon="times"
        size="lg"
        @click="showVideoSheet = false"
        @keyup.enter="showVideoSheet = false"
        tabindex="0"
      ></font-awesome-icon>
      <video
        controls
        id="info-video"
      >
        <source src="./assets/video.mp4" type="video/mp4">
      </video>
    </div>
  </v-dialog>
  

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
        <v-card-title tabindex="0"><h3 class="v-btn tab-title">Information</h3></v-card-title>
          <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          :icon="`square-xmark`"
          size="xl"
          @click="showInfoSheet = false"
          @keyup.enter="showInfoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-container id="learn-more-content">
                <div id="info-text-box">

                  <div id="main-info-text">
                    <p>
                    On April 8, 2024, North America will be treated to an awe-inspiring total eclipse. 
                    </p>
                    <p>
                    This interactive lets you explore the April total eclipse from different locations. 
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
                      <summary> Total? Annular? What is the difference?</summary>
                      <p>
                        During a <strong>total eclipse</strong>, the Moon covers the entire face of the Sun. Because the Moon doesn't orbit the Earth in a perfect circle, sometimes it is farther away from Earth and appears smaller. When this happens, the Moon doesn't cover the entire face of the Sun. During the eclipse we can still see a bright ring of light around the Moon, sometimes called the "Ring of Fire." This is called an <strong>annular Eclipse</strong>.
                      </p>
                    </details>
                    
                    <details> 
                      <summary> Why can only some places see the eclipse?</summary>
                      <p>
                        An eclipse is caused by the Moon casting a shadow on the Earth. People who are directly behind the Moon will see an annular or total eclipse. As the Moon moves in its orbit around Earth, and as Earth rotates, the location of the shadow will move, sweeping out a path across the surface of the Earth. For a larger number of people who are not directly behind the moon, a smaller amount of the Sun will be blocked, causing a partial eclipse. Even further outside the shadow the Sun will not be blocked at all, and there will be no eclipse visible.
                      </p>
                      <p> 
                        The animated figure shows that the Moon's shadow on Earth has two distinct regions. The darker part of the shadow is directly behind the Moon, where people will experience an annular or total eclipse. The lighter part of the shadow falls where people on Earth will see a partial solar eclipse.
                      </p> 
                    </details>
                    
                    <details>
                      <summary>Where can I learn more?</summary>
                      <p>
                        Check out <a href="https://science.nasa.gov/eclipses/future-eclipses/eclipse-2024/where-when/" target="_blank" rel="noopener noreferrer">NASA's website</a> about the October annular eclipse and Fiske Planetarium's <a href="https://www.colorado.edu/fiske/projects/science-through-shadows" target="_blank" rel="noopener noreferrer">Science Through Shadows</a> videos.
                      </p>
                    </details>
                  </div>
                </div>
              <figure>
                <!-- <v-img src="https://www.nasa.gov/sites/default/files/thumbnails/image/tsis_eclipse-1.gif"></v-img> -->
                <gif-play-pause startPaused :gif='require("./assets/eclipse.gif")' :still='require("./assets/eclipse_static.gif")' alt="Animated schematic of a solar eclipse showing how the Moon moves between the Sun and Earth."/>
                <figcaption>Image credit: NASA Goddard / Katy Mersmann</figcaption>
                <div class="disclaimer">Not to scale</div>
              </figure>
            </v-container>
          </v-card-text>
        </v-card>
      </v-card>
    </v-dialog>
    
    <v-dialog
      scrim="false"
      transition="slide-y-transition"
      v-model="showWWTGuideSheet" 
      class="bottom-sheet"
      id="wwt-guide-sheet"
      :style="cssVars"
    >
      <v-card class="bottom-sheet-card">
        <v-card-title tabindex="0"><h3 class="v-btn tab-title">User Guide</h3></v-card-title>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          :icon="`square-xmark`"
          size="xl"
          @click="showWWTGuideSheet = false"
          @keyup.enter="showWWTGuideSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-card class="no-bottom-border-radius scrollable">
          <v-card-text class="info-text no-bottom-border-radius">
            <v-container  id="user-guide">
              <p style="font-size: calc(1.1 * var(--default-font-size))" class="mb-5">
                This Mini Data Story allows you to display the April 8, 2024 Total Solar Eclipse from any location. 
              </p>
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
                  <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? "" : "or" }}  <strong>{{ touchscreen ? "" : "W-A-S-D" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
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
                  <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? "" : "or" }} <strong>{{ touchscreen ? "" : "I-O" }}</strong> {{ touchscreen ? "" : "keys" }}<br>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <div
                      style="min-height: 120px;"
                  >                   
                    <h4 class="user-guide-header">Time Controls:</h4>
                    <p  class="mb-3">(See bottom-left of the screen)</p>
                    <ul class="text-list">
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="play"
                              size="lg" 
                            ></font-awesome-icon>
                        to move time forward at 1000x the real speed.
                      </li>
                      <li>
                        If playing, {{ touchscreen ? "tap" : "click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="pause"
                              size="lg" 
                            ></font-awesome-icon>
                        to pause time.
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="angle-double-down"
                              size="lg" 
                            ></font-awesome-icon>
                        to decrease speed by 10x.                        
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="angle-double-up"
                              size="lg" 
                            ></font-awesome-icon>
                        to increase speed by 10x. 
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="rotate"
                              size="lg" 
                            ></font-awesome-icon>
                        to reset time, view, and speed. 
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
                      <li class="mb-2">
                        The <span 
                        style="color: blue; background-color: white;
                        padding-inline: 0.7em;
                        border-radius: 20px;
                        font-weight: bold ">selected location</span> and <span 
                        style="color: blue; background-color: white;
                        padding-inline: 0.7em;
                        border-radius: 20px;
                        font-weight: bold ">date/time</span> are displayed under the map.
                      </li>
                      <li class="switch-bullets">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOff"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          false-icon="mdi-telescope"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Solar Scope:</span> Display zoomed in Sun and Moon as through a dark solar filter or eclipse glasses.
                      </li>
                      <li class="switch-bullets mb-3">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOn"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          true-icon="mdi-image-filter-hdr"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Horizon:</span> Display motion of Sun and Moon as they travel through the sky relative to the ground.
                      </li>
                      <li class="switch-bullets">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOn"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          true-icon="mdi-white-balance-sunny"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Track Sun:</span> Always keep camera centered on Sun.
                      </li>
                      <li class="switch-bullets mb-5">
                        <v-switch
                          class="display-only-switch"
                          v-model="displaySwitchOff"
                          density="compact"
                          hide-details
                          disabled
                          :ripple="false"
                          :color="accentColor"
                          false-icon="mdi-image"
                        >
                        </v-switch>
                        <span class="user-guide-emphasis"> Don't Track Sun:</span> In Horizon View, show motion of Sun (and Moon) against the sky.
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
                        <span class="user-guide-emphasis-white">Horizon:</span> Display a virtual "ground" that delineates where the Sun rises and sets.                     
                      </li>
                      <li>
                        <span class="user-guide-emphasis-white">Visible Moon:</span> Solar Eclipses occur during a New Moon, when the Moon is not normally visible in the sky. This option makes it easier to see the Moon against the sky.                     
                      </li>
                      <li>
                        <span class="user-guide-emphasis-white">Amount Eclipsed:</span> Display percentage of Sun being covered by the Moon. (Disabled when zoomed far out.)                   
                      </li>
                    </ul>
                          
                    <v-divider thickness="2px" class="solid-divider"></v-divider>

                    <h4 class="user-guide-header">Location Options:</h4>
                    <p  class="mb-3">(See top-left of the screen)</p>
                    <ul class="text-list">
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="share-nodes"
                              size="lg" 
                            ></font-awesome-icon> to copy <strong>share-url</strong> for a specific location.
                      </li>
                      <li>
                        {{ touchscreen ? "Tap" : "Click" }} <font-awesome-icon
                              class="bullet-icon"
                              icon="street-view"
                              size="lg" 
                            ></font-awesome-icon> to use the view my <strong>My Location</strong>. (Consult your device's user guide to enable location services.)                     
                      </li>
                    </ul>

                  </div>
                          
                  <v-divider thickness="2px" class="solid-divider"></v-divider>
                  
                </v-col>
              </v-row>
              <div id="text-credits">
                <h3>Credits:</h3>

                <p class="mt-2">This Mini Data Story is powered by WorldWide Telescope (WWT).</p>              
                <p class="my-3">Image of Sun is courtesy of NASA/SDO and the AIA, EVE, and HMI science teams.</p>

                <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Mini Stories Team:</h4> 
                
                Pat Udomprasert<br>
                Jon Carifio<br>
                John Lewis<br>
                Alyssa Goodman<br>
                Mary Dussault<br>
                Harry Houghton<br>
                Anna Nolin<br>
                Evaluator: Sue Sunbury<br>
                
                <h4><a href="https://www.worldwidetelescope.org/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a> Team:</h4>
                Peter Williams<br>
                A. David Weigel<br>
                Jon Carifio<br>
              </div>
              
              <funding-acknowledgment/>

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
      <div id="left-buttons-wrapper" :class="[!showGuidedContent ?'budge' : '']">
        <icon-button
          id="share"
          fa-icon="share-nodes"
          :color="accentColor"
          :focus-color="accentColor"
          :box-shadow="false"
          tooltip-text="Share view of this location"
          :show-tooltip="!mobile"
          @activate="copyShareURL"
          faSize="1x"
        ></icon-button>
        <icon-button
          id="my-location"
          fa-icon="street-view"
          :color="accentColor"
          :focus-color="accentColor"
          :box-shadow="false"
          tooltip-text="Use my location"
          :show-tooltip="!mobile"
          @update:modelValue="(value: boolean) => {
            if(value) {
              ($refs.geolocation as any).getLocation();
              showMyLocationDialog = true;
              learnerPath = 'Choose';
            }
            else {
              console.log('geolocation button pressed = false');
            }

          }"
          faSize="1x"
        ></icon-button>
      </div>
      <div id="location-progress" :class="[!showGuidedContent ?'budge' : '']">
        <geolocation-button
          :color="accentColor"
          :show-text-progress = "true"
          :hide-text = "true"
          :showCoords = "false"
          :hide-button = "true"
          :requirePermission = "false"
          :hasPermission = "true"
          ref="geolocation"
          @geolocation="(loc: GeolocationCoordinates) => { 
            myLocation = {
              latitudeDeg: loc.latitude, 
              longitudeDeg: loc.longitude
            };
            selectedLocation = 'My Location';
            locationDeg = myLocation;
            showMyLocationDialog = false;
            }"
          @error="(error: GeolocationPositionError) => { 
            $notify({
              group: 'geolocation-error',
              title: 'Error',
              text: error.message,
              type: 'error',
            }); 
            getMyLocation = false;
            console.log(error);
            }"
          />
      </div>
      
      <div id="mobile-zoom-control">
        <!-- {{ Math.round(Math.pow(10, userZoom)*100)/100 }} -->
          <div class="slider-padding">
            <v-icon>mdi-magnify-plus</v-icon>
          </div>
          <vue-slider 
            v-model="userZoom"
            direction="ttb"
            :min="1"
            :max="Math.round(Math.log10(360)*100)/100"
            :interval=".01"
            :color="accentColor"
            :tooltip="'none'"
            :duration="0"
            :height="wwtContentHeight ? `${0.5 * wwtContentHeight}px` : '200px'"
            :process-style="{ backgroundColor: 'rgb(255 193 203)' }"
            :dot-style="{ backgroundColor: accentColor, borderColor: 'black'}"
            ></vue-slider>
          <div class="slider-padding">
            <v-icon>mdi-magnify-minus</v-icon>
          </div>
      </div>
        <!-- <v-dialog
          scrim="false"
          v-model="showMyLocationDialog"
          max-width="400px"
          id="mylocation-popup-dialog"
        >
          <v-card>
            <v-card-text>
              Fetching your location...
            </v-card-text>
          </v-card>
        </v-dialog> -->
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
            <p>WATCH the April 8</p>
            <p class="highlight">TOTAL<br/>Solar Eclipse</p>
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
                icon="location-dot"
              /> Choose any location 
            </v-col>
            <v-col cols="12">
              <font-awesome-icon
                icon="puzzle-piece"
              /> Identify the path 
            </v-col>
            <v-col cols="12">
              <font-awesome-icon
                icon="video"
              />
            New! Video guide 
            </v-col>
          </v-row>
        </div>
        
        <div id="splash-screen-acknowledgements">
          This Mini Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-logos">
            <credit-logos/>
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
          <template v-slot:additional>
            <div id="intro-window-close-button">
            <font-awesome-icon
              size="xl"
              class="ma-1"
              color="#b3d5e6"
              icon='square-xmark'
              @click="inIntro = !inIntro"
              @keyup.enter="inIntro = !inIntro"
              tabindex="0"
              tooltip-location="start"
            /> 
          </div>
          </template>
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
              
              <ul>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="rocket" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>Explore</strong> what the eclipse will look like from different parts of the U.S.
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="location-dot" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>Select any location</strong> around the world. See and share how the eclipse would look from there.
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="puzzle-piece" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Identify the path of the annular eclipse for the U.S. in our <strong>Map Quiz</strong>.
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="book-open" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    <strong>Learn more</strong> about solar eclipses. 
                </v-list-item>
                <v-list-item density="compact">
                  <template v-slot:prepend>
                    <font-awesome-icon icon="circle-info" size="xl" class="bullet-icon"></font-awesome-icon>
                  </template>
                    Access <strong>User Guide</strong> on how to navigate this app. 
                </v-list-item>
              </ul>
              <p v-if="xSmallSize" class="mt-3">
                To access all features, {{ touchscreen ? "tap" : "click" }} 
                <font-awesome-icon  icon="circle-chevron-down" 
                color="black"
                id="inline-open-icon"
                size="lg"
                /> at top left.
              </p> 
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
          :prepend-icon="smallSize ? `` : `mdi-map-marker-radius`"
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
        :prepend-icon="smallSize ? `` : `mdi-clock`"
        variant="outlined"
        size="small"
        elevation="2"
        :text="selectedLocaledTimeDateString"
      > </v-chip>
      </div>
      <div id="top-switches">
        <hover-tooltip
            location="left"
            :disabled="mobile"
            id="viewer-mode-switch"
          >
            <template v-slot:target>
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
                @keyup.enter="viewerMode = viewerMode === 'SunScope' ? 'Horizon' : 'SunScope'"
                tabindex="0"
              >
              </v-switch>
            </template>
            Switch to {{ viewerMode === 'SunScope' ? 'Horizon' : 'Eclipse' }} View
        </hover-tooltip>

        <div id="track-sun-switch"> 
          <hover-tooltip
              location="left"
              :disabled="mobile"
            >
              <template v-slot:target>
                <v-switch
                  inset
                  hide-details
                  v-model="toggleTrackSun"
                  :ripple="false"
                  :color="accentColor"
                  true-icon="mdi-white-balance-sunny"
                  false-icon="mdi-image"
                  @keyup.enter="toggleTrackSun = !toggleTrackSun"
                  tabindex="0"
                >
                </v-switch>
            </template>
            {{ toggleTrackSun ? "Don't Track Sun" : 'Center on Sun' }}
          </hover-tooltip>
        </div>
      </div>
    </div>
    
    <div class="bottom-content">
      <div id="eclipse-percent-chip">
        <v-chip 
          v-if="showEclipsePercentage"
          :prepend-icon="smallSize ? `` : `mdi-sun-angle`"
          variant="outlined"
          elevation="2"
          :text="percentEclipsedText"
        > </v-chip>
      </div>
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
            <v-checkbox
                :color="accentColor"
                :disabled="wwtZoomDeg > 210"
                v-model="showEclipsePercentage"
                @keyup.enter="showEclipsePercentage = !showEclipsePercentage"
                label="Amount Eclipsed"
                hide-details
            />                      
          </div>
        </transition-expand>
      </div>

      <div id="video-icon">
            <icon-button
            v-model="showVideoSheet"
            id="video-icon"
            fa-icon="video"
            fa-size="lg"
            :color="accentColor"
            tooltip-text="Video guide"
            tooltip-location="start"
            :tooltip-offset="smallSize ? 0 : '10px'"
          ></icon-button>
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
              faSize="1x"
              :show-tooltip="!mobile"
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
              faSize="1x"
              :show-tooltip="!mobile"
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
              faSize="1x"
              :show-tooltip="!mobile"
            ></icon-button>
            <icon-button
              id="reset"
              :fa-icon="'rotate'"
              @activate="() => {
                    selectedTime = 1697292380000;
                    speedIndex = 3;
                    playbackRate = Math.pow(10, speedIndex);
                    playing = false;
                    toggleTrackSun = true;
                  }"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="Reset"
              tooltip-location="top"
              tooltip-offset="5px"
              faSize="1x"
              :show-tooltip="!mobile"
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
            @mousedown="() => {playing = false;}"
            >
            <template v-slot:thumb-label="item">
              {{ toTimeString(new Date(item.modelValue))  }}
            </template>
          </v-slider>
          <div id="change-optout">
            <icon-button
              md-icon="mdi-lock"
              @activate="() => showPrivacyDialog = true"
              :color="accentColor"
              :focus-color="accentColor"
              tooltip-text="Change privacy settings"
              tooltip-location="bottom"
              tooltip-offset="5px"
              :show-tooltip="!mobile"
              mdSize="1em"
            >
            </icon-button>
          </div>
          <icon-button
            id="set-time-now-button"
            @activate="() => {
              // selectedTime = times.reduce((a, b) => {
              //   return Math.abs(b - Date.now()) < Math.abs(a - Date.now()) ? b : a;
              // });
              selectedTime = Date.now();
              speedIndex = 0;
              playbackRate=1;
              playing = true;
              console.log('to now')
            }"
            :color="accentColor"
            tooltip-text="Go to current time"
            tooltip-location="top"
            tooltip-offset="5px"
            :show-tooltip="!mobile"
          >
            <template v-slot:button>
              Now
            </template>
          </icon-button>
        </span>      
      </div>
      <div id="body-logos" v-if= "!smallSize">
        <credit-logos/>
      </div>
    </div>


    <!-- Data collection opt-out dialog -->
    <v-dialog
      scrim="false"
      v-model="showPrivacyDialog"
      max-width="400px"
      id="privacy-popup-dialog"
    >
      <v-card>
        <v-card-text>
          To evaluate usage of this app, <strong>anonymized</strong> data may be collected, including locations viewed and map quiz responses. "My Location" data is NEVER collected.
        </v-card-text>
        <v-card-actions class="pt-3">
          <v-spacer></v-spacer>
          <v-btn
            color="#BDBDBD"
            href="https://www.cfa.harvard.edu/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
          Privacy Policy
          </v-btn>
          <v-btn
            color="#ff6666"
            @click="() => {
              responseOptOut = true;
              showPrivacyDialog = false;
            }"
          >
          Opt out
          </v-btn>
          <v-btn 
            color="green"
            @click="() => {
              responseOptOut = false;
              showPrivacyDialog = false;
            }"
          >
            Allow
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  <notifications group="copy-url" position="center top" classes="url-notification"/>
  <notifications group="geolocation-error" position="center top" />
  </div>
</v-app>
</template>

<script lang="ts">
import { defineComponent, toRaw, PropType } from "vue";
import { MiniDSBase, BackgroundImageset, skyBackgroundImagesets, MINIDS_BASE_URL } from "@minids/common";
import { GotoRADecZoomParams } from "@wwtelescope/engine-pinia";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Folder, Grids, LayerManager, Planets, Poly, Settings, WWTControl, Place, Texture, CAAMoon } from "@wwtelescope/engine";
import { Annotation2, Poly2 } from "./Annotation2";
import { MCSelectionStatus } from "./MCRadiogroup.vue";

import { getTimezoneOffset, formatInTimeZone } from "date-fns-tz";
import tzlookup from "tz-lookup";
import { v4 } from "uuid";

import { drawSkyOverlays, makeAltAzGridText, layerManagerDraw, updateViewParameters, renderOneFrame } from "./wwt-hacks";

type SheetType = "text" | "video" | null;
type LearnerPath = "Explore" | "Choose" | "Learn" | "Answer";
type ViewerMode = "Horizon" | "SunScope";
type MoonImageFile = "moon.png" | "moon-dark-gray-overlay.png" | "moon-sky-blue-overlay.png";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;


// number of milliseconds since January 1, 1970, 00:00:00 UTC
// month is indexed from 0..?!
// https://www.timeanddate.com/eclipse/solar/2023-october-14#eclipse-table
const eclipseStartTime = Date.UTC(2024, 3, 8, 15, 40); // partial eclipse starts at 15:40 UTC
const eclipseFinishTime = Date.UTC(2024, 3, 8, 20, 55); // partial eclipse ends at  20:55 UTC
const extraTime = 1000 * 60 * 60 * 5; // add 2 hours to the end time to make sure we get the full eclipse
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
const USER_SELECTED = "User Selected" as const;
const UUID_KEY = "eclipse-mini-uuid" as const;
const OPT_OUT_KEY = "eclipse-mini-optout" as const;
const USER_SELECTED_LOCATIONS_KEY = "user-selected-locations" as const;
const PRESET_LOCATIONS_KEY = "preset-locations" as const;
const MC_RESPONSES_KEY = "mc-responses" as const;

import { dsvFormat } from "d3-dsv";
import { eclipse } from "./eclipse_path";

function parseLatLon(latD: string, latM: string, lonD: string, lonM: string): LocationDeg {

  const lat = +latD;
  // split off last character of latM as N/S
  const latSign = latM.slice(-1) === "N" ? 1 : -1;
  const latMin = +latM.slice(0, -1);
  const latDeg = latSign * (lat + latMin / 60);
  
  const lon = +lonD;
  // split off last character of lonM as W/E
  const lonSign = lonM.slice(-1) === "E" ? 1 : -1;
  const lonMin = +lonM.slice(0, -1);
  const lonDeg = lonSign * (lon + lonMin / 60);
  
  return {
    latitudeDeg: latDeg,
    longitudeDeg: lonDeg
  };
}

function parseEclipsePath(csv: string) {
  const tsv = dsvFormat('|');

  return tsv.parseRows(csv, (d) => {
    // parse rows based on space delimieted eclipse_path.txt

    const utcString = d[1].split(':');
    const utc = new Date(eclipseStartTime);
    utc.setUTCHours(+utcString[0]);
    utc.setUTCMinutes(+utcString[1]);
    utc.setUTCSeconds(0);
    utc.setUTCMilliseconds(0);
    
    
    const northernLimit = parseLatLon(d[2], d[3], d[4], d[5]);
    const southernLimit = parseLatLon(d[6], d[7], d[8], d[9]);
    const centerLine = parseLatLon(d[10], d[11], d[12], d[13]);
    const ratio = +d[14];
    const sunAlt = +d[15];
    const sunAz = +d[16];
    const pathWidth = +d[17];
    const eclipseDuration = d[18];
    // content for the popup : eclipse time (UTC) and duration
    const tz = tzlookup(centerLine.latitudeDeg, centerLine.longitudeDeg);
    const localTimeString = formatInTimeZone(utc.getTime(), tz, "HH:mm (zzz)");
    const popupContent = `Eclipse time (local): ${localTimeString} <br/>Eclipse time (UTC): ${d[1]} <br/>Duration: ${eclipseDuration}`;
    
    return {
      'utc': utc.getTime(),
      'northernLimit': northernLimit,
      'southernLimit': southernLimit,
      'centerLine': centerLine,
      'ratio': ratio,
      'sunAlt': sunAlt,
      'sunAz': sunAz,
      'pathWidth': pathWidth,
      'eclipseDuration': eclipseDuration,
      'popupContent': popupContent
    };
    
  });
}

const eclipsePath = parseEclipsePath(eclipse);

// convert the eclipse path to a GeoJson feature collection
const eclipsePathGeoJson = {
  "name": "Eclipse Path",
  "type": "FeatureCollection",
  "features": eclipsePath.map((d) => {
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [d.centerLine.longitudeDeg, d.centerLine.latitudeDeg]
      },
      "properties": {
        "utc": d.utc,
        "eclipseDuration": d.eclipseDuration,
        "popupContent": d.popupContent,
        "absoluteRadius": d.pathWidth * 1000 / 2
      }
    };
  })
};

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
    const _annularEclipseTimeUTC = new Date("2024-04-08T18:18:00Z");

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

    const selections = window.localStorage.getItem(USER_SELECTED_LOCATIONS_KEY);
    const userSelectedLocationsVisited: [number, number][] = selections ? (this.parseJSONString(selections) ?? []) : [];
    if (queryData) {
      userSelectedLocationsVisited.push([queryData.latitudeDeg, queryData.longitudeDeg]);
    }

    const presets = window.localStorage.getItem(PRESET_LOCATIONS_KEY);
    const presetLocationsVisited: string[] = presets ? (this.parseJSONString(presets) ?? []) : [];
    const selectedLocation = queryData ? USER_SELECTED : "Greatest Eclipse";
    presetLocationsVisited.push(selectedLocation);

    const responses = window.localStorage.getItem(MC_RESPONSES_KEY);
    const mcResponses: string[] = responses ? (this.parseJSONString(responses) ?? []) : [];

    const uuid = window.localStorage.getItem(UUID_KEY) ?? v4();
    window.localStorage.setItem(UUID_KEY, uuid);

    const storedOptOut = window.localStorage.getItem(OPT_OUT_KEY);
    const responseOptOut = typeof storedOptOut === "string" ? storedOptOut === "true" : null;
    return {
      uuid,
      responseOptOut: responseOptOut as boolean | null,
      mcResponses,

      showSplashScreen: true,
      backgroundImagesets: [] as BackgroundImageset[],
      sheet: null as SheetType,
      layersLoaded: false,
      positionSet: false,
      imagesetFolder: null as Folder | null,

      showMapTooltip: false,
      showTextTooltip: false,
      showMapSelector: false,
      showLocationSelector: false,
      getMyLocation: false,
      myLocation: null as LocationDeg | null,

      showWWTGuideSheet: false,
      
      selectionProximity: 4,
      pointerMoveThreshold: 6,
      isPointerMoving: false,
      pointerStartPosition: null as { x: number; y: number } | null,  

      // "Greatest Eclipse"
      selectedTime:  _annularEclipseTimeUTC.getTime(),
      selectedTimezone: "America/Mexico_City",
      location: queryData ? {
        latitudeRad: D2R * queryData.latitudeDeg,
        longitudeRad: D2R * queryData.longitudeDeg
      } : {
        latitudeRad: D2R * 25.2866667,
        longitudeRad: D2R * -104.1383333
      } as LocationRad,
      selectedLocation: queryData ? USER_SELECTED : "Greatest Eclipse",
      locationErrorMessage: "",
      
      syncDateTimeWithWWTCurrentTime: true,
      syncDateTimewithSelectedTime: true,

      presetMapOptions: {
        templateUrl: "https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg",
        minZoom: 1,
        maxZoom: 16,
        attribution: 'Maptiles by Stamen Design, under <a target="_blank" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" href="https://www.openstreetmap.org/#map=4/38.01/-95.84">OpenStreetMap</a>, under <a target="_top" href="http://creativecommons.org/licenses/by-sa/2.0">CC BY-SA 2.0</a>',
        ext: 'jpg',
        ...initialView
      },

      userSelectedMapOptions: {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        ...(queryData ? { ...queryData, initialZoom: 5 } : initialView)
      },
      
      eclipseCenterLine: eclipsePath,

      eclipsePathLocations: {
        // locations taken from https://science.nasa.gov/eclipses/future-eclipses/eclipse-2024/where-when/
        "Greatest Eclipse": {
          name: "Greatest Eclipse",
          latitudeRad: D2R * 25.2866667,
          longitudeRad: D2R * -104.1383333,
          eclipseFraction: 1
        },

        // "Place": {
        //   name: "Place",
        //   latitudeRad: D2R * latitude,
        //   longitudeRad: D2R * longitude,
        //   eclipseFraction: 1.0
        // },
        
        "Dallas, Texas":{
          name: "Dallas, Texas",
          latitudeRad: D2R * 32.7767,
          longitudeRad: D2R * -96.7970,
          eclipseFraction: 1.0
        },
        
        "Idabel, OK": {
          name: "Idabel, OK",
          latitudeRad: D2R * 33.8959,
          longitudeRad: D2R * -94.8261,
          eclipseFraction: 1.0
        },
        
        "Little Rock, AR": {
          name: "Little Rock, AR",
          latitudeRad: D2R * 34.7465,
          longitudeRad: D2R * -92.2896,
          eclipseFraction: 0.99 // appears to be total but too far south for WWT to do the eclipse doohickey
        },
        
        "Poplar Bluff, MO": {
          name: "Poplar Bluff, MO",
          latitudeRad: D2R * 36.7570,
          longitudeRad: D2R * -90.3929,
          eclipseFraction: 1.0
        },
        
        "Paducah, KY": {
          name: "Paducah, KY",
          latitudeRad: D2R * 37.0834,
          longitudeRad: D2R * -88.6000,
          eclipseFraction: .99 // appears to be total but too far south for WWT to do the eclipse doohickey
        },
        
        "Evansville, IN": {
          name: "Evansville, IN",
          latitudeRad: D2R * 37.9716,
          longitudeRad: D2R * -87.5711,
          eclipseFraction: 1.0
        },
        
        "Cleveland, OH": {
          name: "Cleveland, OH",
          latitudeRad: D2R * 41.4993,
          longitudeRad: D2R * -81.6944,
          eclipseFraction: 1.0
        },
        
        "Erie, PA": {
          name: "Erie, PA",
          latitudeRad: D2R * 42.1292,
          longitudeRad: D2R * -80.0851,
          eclipseFraction: 1.0
        },
        
        "Buffalo, NY": {
          name: "Buffalo, NY",
          latitudeRad: D2R * 42.8864,
          longitudeRad: D2R * -78.8784,
          eclipseFraction: 1.0
        },
        
        "Burlington, VT": {
          name: "Burlington, VT",
          latitudeRad: D2R * 44.4759,
          longitudeRad: D2R * -73.2121,
          eclipseFraction: 1.0
        },
        
        "Lancaster, NH": {
          name: "Lancaster, NH",
          latitudeRad: D2R * 44.4872,
          longitudeRad: D2R * -71.5692,
          eclipseFraction: 0.99
        }, // appears to be total but too far south for WWT to do the eclipse doohickey
        
        "Cariibou, ME": {
          name: "Cariibou, ME",
          latitudeRad: D2R * 46.8600,
          longitudeRad: D2R * -68.0111,
          eclipseFraction: 1.0
        },
        
        [USER_SELECTED]: { // by default, user selected is Greatest Eclipse
          name: USER_SELECTED,
          latitudeRad: D2R * 25.2866667,
          longitudeRad: D2R * -104.1383333,
          eclipseFraction: 1.0
        }
      } as Record<string, EclipseLocation>,

      currentPercentEclipsed: 0,

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

      showControls: true,
      showAltAzGrid: true,
      showHorizon: true,
      showTextSheet: false, 
      showEclipsePercentage: true, 
      showLinkToPath: false, 
      
      toggleTrackSun: true,
      
      times: times, 
      minTime: minTime,
      maxTime: maxTime,
      millisecondsPerInterval: MILLISECONDS_PER_INTERVAL,
      
      accentColor: "#f3de21",
      moonColor: "#CFD8DC",
      guidedContentHeight: "300px",
      showGuidedContent: true,
      inIntro: false,
      displaySwitchOn: true,
      displaySwitchOff: false,
      scrollUp: false,

      showPrivacyDialog: false,
      showMyLocationDialog: false,

      tab: 0,
      introSlide: 1,
      
      viewerMode: 'Horizon' as ViewerMode,

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

      quizAnswer: null as string | null,
      longAnswers: ['Eclipse moves North to South from Bismarck, ND through Denver, CO and Albuquerque, NM',
        'Eclipse moves West to East from Los Angeles, CA to Charlotte, NC',
        'Eclipse moves Northwest to South from Eugene, OR to San Antonio, TX'],

      sunPlace,
      moonPlace,

      queryData,
      //  source https://svs.gsfc.nasa.gov/5123/ shapefiles converted to geojson using mapshaper.org/
      // the order is the layer order form bottom to top
      geojson: [
        {
          url: 'https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/upath_hi.json',
          style: {fillColor: '#333', weight: 1, opacity: 0, fillOpacity: 0.3, id:"upath"}
        },
        {
          url: 'https://raw.githubusercontent.com/johnarban/wwt_interactives/main/images/center.json',
          style: {color: '#ff0000', weight: 2, opacity: 1, fillOpacity: 0}
        },
        {
          'geojson': eclipsePathGeoJson as GeoJSON.FeatureCollection,
          'style': {radius:3,fillColor: '#ccc', color:'#222', weight: 2, opacity: 0, fillOpacity: 0}
        }
      ],

      presetLocationsVisited,
      userSelectedLocationsVisited
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
    this.places = Object.entries(this.eclipsePathLocations).filter(([key, _]) => key !== USER_SELECTED)
      .sort(([_, pl1], [__, pl2]) => pl1.longitudeRad - pl2.longitudeRad)
      .map(([_, pl]) => {
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



      // console.log(this);
      this.setTime(this.dateTime);

      this.wwtSettings.set_localHorizonMode(true);
      this.wwtSettings.set_showAltAzGrid(this.showAltAzGrid);
      this.wwtSettings.set_showAltAzGridText(this.showAltAzGrid);

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
      // this.setBackgroundImageByName("Black Sky Background");
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

      // this.setTimeforSunAlt(10); // 10 degrees above horizon
      
      // console.log("selected time", this.selectedTime);

      setInterval(() => {
        if (this.playing) {
          const time = this.wwtCurrentTime;
          this.selectedTime = time.getTime();
          this.updateFrontAnnotations(time);
        }
      }, 500);
      
      window.addEventListener('keyup', (event: KeyboardEvent) => {
        if (["Esc", "Escape"].includes(event.key) && this.showVideoSheet) {
          this.showVideoSheet = false;
        }
      });

    });

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });

    this.showControls = !this.mobile;
    this.showGuidedContent = !this.xSmallSize;

    this.updateSkyOpacityForSunAlt(10 * D2R); // 10 degrees above horizon

    const element = document.getElementById("guided-content-container");
    if (element) {
      element.addEventListener("scroll", () => this.onScroll());
    }
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
      if (this.smallSize) {
        return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd, HH:mm:ss (zzz)');
      } else {
        return formatInTimeZone(this.dateTime, this.selectedTimezone, 'MM/dd/yyyy HH:mm:ss (zzz)');
      }


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
    smAndUp(): boolean {
      return this.$vuetify.display.smAndUp;
    },
    xSmallSize(): boolean {
      return this.$vuetify.display.xs;
    },
    
    mobile(): boolean {
      return this.smallSize && this.touchscreen;
    },
    cssVars() {
      return {
        '--accent-color': this.accentColor,
        '--sky-color': this.skyColorLight,
        '--app-content-height': this.showInfoSheet ? '100%' : '100%',
        '--top-content-height': this.showGuidedContent? this.guidedContentHeight : this.guidedContentHeight,
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
    
    userZoom: {
      get(): number {
        return Math.round(Math.log10(this.wwtZoomDeg)*100)/100;
      },
      set(value: number) {
        this.gotoRADecZoom({
          raRad: this.wwtRARad,
          decRad: this.wwtDecRad,
          zoomDeg: Math.pow(10,value),
          rollRad: 0,
          instant: true
        });
      }
    },
    
    wwtContentHeight(): number | null {
      // console.log("wwtContentHeight", this.guidedContentHeight);
      const mainContent = document.getElementById('main-content');
      const windowHeight = window.innerHeight;
      
      if (mainContent) {
        console.log(windowHeight);
        return windowHeight; // - parseInt(this.guidedContentHeight.replace('px', ''));
      } else {
        return null;
      }
    } , 

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
      // console.log('maxPlaybackRate', MILLISECONDS_PER_INTERVAL / minDuration);
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
      if ((this.selectedLocation !== USER_SELECTED) && (this.selectedLocation !== 'My Location')) {
        return this.selectedLocation;
      } else {
        const ns = this.locationDeg.latitudeDeg >= 0 ? 'N' : 'S';
        const ew = this.locationDeg.longitudeDeg >= 0 ? 'E' : 'W';
        const lat = Math.abs(this.locationDeg.latitudeDeg).toFixed(3);
        const lon = Math.abs(this.locationDeg.longitudeDeg).toFixed(3);
        return `${lat}° ${ns}, ${lon}° ${ew}`;
      }
    },

    percentEclipsedText(): string {
      const percentEclipsed = Math.abs(this.currentPercentEclipsed * 100).toFixed(0);
      return `Eclipsed: ${percentEclipsed}%`;
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

    showVideoSheet: {
      get(): boolean {
        return this.sheet === "video";
      },
      set(_value: boolean) {
        this.selectSheet('video');
        // if (!value) {
        //   // const video = document.querySelector("#info-video") as HTMLVideoElement;
        //   // video.pause();
        // }
      }
    },
  },

  methods: {

    onScroll() {
      const el = document.getElementById('guided-content-container');

      if (el) {
        const scrollUp = el.scrollTop > 0;
        if (this.scrollUp !== scrollUp) {
          this.scrollUp = scrollUp;
        }
      }

    },
    
    scrollToTop() {
      const element = document.getElementById("guided-content-container");
      if (element) {
        if (this.scrollUp) {
          element.scrollTo({ top: 0 });
        } else {
          element.scrollTo({ top: element.scrollHeight });
        }
      }
    },
    
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

    angleInZeroToTwoPi(angle: number): number {
      const twoPi = 2 * Math.PI;
      return ((angle% twoPi) + twoPi) % twoPi;
    },

    // This assumes that the input angles are in the range [0, 2pi)
    angleBetween(test: number, lower: number, upper: number): boolean {
      if (lower < upper) {
        return test >= lower && test <= upper;
      } else {
        return test >= lower || test <= upper;
      }
    },
    
    // eslint-disable-next-line @typescript-eslint/naming-convention
    greatCircleDistance(coord1: { RA: number; dec: number; }, coord2: { RA: number; dec: number; }): number {
      const ra1 = coord1.RA * 15 * D2R;
      const dec1 = coord1.dec * D2R;
      
      const ra2 = coord2.RA * 15 * D2R;
      const dec2 = coord2.dec * D2R;
      
      const cosD = Math.sin(dec1) * Math.sin(dec2) + Math.cos(dec1) * Math.cos(dec2) * Math.cos(ra1 - ra2);
      return Math.acos(cosD);
    },
    
    updateIntersection() {

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const canvasHeight: number = this.wwtControl.canvas.height;

      const sunPosition = Planets['_planetLocations'][0];
      const moonPosition = Planets['_planetLocations'][9];
      const sunPoint = this.findScreenPointForRADec({ ra: sunPosition.RA * 15, dec: sunPosition.dec });
      const moonPoint = this.findScreenPointForRADec({ ra: moonPosition.RA * 15, dec: moonPosition.dec });
      moonPoint.y = canvasHeight - moonPoint.y;
      sunPoint.x -= moonPoint.x;
      sunPoint.y = canvasHeight - sunPoint.y - moonPoint.y;

      const jd = this.getJulian(this.selectedDate);
      const distanceToMoon = CAAMoon.radiusVector(jd);
      const distanceToSun = 149_597_871;

      const rMoon = 1740;  // radius of the moon in km
      const rSun = 696_340;
      const thetaMoon = Math.atan2(rMoon, distanceToMoon);
      const thetaSun = Math.atan2(rSun, distanceToSun);

      // The factor of 6 comes from the relation between wwtZoomDeg and the actual size of the FOV in degrees
      const rMoonPx = 6 * thetaMoon * canvasHeight / (this.wwtZoomDeg * D2R);
      const rSunPx = 6 * thetaSun * canvasHeight / (this.wwtZoomDeg * D2R);

      const points: { x: number; y: number }[] = [];
      const sunMoonAngle = this.greatCircleDistance(sunPosition, moonPosition);
      const sunMoonDistance = 6 * sunMoonAngle * canvasHeight / (this.wwtZoomDeg * D2R);

      // If there's no sun/moon intersection, no need to continue
      if (sunMoonDistance > rMoonPx + rSunPx) {
        this.currentPercentEclipsed = 0;
        return;
      }

      const moonInsideSun = sunMoonDistance < rSunPx - rMoonPx;
      const sunInsideMoon = sunMoonDistance < rMoonPx - rSunPx;

      const dSq = sunMoonDistance * sunMoonDistance;
      const rMoonSq = rMoonPx * rMoonPx;
      const rSunSq = rSunPx * rSunPx;

      const moonArea = Math.PI * rMoonSq;
      const sunArea = Math.PI * rSunSq;
      if (moonInsideSun || sunInsideMoon) {
        this.currentPercentEclipsed = moonArea / sunArea;
      } else {
        // See https://mathworld.wolfram.com/Circle-CircleIntersection.html
        const intersectionArea =
          rMoonSq * Math.acos((dSq + rMoonSq - rSunSq) / (2 * sunMoonDistance * rMoonPx)) +
          rSunSq * Math.acos((dSq + rSunSq - rMoonSq) / (2 * sunMoonDistance * rSunPx)) -
          0.5 * Math.sqrt(
            (rSunPx + rMoonPx - sunMoonDistance) * (sunMoonDistance + rMoonPx - rSunPx) * (sunMoonDistance - rMoonPx + rSunPx) * (sunMoonDistance + rSunPx + rMoonPx)
          );
        const percentEclipsed = intersectionArea / sunArea;
        this.currentPercentEclipsed = isNaN(percentEclipsed) ? 1 : percentEclipsed;
      }

      // If we're using the regular WWT moon, or in sun scope mode, we don't want the overlay but did want the percentage eclipsed
      if (this.useRegularMoon || this.viewerMode === "SunScope") {
        return;
      }

      const n = 50;
      
      // If the moon/sun is completely "inside" of the sun/moon
      if (moonInsideSun || sunInsideMoon) {
        for (let i = 0; i <= n; i++) {
          const angle = (i / n) * 2 * Math.PI;
          points.push({ x: rMoonPx * Math.cos(angle), y: rMoonPx * Math.sin(angle) });
        }
      } else {

        let x1: number;
        let y1: number;
        let x2: number;
        let y2: number;

        if (sunPoint.x === 0) {

          const ysh = 0.5 * sunPoint.y;
          if (ysh >= rMoonPx) {
            return;
          }
          x1 = Math.sqrt(rMoonPx * rMoonPx - ysh * ysh);
          if (isNaN(x1)) {
            console.error("x1 is NaN");
            this.currentPercentEclipsed = 0;
            return;
          }
          y1 = ysh;
          x2 = -x1;
          y2 = ysh;

        } else {

          // m is the slope of the line joining the moon and the sun
          // mPerp is the slope of a line perpendicular to the line joining the moon and the sun
          // yInt is the y-intercept of a line passing through the two points of intersection
          const mPerp = -sunPoint.x / (sunPoint.y + 1e-5);
          const yInt = (sunPoint.x * sunPoint.x + sunPoint.y * sunPoint.y - (rSunPx * rSunPx - rMoonPx * rMoonPx)) / (2 * (sunPoint.y + 1e-5));

          // Find the x-coordinates of the edge points of the moon-sun intersection
          const a = (1 + mPerp * mPerp);
          const b = 2 * mPerp * yInt;
          const c = yInt * yInt - rMoonPx * rMoonPx;

          const sqrDisc = Math.sqrt(b * b - 4 * a * c);
          if (isNaN(sqrDisc)) {
            console.error("sqrDisc is NaN");
            this.currentPercentEclipsed = 0;
            return;
          }
          x1 = (-b + sqrDisc) / (2 * a);
          x2 = (-b - sqrDisc) / (2 * a);
          y1 = mPerp * x1 + yInt;
          y2 = mPerp * x2 + yInt;
        }

        // The standard-position angle of the sun-moon line in the moon's reference frame
        const alpha = this.angleInZeroToTwoPi(Math.atan2(sunPoint.y, sunPoint.x));

        let theta1 = Math.atan2(y1 / rMoonPx, x1 / rMoonPx);
        let theta2 = Math.atan2(y2 / rMoonPx, x2 / rMoonPx);
        theta1 = this.angleInZeroToTwoPi(theta1);
        theta2 = this.angleInZeroToTwoPi(theta2);
        if (!this.angleBetween(alpha, theta1, theta2)) {
          const t = theta1;
          theta1 = theta2;
          theta2 = t;
        }

        if (theta1 > theta2) {
          theta1 -= 2 * Math.PI;
        }

        const rangeSize = theta2 - theta1;
        for (let i = 0; i <= n; i++) {
          const angle = theta1 + (i / n) * rangeSize;
          points.push({ x: rMoonPx * Math.cos(angle), y: rMoonPx * Math.sin(angle) });
        }


        // We now need to somewhat repeat this analysis in the Sun frame

        let thetaS1 = Math.atan2((y1 - sunPoint.y) / rSunPx, (x1 - sunPoint.x) / rSunPx);
        let thetaS2 = Math.atan2((y2 - sunPoint.y) / rSunPx, (x2 - sunPoint.x) / rSunPx);
        thetaS1 = this.angleInZeroToTwoPi(thetaS1);
        thetaS2 = this.angleInZeroToTwoPi(thetaS2);
        const alphaS = this.angleInZeroToTwoPi(Math.PI + alpha);
        if (!this.angleBetween(alphaS, thetaS1, thetaS2)) {
          const t = thetaS1;
          thetaS1 = thetaS2;
          thetaS2 = t;
        }

        if (thetaS1 > thetaS2) {
          thetaS1 -= 2 * Math.PI;
        }
        const rangeSizeS = thetaS2 - thetaS1;
        for (let i = 0; i <= n; i++) {
          const angle = thetaS1 + (i / n) * rangeSizeS;
          points.push({ x: rSunPx * Math.cos(angle) + sunPoint.x, y: rSunPx * Math.sin(angle) + sunPoint.y });
        }
      }

      // We made a translation into the moon's frame, so undo that
      for (let i = 0; i < points.length; i++) {
        points[i].x += moonPoint.x;
        points[i].y += moonPoint.y;
      }

      const centroidX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const centroidY = points.reduce((s, p) => s + p.y, 0) / points.length;

      // The fact that we're going to re-flip the y axis makes the sign here opposite from what one would expect
      points.sort((p1, p2) => - Math.atan2(p2.y - centroidY, p2.x - centroidX) + Math.atan2(p1.y - centroidY, p1.x - centroidX));

      const locations = points.map(pt => this.findRADecForScreenPoint({ x: pt.x, y: canvasHeight - pt.y }));
      const overlay = new Poly2();
      overlay.set_fill(true);
      const color = "#1F1F1F";
      overlay.set_fillColor(color);
      overlay.set_lineColor(color);
      locations.forEach(pt => overlay.addPoint(pt.ra, pt.dec));
      Annotation2.addAnnotation(overlay);
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
      this.wwtSettings.set_locationLng(R2D * this.location.longitudeRad);
    },

    updateLocation(location: string) {
      if (location == null) {
        return;
      }
      // console.log("updateLocation", location);
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
      // console.log("updateLocationFromMap", location);
      this.selectedLocation = USER_SELECTED;
      this.locationDeg = location;

      this.eclipsePathLocations[USER_SELECTED] = {
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
        this.updateFrontAnnotations(this.dateTime);
      });
    },

    sendDataToDatabase() {
      if (this.responseOptOut) {
        return;
      }
      fetch(`${MINIDS_BASE_URL}/solar-eclipse-2024/response`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Authorization": process.env.VUE_APP_CDS_API_KEY ?? ""
        },
        body: JSON.stringify({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          user_uuid: this.uuid, mc_responses: this.mcResponses,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          preset_locations: toRaw(this.presetLocationsVisited), user_selected_locations: toRaw(this.userSelectedLocationsVisited)
        })
      });
    },

    onAnswerSelected(event: MCSelectionStatus) {
      if (event.text === "C") {
        this.showLinkToPath = true;
      }
      this.mcResponses.push(event.text);
      window.localStorage.setItem(MC_RESPONSES_KEY, JSON.stringify(this.mcResponses));
      this.sendDataToDatabase();
    },

    logLocation() {
      // console.log(this.location.latitudeRad * R2D, this.location.longitudeRad * R2D);
    },
    
    logPosition() {
      // console.log(this.wwtRARad * R2D, this.wwtDecRad * R2D);
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
      this.updateFrontAnnotations(this.dateTime);
    },

    updateFrontAnnotations(when: Date | null = null) {
      try {
        this.removeAnnotations();
      }
      finally {
        this.updateIntersection();
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
      this.$nextTick(() => {
        guidedContentContainer = document.getElementById('guided-content-container') as HTMLElement;
        
        if (guidedContentContainer) {
          const height = guidedContentContainer.clientHeight;
          // console.log("height", height);
          this.guidedContentHeight = `${height}px`;
        } else {
          this.guidedContentHeight = '0px';
        }
      });
    },
    
    onResize() {
      // get height of #guided-content-container
      this.$nextTick(() => {
        this.updateGuidedContentHeight();
      });
      this.updateGuidedContentHeight();
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
      // console.log('=== startHorizonMode ===');
      return;
    },

    startSolarScopeMode() {
      this.wwtSettings.set_localHorizonMode(false);
      this.showAltAzGrid = false;
      this.skyColor = this.skyColorNight;
      this.horizonOpacity = this.sunPosition.altRad > (0 + 0.5 * D2R) ? 1 : 0.6;
      this.updateFrontAnnotations(); // manually update horizon
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
      // console.log('=== startSolarScopeMode ===');
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
      // console.log("rise", this.toLocaleDateString(new Date(out.rising as number)) + " " + this.toLocaleTimeString(new Date(out.rising as number)));
      // console.log("set", this.toLocaleDateString(new Date(out.setting as number)) + " " + this.toLocaleTimeString(new Date(out.setting as number)));
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

    updateSkyOpacityForSunAlt(altRad: number) {
      const _civilTwilight = -6 * D2R;
      // const _nauticalTwilight = 2 * _civilTwilight;
      const astronomicalTwilight = 3 * _civilTwilight;
      
      const sunAlt = altRad;
      this.skyOpacity = (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
      this.skyOpacity = this.skyOpacity * (1 - 0.75 * Math.pow(Math.E,-Math.pow((this.currentPercentEclipsed -1),2)/(0.09)));
      this.updateMoonTexture();

      const dssOpacity = sunAlt > 0 ? 0 : 1 - (1 + Math.atan(Math.PI * sunAlt / (-astronomicalTwilight))) / 2;
      this.setForegroundOpacity(dssOpacity * 100);
    },

    getplaybackRate(rate: string) {
      // console.log('setplaybackRate', rate);
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
      const baseURL = `${window.location.origin}${window.location.pathname}`;
      const url = `${baseURL}?lat=${this.locationDeg.latitudeDeg}&lon=${this.locationDeg.longitudeDeg}`;
      navigator.clipboard
        .writeText(url)
        .then(() =>
          this.$notify({
            group: "copy-url",
            type: "success",
            text: "URL copied to clipboard. Paste to share with friends!",
            duration: 5000,
            ignoreDuplicates: true
          })
        )
        .catch((_err) =>
          this.$notify({
            group: "copy-url",
            type: "error",
            text: "Failed to copy URL",
            duration: 5000,
            ignoreDuplicates: true
          })
        );
    },

    parseJSONString(json: string): JSON | null {
      try {
        return JSON.parse(json);
      } catch {
        return null;
      }
    },

  },

  watch: {
    showGuidedContent(_val: boolean) {
      this.onResize();
      this.$nextTick(() => {
        this.onScroll();
      });
      
    },

    cssVars(_css) {
      // console.log(_css);
    },
    
    responseOptOut(optOut: boolean) {
      window.localStorage.setItem(OPT_OUT_KEY, String(optOut));
    },

    inIntro(value: boolean) {
      if (!value && !this.showSplashScreen && this.responseOptOut === null) {
        this.showPrivacyDialog = true;
      }
    },

    showAltAzGrid(show: boolean) {
      this.wwtSettings.set_showAltAzGrid(show);
      this.wwtSettings.set_showAltAzGridText(show);
    },

    showHorizon(_show: boolean) {
      this.updateFrontAnnotations();
      this.updateMoonTexture();
    },

    showSky(_show: boolean) {
      this.updateFrontAnnotations();
      this.updateMoonTexture();
    },

    wwtRollRad(angle: number) {
      if (angle !== 0) {
        this.gotoRADecZoom({
          raRad: this.wwtRARad,
          decRad: this.wwtDecRad,
          zoomDeg: this.wwtZoomDeg,
          rollRad: 0,
          instant: true
        });
      }
    },

    useRegularMoon(_show: boolean) {
      this.updateMoonTexture();
      this.updateFrontAnnotations(this.dateTime);
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
          // setTimeout(() => {
          //   this.playing = true;
          // }, 1000);
        }
        
        return;
      }
      this.updateFrontAnnotations(time);
    },

    location(loc: LocationRad, oldLoc: LocationRad) {
      const locationDeg: [number, number] = [R2D * loc.latitudeRad, R2D * loc.longitudeRad];
      
      if (oldLoc.latitudeRad * loc.latitudeRad < 0) {
        Grids._altAzTextBatch = null;
      }

      this.selectedTimezone = tzlookup(...locationDeg);
      this.playing = false;
      this.updateWWTLocation();

      // We need to let the location update before we redraw the horizon and overlay
      // Not a huge fan of having to do this, but we really need a frame render to update e.g. sun/moon positions
      this.wwtControl.renderOneFrame();
      this.updateFrontAnnotations();

      this.centerSun();
    },

    locationDeg(loc: LocationDeg) {
      if (this.selectedLocation === USER_SELECTED) {
        this.userSelectedLocationsVisited.push([loc.latitudeDeg, loc.longitudeDeg]);
        window.localStorage.setItem(USER_SELECTED_LOCATIONS_KEY, JSON.stringify(this.userSelectedLocationsVisited));
        this.sendDataToDatabase();
      }
    },

    selectedLocation(locname: string) {
      if (!(locname in this.eclipsePathLocations)) {
        // console.log(`location ${locname} not found in eclipsePathLocations`);
        return;
      }
      if ((locname !== USER_SELECTED) && (locname !== 'My Location') ) {
        this.presetLocationsVisited.push(locname);
        window.localStorage.setItem(PRESET_LOCATIONS_KEY, JSON.stringify(this.presetLocationsVisited));
        this.sendDataToDatabase();
      }
      // console.log("selected location", locname);
    },

    playing(play: boolean) {
      console.log(`${play ? 'Playing:' : 'Stopping:'} at ${this.playbackRate}x real time`);
      this.setClockSync(play);
    },

    showSplashScreen(val: boolean) {
      if (!val) {
        this.inIntro = true; 
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
      this.updateFrontAnnotations();
    },

    sunAboveHorizon(isAbove: boolean) {
      // console.log(`The sun is ${isAbove ? 'above' : 'below'} the horizon`);
      // this.showSky = isAbove; // just turn it off
      this.horizonOpacity = isAbove ? 1 : 0.85;
    },

    sunPosition(pos: EquatorialRad & HorizontalRad) {

      this.updateSkyOpacityForSunAlt(pos.altRad);
      return;
    },
    
    currentPercentEclipsed(_frac: number) {
      // this.skyOpacity = 1 - frac;
      this.updateFrontAnnotations();
    },

    toggleTrackSun(val: boolean) {
      // this turns of sun tracking
      // console.log("toggleTrackSun", val);
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

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
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
  font-size: var(--default-font-size);
}

.leaflet-grab {
      cursor: cell;
    }
    
.leaflet-dragging .leaflet-grab {
  cursor: all-scroll;
}

.v-chip {
  border: none;
  color: blue;
  background-color: white;
  opacity: 1;
  padding: 0.5em;
}  

#main-content {
  position: relative;
  // top: var(--top-content-height);
  width: 100%;
  height: calc(var(--app-content-height) - var(--top-content-height));
  overflow: hidden;
  // border: 2px solid blue;

  // transition: height 0.1s ease-in-out;
  .icon-wrapper {
    -webkit-user-select:none;
    -moz-user-select:none;
    user-select: none;
  }

  
}



#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  position: relative;

  .wwtelescope-component {
    position: relative;
    // top: 0;
    width: 100%;
    height: 100%;
    // border-style: none;
    // border-width: 0;
    // border: 3px solid red;
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

#left-buttons-wrapper {
  position: absolute;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 599px) {
    top: 2.5rem;
  }

  @media (min-width: 600px) {
    top: 0.7rem;
  }

  &.budge {
    left: 0.5rem;

    @media (max-width: 599px) {
      top: 4.8rem;
    }

    @media (min-width: 600px) {
      top: 3.5rem;
    }
  }
  
  .icon-wrapper {
    padding-inline: 0.5em;
    padding-block: 0.6em;
  }

  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }
}

#location-progress {
  position: absolute;


  @media (max-width: 599px) {
    left: 1.2rem;
    top: 7rem;
  }

  @media (min-width: 600px) {
    left: 1rem;
    top: 6.5rem;
  }

  &.budge {
    left: 0.7rem;

    @media (max-width: 599px) {
      top: 9.5rem;
    }

    @media (min-width: 600px) {
      top: 8.7rem;
    }
  }
}

.url-notification {
  margin-top: 45vh;
  border-radius: 5px;
  font-size: calc(1.1 * var(--default-font-size));
  padding: 1em;

  &.success {
    background-color: #9a009a;
  }
  &.error {
    background-color: #b30000;
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
  top: auto;
  bottom: 1rem;
  right: 0.5rem;
  width: calc(100% - 1rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
  // outline: 1px solid lime;
}

#tools {
  z-index: 10;
  color: #fff;
  width: 100%;
  gap: 5px;

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
  border: solid 1px var(--accent-color);
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  pointer-events: auto;

  .v-label {
    color: var(--accent-color);
    opacity: 1;
    font-size: var(--default-font-size);
  }

  #control-checkboxes {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-left: calc(0.5 * var(--default-line-height));

    .v-checkbox .v-selection-control {
      font-size: calc(1.1 * var(--default-font-size));
      height: calc(1.2 * var(--default-line-height));
      min-height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__input {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__wrapper {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
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

#text-credits {
  margin-block: 1rem;
  width: 100%;
  color: #ddd;
  font-size: calc(1.1 * var(--default-font-size));
  line-height: calc(1.1 * var(--default-line-height));
  display: flex;
  flex-direction: column;
  text-align: left;

  h4 {
    margin-top: 0.6rem;
    margin-bottom: 0.3rem;
  }
}

#left-buttons, #right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

#splash-overlay {
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  color: var(--moon-color);

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }


  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;
  padding-top: 4rem;
  padding-bottom: 1rem;

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
    color: #444444;

    @media (max-width: 700px) {
      -webkit-text-stroke: 0.8px var(--accent-color);
    }

    @media (min-width: 701px) {
      -webkit-text-stroke: 0.1px var(--accent-color);
    }

  
    // make uppercase
    text-transform: uppercase;
    font-weight: bolder;
  }
  
  p.small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    position: absolute;
    top: 0.5rem;
    right: 1.75rem;
    text-align: end;
    color: var(--accent-color);
    font-size: min(8vw, 5vh);

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    line-height: 130%;
    
  }

  #splash-screen-guide {
    margin-block: 1.5em;
    font-size: min(5vw, 4vh);
    line-height: 140%;
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
    font-size: calc(1.7 * var(--default-font-size));
    line-height: calc(1.5 * var(--default-line-height));
    width: 70%; 
  }

  #splash-screen-logos {
    margin-block: 0.75em;

    img {
    height: 5vmin;
    vertical-align: middle;
    margin: 2px;
    }

    @media only screen and (max-width: 600px) {
      img {
        height: 24px;
      }
    }

    svg {
      vertical-align: middle;
      height: 24px;
    }
  }
}

#video-icon {
  position: absolute;
  left: 0.5rem;
  width: 2.2rem;

  @media (max-width: 699px) {
    bottom: 3rem;
  }

  @media (min-width: 700px) {   
    bottom: 6rem;
  }


  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }
}

.video-wrapper {  
  display: flex;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  text-align: center;
  z-index: 1000;
}

video, #info-video {
  margin: auto;
  height: 85%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  // aspect-ratio: 9/17;
  border: 5px solid white;
}

#video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 1000;
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

.bottom-sheet {

  .tab-title {
    font-size: calc(1.2 * var(--default-font-size));
  }

  #learn-more-content{
    display: flex;

    @media (max-width: 959px ) {
      flex-direction: column;
    }

    @media (min-width: 960px ) {
      flex-direction: row;
    }

  }

  #info-text-box {
    font-size: var(--default-font-size);
    line-height: var(--default-line-height);

    @media (min-width: 960px ) {
      min-width: 50%;
      padding-right: 1em;
    }
  }
  #main-info-text {
    padding-inline: 0.5em;
  }

  #safety-warning{
    margin-top: 0.4em;
    font-weight: bold;
    color: var(--accent-color);
    font-size: calc(1.2 * var(--default-font-size));
    line-height: calc(1.2 * var(--default-line-height));
  }
  
  #FAQ{
    margin-top: 1em;

    details {
      padding-block: 0.7em;
      padding-inline: 1.2em;
      height: fit-content;
      background-color: #38464f;
      
      summary {
        font-weight: bold;
        cursor: pointer;
      }
      
      p {
        padding-top: 0.5em;
        padding-inline: 1em;
      }
    
    }
  }
  
  
  figure {
    // make it stick in the viewport
    position: sticky;
    height: 100%;
    padding-top: 1em;

    @media (max-width: 960px ) {
      width: 100%;
    }

    @media (min-width: 960px ) {
      width: 50%;
    }

    flex-shrink: 0;
    top: 0;
    margin-top: 1em;

    figcaption{
      bottom: -2em;
      right: 0;
      font-size: calc(0.8 * var(--default-font-size));
      line-height: calc(0.8 * var(--default-line-height));
      background-color: rgba(0, 0, 0, .33);
      padding-inline: 10px 5px;
    }
    
    .disclaimer {
      position: absolute;
      font-size: calc(0.8 * var(--default-font-size));
      top: 2em;
      right: 1em;
      font-weight: bold;
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
  
  .v-card-title {
    display: flex;
    justify-content: center;
    align-self: stretch;
    border-bottom: 2px solid var(--accent-color);
    
    h3 {
      color: var(--accent-color);
      align-self: center;
      text-transform: uppercase;
      font-weight: bold;
    }
  }

  .v-card-text {
    height: 40vh;
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
    height: fit-content;
    max-height: 50vh;
    
    @media (max-width: 700px ) {
      max-height: 70vh;
    }
    
  }
  

  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: var(--accent-color);
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }

  #user-guide {
    font-size: var(--default-font-size);
    line-height: calc(1.1 * var(--default-line-height));

    .v-chip {
      color: unset;
      background-color: unset;
      // font-size: var(--default-font-size);
    }

    .user-guide-header {
      margin-top: 1rem;
      color: var(--accent-color);
      font-size: calc(1.2 * var(--default-font-size));
    }

    .user-guide-emphasis {
      color: var(--accent-color);
      font-weight: bold;
    }

    .user-guide-emphasis-white {
      font-weight: bold;
    }
    
    li.switch-bullets {
      margin-top: -1em;

      padding-left: 0.5ch;
      .v-switch {
        transform: translateY(15%);
      }

      .user-guide-emphasis {
        padding-left: 1ch;
      }
    }

    .display-only-switch {
    
      display: inline-block;
      position: relative;
      bottom: calc(-0.5 * var(--default-line-height));

      .v-selection-control--density-default {
        --v-selection-control-size:var(--default-line-height);
      }

      .v-selection-control--disabled {
      opacity: 100%;
      pointer-events: none;

        .v-switch__thumb {
          background-color: black;
        }

        .v-icon {
          color: var(--accent-color);
          background-color: black;
        }
      }
    }

    .solid-divider {
      margin-top: 1rem;
      color: var(--sky-color);
      opacity: 0.7;
    }
  }
}

#body-logos {
  margin-left: auto;
  margin-right: 0;

  img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
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
    @media (max-width: 600px) {
      display: none;
    }
    min-width: fit-content;
    white-space: nowrap;
    color: black;
    padding-inline: 0.7rem;
    background-color: var(--accent-color);

    font-size: var(--default-font-size);
    padding-block: calc(0.5 * var(--default-line-height));
  }
  
  .v-slider-thumb__label::before {
    color: var(--accent-color);
  }
}

#slider {
  width: 100% !important;
  margin-block: 30px;
  margin-left: 5px;
  margin-right: 0;
}

.v-container {
  max-width: 100%;
}

#closed-top-container {
    position: absolute;
    left: 1.5rem;
    z-index: 500;
    top: 0.75rem;

    &.budge {
      left: 0.5rem;
      @media (max-width: 599px) {
        left: 0.5rem;
        top: 2.5rem;
      }
    }
  }

#guided-content-container {  
  --top-content-max-height: max(30vmin, 35vh);
  
  @media (max-width: 600px) {
    --top-content-max-height: max(40vmin, 40vh);
  }
  
  font-size: var(--default-font-size);
  @media (max-width: 350px) and (max-height: 600px) {
      font-size: min(3vw, 1.75vh);
  }
  
  --map-max-height: var(--top-content-max-height); // Keep this about 3 smaller than above // not used any more
  --margin: 0.5rem;
  --container-padding: 0.5rem;
  position: relative;
  margin: var(--margin);
  padding: var(--container-padding);

  width: calc(100% - 2*var(--margin));
  max-height: var(--top-content-max-height);
  min-height: 200px;
  align-items: center;
  gap: 0.5rem;
  // border-bottom: 1px solid var(--accent-color);
  background-color: #272727;
  user-select: none;
  border: solid 1.5px var(--accent-color);
  
  
  
  line-height: var(--default-line-height);
  overflow-y: auto ;
  
  transition: height 0.5s ease-in-out;
  
  display: flex;
  flex-direction: row;
  
  @media (max-width: 600px) and (max-aspect-ratio: 1) {
    flex-direction: column;
  }
  
  #scrollButton-button {
    position: fixed;
    top: calc(var(--top-content-height) - 2.5rem);
    right: 1rem;
    z-index: 1000;
  }
  
  #non-map-container {
    flex-basis: 100%;
  }
    
  #map-column {
    flex-basis: 100%;
    
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }
  
  


  #non-map-container { // Keep content away from the x to close
    --padding-left: 0.5rem;
    // @media (max-width: 600px) {
    //   --padding-left: 0;
    // }
    padding-left: var(--padding-left);
    padding-right: calc(var(--padding-left) + var(--container-padding));
    
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: stretch;
    gap: 0.5em;
    
    position: relative;
    
    .non-map-row {
      margin: 0;
      padding: 0;
    }
  
  }
    
    // .v-row.non-map-row#title-row
  #title-row {
    color: var(--accent-color);
    font-weight: bold;
    text-align: right;
    font-size: 1.3em;

  }
  
  .v-btn#toggle-instruction-text {
    position: absolute;
    right: 1.8em;
    top: 2.3em;
    color: var(--accent-color)
    // transform: translate(-25%, 75%);
  }
    
    // .v-row.non-map-row#instructions-row
  #instructions-row { 
    
    position: relative;
    display: flex;
    flex-grow: 0.5;
    border: 1.5px solid var(--sky-color);
    border-radius: 5px;
    align-items: center;
    justify-content: space-evenly;
    
    #mc-radiogroup-container {
      padding-block: 0.5em;
    }
    // v-col
    #top-container-main-text { 
    
      // div
      .instructions-text {

        min-width: 40vw;  // so quiz cards don't crash into each other on some screen sizes
        
        padding-inline: 0.7em;
        padding-block: 0.4em; // this plus the margin on p give .7 em on top and bottom

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
    width: 100%;

    #top-container-buttons{
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      gap: 0.5em;
            
      .icon-wrapper {
        background-color: rgba(209, 209, 209, .2);
        border: none;
        border-radius: 5px;
        padding-block: 4px;
        // be as large as you can but shrink if needed
        width: 100%;
        flex-shrink: 1;
        

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
  width: 100%;
  // outline: 1px solid red;
  @media (max-width: 600px) {
      aspect-ratio: 5/3;
    }
  

  #map-container {
    height: 100%;
    width: 100%;
    
    .map-container {
      height: 100%;
      width: 100%;
      aspect-ratio: 5/3;
    }
  
  
    span {
      padding: 0;
      margin: 0;
    }
    
    #eclipse-path-map > img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      // position: absolute;
      // top: 50%;
      // left: 50%;
      // transform: translateX(-50%) translateY(-50%);
      
      
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
    
    .leaflet-pane.leaflet-overlay-pane > svg > g > path[fill="#333"] {
      pointer-events: none;
    }
    
    .leaflet-pane.leaflet-overlay-pane > svg > g > path[fill="#ff0000"] {
      pointer-events: none;
    }
  }
}

.bullet-icon {
  color: var(--accent-color);
  width: 1.5em;
}

#intro-window-close-button {
    position: absolute;
    top: 0.25em;
    right: 0.25em;

    &:hover {
      cursor: pointer;
    }
}

#introduction-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  height: fit-content;
  // outline: 5px solid var(--accent-color);
  border-radius: 1em;

  @media (max-width: 700px) {
    width: 95%;
    padding: 1em;
  }

  @media (min-width: 701px) {
    width: 75%;
    padding: 2em;
  }

  // rotated translucent background gradient
  background: linear-gradient(45deg,
                            rgb(14, 30, 40), 
                            rgb(22, 50, 65), 
                            rgb(30 70 90));

  
  font-size: calc(1.1 * var(--default-font-size));
  line-height: var(--default-line-height);

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
    margin-top:0.5em;

    .v-btn.v-btn--density-default {
        max-height: calc(1.6 * var(--default-line-height));
      }  

    .v-btn--size-default {
      font-size: calc(0.9 * var(--default-font-size));
    }    
  
    #intro-reminder {
      outline: 1px solid red;
    }
    
    #intro-next-button {
      background-color: rgba(18, 18, 18,.5);
    }
  }
}

#speed-control {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-left: 10px;

  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }

}

#speed-text {
  position: absolute;

  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 0.4em;
  padding-block: 0.15em;
  border-radius: 0.3em;

  @media (max-width: 959px) {
    bottom: -0.4rem;
    left: 9.5rem;
  }
  @media (min-width: 960px) {
    bottom: 0.3rem;
    left: 0.3rem;
  }


  font-size: var(--default-font-size)
  }  

#eclipse-percent-chip {
  position: absolute;
  right: 0.5rem;
  top: calc(-1.5 * var(--default-line-height));

  .v-chip.v-chip--density-default {
    height: var(--default-line-height);
    padding-inline: 0.8rem;
    padding-block: 0.8rem;
  }

  .v-chip__content {
    font-size: calc(0.8 * var(--default-font-size));
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

  }

  .icon-wrapper {
    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    }

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    }
  }

  .v-switch__thumb {
    color: var(--accent-color);
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

  .v-switch__track {
    background-color: #737373 !important;
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
    text-align: right;

    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    } 

  }
 
  #track-sun-switch {
    @media (max-width: 750px) { //SMALL
      margin-top: 0.5rem;
    } 

    @media (min-width: 751px) { //LARGE
      margin-top: 0.7rem;
    } 
  }
}

#change-optout {

  .icon-wrapper {
    margin: 0;
    padding-inline: 0;
    padding-block: 0;
    border: none;
    min-width: 0;
  }
}

#privacy-popup-dialog {

  .v-card-text {
    color: #BDBDBD;
  }

  .v-overlay__content {
    font-size: var(--default-font-size);
    background-color: purple;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .v-btn--size-default {
      font-size: calc(0.9 * var(--default-font-size));
    }  

  .v-card-actions .v-btn {
    padding: 0 4px;
  }
}

a {
    text-decoration: none;
    font-weight: bold;
    color: #589eef; // lighter variant of sky color
    pointer-events: auto;
  }

#inline-open-icon {
  background-color: var(--accent-color);
  border-radius: 50%;
  border: 1.5px solid var(--accent-color);
}


#mobile-zoom-control {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .vue-slider {    
    .vue-slider-rail {
      width: 10px;
      left: calc(-10px / 2 + 2.5px);
    }
  }
  
  
  .slider-padding {
    margin-block: 1em;
    color: var(--accent-color);
  }
  
}
</style>

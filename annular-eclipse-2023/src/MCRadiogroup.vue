<template>
  <div
    id="mc-radiogroup-container"
    :style="cssVars"
  >
    <v-radio-group
      v-if="!complete || !useAlert"
      class="mc-radiogroup"
      v-model="column"
      :inline="row"
      :column="!row"
      hide-details
      :readonly="complete && stopOnComplete"
    >
      <v-radio
        v-for="[index, option] of radioOptions.entries()"
        :key="index"
        :color="`${color(index)}`"
        :value="index"
        :label="option"
        @change="selectChoice(index)"
        :true-icon="`${icon(index)}`"
        :class="[hideInput ? 'hidden' : '']"
      >
      <template v-slot:label>
        <slot 
          :index="index" 
          :text="option" 
          :feedback="feedbacks[index]"
          :selected="index==column"
          :color="color(index)"
          :column="column"
          > {{ option }} </slot>
      </template>
    </v-radio>
    </v-radio-group>
    <v-alert
      v-if="complete && useAlert"
      v-show="column !== null"
      variant="tonal"
      :color="`${color(column)}`"
      :icon="`${icon(column)}`"
      :text="feedbacks[column]"
      density="compact"
    >
    </v-alert>
  </div>
</template>

<style>

#mc-radiogroup-container {
  background-color: #132c48;
}

#mc-radiogroup-container .feedback{
  color: white;
}

#mc-radiogroup-container .v-selection-control-group {
    justify-content: space-evenly;
    gap: var(--gap);
    flex-wrap: nowrap;
  }
  

#mc-radiogroup-container .hidden .v-selection-control__wrapper {
  display: none;
}

#mc-radiogroup-container .v-selection-control.v-selection-control--inline {
  flex: 1 1 auto !important;
}

#mc-radiogroup-container .v-label {
  opacity: inherit;
}

</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { VRadioGroup } from 'vuetify/components/VRadioGroup';
import { VRadio } from 'vuetify/components/VRadio';


// :border="(index==column ? `10px solid ${color(index)}` : '10px solid transparent')"

export interface MCSelectionStatus {
  index: number,
  text: string,
  correct: boolean,
  neutral: boolean,
  tries: number
}

export default defineComponent({

  name: 'MCRadiogroup',

  components: {
    'v-radio-group': VRadioGroup,
    'v-radio': VRadio,
  },
  
  props: {
    radioOptions: {
      type: Array<string>,
      default: () => []
    },
    feedbacks: {
      type: Array<string>,
      default: () => []
    },
    correctAnswers: {
      type: Array<number>,
      default: () => []
    },
    scoring: {
      type: Boolean,
      default: true
    },
    neutralAnswers: {
      type: Array,
      default: () => []
    },
    row: {
      type: Boolean,
      default: false
    },
    maxTries: {
      type: Number || null,
      default: null
    },

    useAlert: {
      type: Boolean,
      default: false
    },

    hideInput: {
      type: Boolean,
      default: false
    },

    stopOnComplete: {
      type: Boolean,
      default: true
    },

    colorWrong: {
      type: String,
      default: 'red'
    },

    colorNeutral: {
      type: String,
      default: 'orange'
    },

    colorRight: {
      type: String,
      default: 'green'
    },

    preselected: {
      type: Number,
      default: null
    },

    gap: {
      type: String,
      default: '0.5em'
    }
    
  },
  emits: {
    select(status: MCSelectionStatus) {
      return typeof status.index === 'number' &&
            typeof status.text === 'string' &&
            typeof status.correct === 'boolean' &&
            typeof status.neutral === 'boolean' &&
            typeof status.tries === 'number';
    }
  },
  
  data: function () {
    return {
      column: null as unknown as number,
      iconRight: 'mdi-check-circle-outline',
      iconNeutral: 'mdi-lightbulb-on-outline',
      iconWrong: 'mdi-alert-circle-outline',
      complete: false,
      tries: 0,
      score: null
    };
  },

  computed: {
    flexBasis(): string {
      const n = 100 / (this.radioOptions.length+1);
      return `${Math.round(n)}%`;
    },

    cssVars: function () {
      return {
        '--flex-basis': this.flexBasis,
        '--gap': this.gap
      };
    }
  },
  
  methods: {
    selectChoice: function (index: number) {
      this.column = index;

      // if we exceed maxtries get the correct answer
      if (this.maxTries && (this.tries >= this.maxTries)) {
        index = this.correctAnswers[0];
        this.column = index;
      }
      
      const correct = this.correctAnswers.includes(index);
      const neutral = this.neutralAnswers.includes(index);
      if (!neutral) {
        this.tries += 1;
      }
      this.complete = correct || (this.correctAnswers.length === 0 && neutral);

      this.$emit('select', {
        index: index,
        text: this.radioOptions[index],
        correct: correct,
        neutral: this.neutralAnswers.includes(index),
        tries: this.tries
      });
    },

    color: function (index: number) {
      if (this.correctAnswers.includes(index)) {
        return this.colorRight;
      } else if (this.neutralAnswers.includes(index)) {
        return this.colorNeutral;
      } else {
        return this.colorWrong;
      }
    },
    icon: function (index: number) {
      if (this.correctAnswers.includes(index)) {
        return this.iconRight;
      } else if (this.neutralAnswers.includes(index)) {
        return this.iconNeutral;
      } else {
        return this.iconWrong;
      }
    },
  },

  watch: {
    preselected: function (newVal: number) {
      if (newVal !== null) {
        console.log('set answer');
        this.selectChoice(newVal);
      }
    },

    useAlert: function (newVal: boolean) {
      console.log('useAlert changes', newVal);
    },
  }
});
</script>

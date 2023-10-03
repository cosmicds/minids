<template>
  <div
    id="mc-radiogroup-container"
  >
    <v-radio-group
      v-if="!complete || !useAlert"
      class="mc-radiogroup"
      v-model="column"
      :inline="row"
      :column="!row"
      hide-details
      :readonly="complete"
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

#mc-radiogroup-container .v-selection-control-group--inline {
    justify-content: space-evenly;
  }
  

#mc-radiogroup-container .hidden .v-selection-control__wrapper {
  display: none;
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

// create a select type
type Status = {
  index: number,
  correct: boolean,
  neutral: boolean,
  tries: number
};

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
    }
    
  },
  emits: {
    select(status: Status) {
      return typeof status.index === 'number' &&
            typeof status.correct === 'boolean' &&
            typeof status.neutral === 'boolean' &&
            typeof status.tries === 'number';
    }
  },
  
  created() {
    
  },
  
  data: function () {
    return {
      column: null as unknown as number,
      colorRight: 'green',
      colorNeutral: 'orange',
      colorWrong: 'red',
      iconRight: 'mdi-check-circle-outline',
      iconNeutral: 'mdi-lightbulb-on-outline',
      iconWrong: 'mdi-alert-circle-outline',
      complete: false,
      tries: 0,
      score: null
    };
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
});
</script>

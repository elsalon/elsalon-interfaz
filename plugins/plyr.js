import Vue from 'vue'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

export default ({ app }, inject) => {
  inject('plyr', Plyr)
}
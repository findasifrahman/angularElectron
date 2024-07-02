var gpio = require('onoff').Gpio;
var play_sound_pin = new gpio(6, 'out') // stm_reset

module.exports = function() 
{
    play_sound_pin.writeSync(1)
    setTimeout(function () {
      play_sound_pin.writeSync(0)
      setTimeout(function () {
        play_sound_pin.writeSync(1)
        setTimeout(function () {
          play_sound_pin.writeSync(0)
          setTimeout(function () {
            play_sound_pin.writeSync(1)
            setTimeout(function () {
              play_sound_pin.writeSync(0)
            }, 800)
          }, 100)
        }, 800)
      }, 100)
    }, 800)
}
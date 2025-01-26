import { Howl } from 'howler';

const sounds = {
  cardPlay: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3'],
    volume: 0.5
  }),
  win: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'],
    volume: 0.7
  }),
  lose: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/1940/1940-preview.mp3'],
    volume: 0.7
  }),
  bidPlace: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
    volume: 0.5
  }),
  trumpSelect: new Howl({
    src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'],
    volume: 0.5
  })
};

export const playSound = (sound: keyof typeof sounds, enabled: boolean = true) => {
  if (enabled) {
    sounds[sound].play();
  }
};
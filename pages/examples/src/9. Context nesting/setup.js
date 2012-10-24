var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    reality: {
      kick: 'However deeply nested we are, we can still get back to the top',
      level: 'one',
      setting: 'The Airplane',
      dream: {
        level: 'two',
        setting: 'The City',
        dreamer: 'Yusuf',
        dream: {
          level: 'three',
          setting: 'The Hotel',
          dreamer: 'Arthur',
          dream: {
            level: 'four',
            setting: 'The Snow Fortress',
            dreamer: 'Eames',
            dream: {
              level: 'five',
              setting: 'Limbo',
              dreamer: 'Cobb'
            }
          }
        }
      }
    }
  }
});
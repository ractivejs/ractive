var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    character: {
      firstname: 'Arnold',
      lastname: 'Rimmer',
      mugshot: 'arnold.jpg',
      quote: 'Boarding this vessel is an act of war. Ergo we surrender.'
    }
  }
});
var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    trueorfalse: true
  }
});
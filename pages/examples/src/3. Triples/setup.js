var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    mustache: '<strong>Spot the difference?</strong>'
  }
});
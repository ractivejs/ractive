var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    bgcolor: 'black',
    color: 'white',
    fontSize: 16,
    adjective: 'dynamic'
  }
});
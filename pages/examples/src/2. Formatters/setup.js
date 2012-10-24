var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    sometext: 'capitals'
  },
  formatters: {
    uppercase: function ( input ) {
      return input.toUpperCase();
    }
  }
});
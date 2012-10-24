var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    user: {
      firstname: 'new',
      lastname: 'user'
    },
    fontSize: 16
  },
  formatters: {
    percent: function ( input ) {
      return input / 100;
    }
  }
});
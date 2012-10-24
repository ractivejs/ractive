var list = [
  { firstname: 'Harold',   lastname: 'Wilson',    from: 1964, to: 1970, party: 'Labour' },
  { firstname: 'Edward',   lastname: 'Heath',     from: 1970, to: 1974, party: 'Conservative' },
  { firstname: 'Harold',   lastname: 'Wilson',    from: 1974, to: 1976, party: 'Labour' }  ,
  { firstname: 'James',    lastname: 'Callaghan', from: 1976, to: 1979, party: 'Labour' },
  { firstname: 'Margaret', lastname: 'Thatcher',  from: 1979, to: 1990, party: 'Conservative' }
];

var anglebars = new Anglebars({
  el: 'output',
  template: $('#template').text(),
  data: {
    primeMinisters: list
  }
});
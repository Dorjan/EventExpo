const moment = require('moment');

module.exports = {
  //rimuove tag html
  stripTags: function(input){
    return input.replace(/<(?:.|\n)*?>/gm, '');
  },
  //formatta bene la data
  formatDate: function(date, format){
    return moment(date).format(format);
  }
};

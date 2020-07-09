const moment = require('moment');

module.exports = {
  //to remove html tags
  stripTags: function(input){
    return input.replace(/<(?:.|\n)*?>/gm, '');
  },
  //to make dates looks better
  formatDate: function(data, format){
    return moment(data).format(format);
  }
};

define(function (require) {
  var expect = require('expect.js');
  var VisTimefilterHandler  = require('plugins/vis_timefilter/vis_timefilter_handler')();
  var moment = require('moment');

  var timefilter = new VisTimefilterHandler ({'timeFieldName':'@timestamp'});

  describe('localtime - parse dates', function () {

    describe('three basic variants', function () {
      it('should return undefined if passed something falsy', function () {
        expect(timefilter._toTicks('')).to.be(undefined);
      });

      it('should return ticks if an iso date is given', function () {
        expect(timefilter._toTicks('2015-05-12')).be(moment('2015-05-12').valueOf());
      });

      it('should return ticks, if a datemath expressions is given', function () {
        var before = moment();
        var ticks = timefilter._toTicks('now');
        var after = moment();
        expect(ticks >= before).to.be.ok();
        expect(ticks <= after).to.be.ok();
      });

    });

  });

});

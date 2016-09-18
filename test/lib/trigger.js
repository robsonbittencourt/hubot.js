var expect  = require('chai').expect;
var trigger = require('../../src/lib/trigger');

describe('Task Trigger', function() {
   describe('Task Trigger without parameters', function() {
      it('should not match wrong message', function() {
         var phrase = 'test';
         var message = 'anything else';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should matches exactly message', function() {
         var phrase = 'test';
         var message = 'test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: [] }
         );
      });

      it('should matches message ignoring casing', function() {
         var phrase = 'test';
         var message = 'TEST';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: [] }
         );
      });

      it('should ignore placeholder at beginning', function() {
         var phrase = '$test';
         var message = 'test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should consider placeholder at beginning like a simple character', function() {
         var phrase = '$test';
         var message = '$test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: []}
         );
      });
   });

   describe('Task Trigger with one parameter', function() {
      it('should not match wrong message', function() {
         var phrase = 'test $ deeply';
         var message = 'please test anything else deeply';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should get one parameter by placeholder at end', function() {
         var phrase = 'test $';
         var message = 'test anything';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['anything']}
         );
      });

      it('should get one parameter by placeholder at middle', function() {
         var phrase = 'test $ deeply';
         var message = 'test anything else deeply';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['anything else']}
         );
      });
   })

   describe('Task Trigger with multiple parameters', function() {
      it('should not match wrong message', function() {
         var phrase = 'come on $, light $!';
         var message = 'so come on baby, light my fire!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should get multiple parameters', function() {
         var phrase = 'come on $, light $!';
         var message = 'come on baby, light my fire!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['baby', 'my fire']}
         );
      });

      it('should get multiple parameters ignoring casing', function() {
         var phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
         var message = 'Take me down to the Paradise City Where the grass is green and the girls are pretty!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['me', 'paradise city', 'grass', 'green', 'girls', 'pretty']}
         );
      });

      it('should not match typo', function() {
         var phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
         var message = 'Take me donw to the Paradise City Where the grass is green and the girls are pretty!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });
   });
});

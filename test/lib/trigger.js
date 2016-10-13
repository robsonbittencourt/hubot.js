'use strict';

const expect  = require('chai').expect;
const trigger = require('../../src/message-handler/trigger');

describe('Task Trigger', function() {
   describe('Task Trigger without parameters', function() {
      it('should not match wrong message', function() {
         const phrase = 'test';
         const message = 'anything else';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should matches exactly message', function() {
         const phrase = 'test';
         const message = 'test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: [] }
         );
      });

      it('should matches message ignoring casing', function() {
         const phrase = 'test';
         const message = 'TEST';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: [] }
         );
      });

      it('should ignore placeholder at beginning', function() {
         const phrase = '$test';
         const message = 'test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should consider placeholder at beginning like a simple character', function() {
         const phrase = '$test';
         const message = '$test';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: []}
         );
      });
   });

   describe('Task Trigger with one parameter', function() {
      it('should not match wrong message', function() {
         const phrase = 'test $ deeply';
         const message = 'please test anything else deeply';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should get one parameter by placeholder at end', function() {
         const phrase = 'test $';
         const message = 'test anything';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['anything']}
         );
      });

      it('should get one parameter by placeholder at middle', function() {
         const phrase = 'test $ deeply';
         const message = 'test anything else deeply';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['anything else']}
         );
      });
   })

   describe('Task Trigger with multiple parameters', function() {
      it('should not match wrong message', function() {
         const phrase = 'come on $, light $!';
         const message = 'so come on baby, light my fire!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });

      it('should get multiple parameters', function() {
         const phrase = 'come on $, light $!';
         const message = 'come on baby, light my fire!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['baby', 'my fire']}
         );
      });

      it('should get multiple parameters ignoring casing', function() {
         const phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
         const message = 'Take me down to the Paradise City Where the grass is green and the girls are pretty!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: true, params: ['me', 'paradise city', 'grass', 'green', 'girls', 'pretty']}
         );
      });

      it('should not match typo', function() {
         const phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
         const message = 'Take me donw to the Paradise City Where the grass is green and the girls are pretty!';
         expect(trigger.check(message, phrase)).to.deep.equal(
            { ok: false, params: []}
         );
      });
   });
});

'use strict';

const expect = require('chai').expect;
const trigger = require('../../src/message-handler/trigger');

describe('Task Trigger', () => {
  describe('Task Trigger without parameters', () => {
    it('should not match wrong message', () => {
      const phrase = 'test';
      const message = 'anything else';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: false, params: [] }
      );
    });

    it('should matches exactly message', () => {
      const phrase = 'test';
      const message = 'test';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: [] }
      );
    });

    it('should matches message ignoring casing', () => {
      const phrase = 'test';
      const message = 'TEST';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: [] }
      );
    });

    it('should ignore placeholder at beginning', () => {
      const phrase = '$test';
      const message = 'test';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: false, params: [] }
      );
    });

    it('should consider placeholder at beginning like a simple character', () => {
      const phrase = '$test';
      const message = '$test';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: [] }
      );
    });
  });

  describe('Task Trigger with one parameter', () => {
    it('should not match wrong message', () => {
      const phrase = 'test $ deeply';
      const message = 'please test anything else deeply';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: false, params: [] }
      );
    });

    it('should get one parameter by placeholder at end', () => {
      const phrase = 'test $';
      const message = 'test anything';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: ['anything'] }
      );
    });

    it('should get one parameter by placeholder at middle', () => {
      const phrase = 'test $ deeply';
      const message = 'test anything else deeply';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: ['anything else'] }
      );
    });
  });

  describe('Task Trigger with multiple parameters', () => {
    it('should not match wrong message', () => {
      const phrase = 'come on $, light $!';
      const message = 'so come on baby, light my fire!';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: false, params: [] }
      );
    });

    it('should get multiple parameters', () => {
      const phrase = 'come on $, light $!';
      const message = 'come on baby, light my fire!';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: ['baby', 'my fire'] }
      );
    });

    it('should get multiple parameters ignoring casing', () => {
      const phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
      const message = 'Take me down to the Paradise City Where the grass is green and the girls are pretty!';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: true, params: ['me', 'paradise city', 'grass', 'green', 'girls', 'pretty'] }
      );
    });

    it('should not match typo', () => {
      const phrase = 'take $ down to the $ where the $ is $ and the $ are $!';
      const message = 'Take me donw to the Paradise City Where the grass is green and the girls are pretty!';
      expect(trigger.check(message, phrase)).to.deep.equal(
        { ok: false, params: [] }
      );
    });
  });
});

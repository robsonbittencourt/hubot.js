'use strict';

const expect = require('chai').expect;

const setup = require('../setup');
const Assembler = require('../../src/assembler');

describe('The Hubot Assembler', () => {
  before(() => {
    setup.start();
  });

  describe('should provide correct path', () => {
    it('for tasks', () => {
      const gear = { name: 'test' };

      const tasksPath = getAssembler().tasksPath(gear);

      expect(tasksPath).to.equal(`${global.__nodeModules}test/config/tasks.json`);
    });

    it('for categories', () => {
      const gear = { name: 'test' };

      const categoriesPath = getAssembler().categoriesPath(gear);

      expect(categoriesPath).to.equal(`${global.__nodeModules}test/config/categories.json`);
    });

    it('for handlers', () => {
      const gear = { name: 'test' };

      const handlersPath = getAssembler().handlersPath(gear, 'test-handler');

      expect(handlersPath).to.equal(`${global.__nodeModules}test/src/handlers/test-handler`);
    });
  });

  describe('should load', () => {
    it('task file', () => {
      const assembler = getAssembler();
      const gear = { name: 'gear-test' };

      assembler.loadTasks(gear, assembler);

      expect(gear.tasks).to.be.deep.equal([{
        handler: 'test-handler',
        trigger: 'test-trigger'
      }]);
    });

    it('category file', () => {
      const assembler = getAssembler();
      const gear = { name: 'gear-test' };

      assembler.loadCategories(gear, assembler);

      expect(gear.categories).to.be.deep.equal([{
        key: 'test',
        name: 'test',
        description: 'some test',
        visible: false
      }]);
    });

    it('handler file based on tasks handlers', () => {
      const assembler = getAssembler();
      const gear = { name: 'gear-test' };

      assembler.loadTasks(gear, assembler);
      assembler.loadHandlers(gear, assembler);

      expect(gear.handlers).to.have.lengthOf(1);
      expect(gear.handlers[0].handle().key).to.be.equal('test-handle');
    });

    it('and should not load when handler file if there is not tasks', () => {
      const assembler = getAssembler();
      const gear = { name: 'gear-test', tasks: [] };

      assembler.loadHandlers(gear, assembler);

      expect(gear.handlers).to.be.deep.equal([]);
    });
  });

  describe('should load gears', () => {
    it('when is a valid gear', () => {
      const assembler = getAssembler();
      const gear = { name: 'gear-test' };

      assembler.loadGear([gear], gear, 0);

      expect(gear.tasks).to.be.deep.equal([{
        handler: 'test-handler',
        trigger: 'test-trigger'
      }]);

      expect(gear.categories).to.be.deep.equal([{
        key: 'test',
        name: 'test',
        description: 'some test',
        visible: false
      }]);

      expect(gear.handlers).to.have.lengthOf(1);
      expect(gear.handlers[0]).have.property('key').and.equal('test-handler');
    });

    it('and should not throw error when invalid parameters are informed', () => {
      const assembler = getAssembler();

      assembler.loadGear(null, null, null);

      expect(assembler.gears).to.be.deep.equal([]);
    });

    it('neigther should throw error loading when informed an invalid gear', () => {
      const assembler = getAssembler();
      const gear = { name: 'invalid' };

      assembler.loadGear([gear], gear, 0);

      expect(assembler.gears).to.be.deep.equal([]);
    });
  });
});

function getAssembler() {
  return new Assembler();
}

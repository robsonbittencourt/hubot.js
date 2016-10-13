'use strict';

const expect  = require('chai').expect;
const setup  = require('../setup').start();
const Assembler = require('../../src/assembler');

describe('The Hubot Assembler', function() {
   
   describe('should provide correct path', function() {
      
      it('for tasks', function() {
         const gear = { name: 'test' };

         const path = getAssembler().tasksPath(gear);

         expect(path).to.equal(__nodeModules + 'test/config/tasks.json');
      });

      it('for categories', function() {
         const gear = { name: 'test' };

         const path = getAssembler().categoriesPath(gear);

         expect(path).to.equal(__nodeModules + 'test/config/categories.json');
      });

      it('for handlers', function() {
         const gear = { name: 'test' };

         const path = getAssembler().handlersPath(gear, 'test-handler');

         expect(path).to.equal(__nodeModules + 'test/src/handlers/test-handler');
      });

   });

   describe('should load', function() {
      
      it('task file', function() {
         const assembler = getAssembler();
         const gear = { name: 'gear-test' };

         assembler.loadTasks(gear, assembler);

         expect(gear.tasks).to.be.deep.equal([{
            "handler": "test-handler",
            "trigger": "test-trigger"
         }]);
      });

      it('category file', function() {
         const assembler = getAssembler();
         const gear = { name: 'gear-test' };

         assembler.loadCategories(gear, assembler);

         expect(gear.categories).to.be.deep.equal([{
            "key": "test",
            "name": "test",
            "description": "some test",
            "visible": false
         }]);
      });

      it('handler file based on tasks handlers', function() {
         const assembler = getAssembler();
         const gear = { name: 'gear-test' };

         assembler.loadTasks(gear, assembler);
         assembler.loadHandlers(gear, assembler);

         expect(gear.handlers).to.have.lengthOf(1);
         expect(gear.handlers[0].handle().key).to.be.equal('test-handle');
      });

      it('and should not load when handler file if there is not tasks', function() {
         const assembler = getAssembler();
         const gear = { name: 'gear-test', tasks: [] };

         assembler.loadHandlers(gear, assembler);

         expect(gear.handlers).to.be.deep.equal([]);
      });
 
   });
      
   describe('should load gears', function() { 

      it('when is a valid gear', function() {
         const assembler = getAssembler();
         const gear = { name: 'gear-test' };
         
         assembler.loadGear([gear], gear, 0);
         
         expect(gear.tasks).to.be.deep.equal([{
            "handler": "test-handler",
            "trigger": "test-trigger"
         }]);
         
         expect(gear.categories).to.be.deep.equal([{
            "key": "test",
            "name": "test",
            "description": "some test",
            "visible": false
         }]);
         
         expect(gear.handlers).to.have.lengthOf(1);
         expect(gear.handlers[0]).have.property('key').and.equal('test-handler');
      });  

      it('and should not throw error when invalid parameters are informed', function() {
         const assembler = getAssembler();
         
         assembler.loadGear(null, null, null);
         
         expect(assembler.gears).to.be.deep.equal([]);
      });

      it('neigther should throw error loading when informed an invalid gear', function() {
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

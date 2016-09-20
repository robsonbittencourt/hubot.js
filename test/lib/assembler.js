var expect  = require('chai').expect;
var setup  = require('../setup').start();
var Assembler = require('../../src/lib/assembler');

describe('Hubot Assembler', function() {
   describe('Hubot Assembler - Getting Paths', function() {
      it('should provide correct path for tasks', function() {
         var gear = { name: 'test' };

         var path = getAssembler().tasksPath(gear);

         expect(path).to.equal(__nodeModules + 'test/config/tasks.json');
      });

      it('should provide correct path for categories', function() {
         var gear = { name: 'test' };

         var path = getAssembler().categoriesPath(gear);

         expect(path).to.equal(__nodeModules + 'test/config/categories.json');
      });

      it('should provide correct path for handlers', function() {
         var gear = { name: 'test' };

         var path = getAssembler().handlersPath(gear, 'test-handler');

         expect(path).to.equal(__nodeModules + 'test/src/handlers/test-handler');
      });
   });

   describe('Hubot Assembler - Loader', function() {
      it('should load task file correctly', function() {
         var assembler = getAssembler();
         var gear = { name: 'gear-test' };

         assembler.loadTasks(gear, assembler);

         expect(gear.tasks).to.be.deep.equal([{
            "handler": "test-handler",
            "trigger": "test-trigger"
         }]);
      });

      it('should load category file correctly', function() {
         var assembler = getAssembler();
         var gear = { name: 'gear-test' };

         assembler.loadCategories(gear, assembler);

         expect(gear.categories).to.be.deep.equal([{
            "key": "test",
            "name": "test",
            "description": "some test",
            "visible": false
         }]);
      });

      it('should not load handler file if there is not tasks', function() {
         var assembler = getAssembler();
         var gear = { name: 'gear-test', tasks: [] };

         assembler.loadHandlers(gear, assembler);

         expect(gear.handlers).to.be.deep.equal([]);
      });

      it('should load handler file based on tasks handlers', function() {
         var assembler = getAssembler();
         var gear = { name: 'gear-test' };

         assembler.loadTasks(gear, assembler);
         assembler.loadHandlers(gear, assembler);

         expect(gear.handlers).to.have.lengthOf(1);
         expect(gear.handlers[0].handle().key).to.be.equal('test-handle');
      });

      it('should not throw error loading gears', function() {
         var assembler = getAssembler();
         
         assembler.loadGear(null, null, null);
         
         expect(assembler.gears).to.be.deep.equal([]);
      });

      it('should not throw error loading invalid gear', function() {
         var assembler = getAssembler();
         var gear = { name: 'invalid' };
         
         assembler.loadGear([gear], gear, 0);
         
         expect(assembler.gears).to.be.deep.equal([]);
      });

      it('should load a valid gear', function() {
         var assembler = getAssembler();
         var gear = { name: 'gear-test' };
         
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
   });
});

function getAssembler() {
   return new Assembler();
}

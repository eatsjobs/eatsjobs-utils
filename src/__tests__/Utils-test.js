import {
  queryfy,
  dequeryfy,
  debounce,
  checkObject,
  memoize,
} from '../index';

describe('Utils tests', function() {

    it('Queryfy: should encode correctly', function() {
        var result = queryfy('', { a: 'b b', 'c': 'a' });
        expect(result).toBe('?a=b%20b&c=a');
    });

    it('Queryfy: should work with a key with null value', function() {
        var result = queryfy('', { a: 'b b', 'c': null });
        expect(result).toBe('?a=b%20b&c');
    });

    it('Queryfy: should add other query params if already have keys', function(){
        var result = queryfy('http://pippo.com/?comment=1&c=2', { a: 2, c: null });
        result = result.slice(result.indexOf('?') + 1, result.length).split('&');

        expect(result.indexOf('comment=1') > -1).toEqual(true);
        expect(result.indexOf('a=2') > -1).toEqual(true);
        expect(result.indexOf('c') > -1).toEqual(true);
        expect(result.indexOf('c=2') > -1).toEqual(false);
    });

    it('Dequeryfy: should decode correct', function(){
        var result = dequeryfy('?a=b%20b&c=a');
        expect(result).toEqual({ a: 'b b', 'c': 'a' });
    });

    it('Dequeryfy: should handle empty string', function(){
        var result = dequeryfy('');
        expect(result).toEqual({});
    });

    it('Dequeryfy: should handle string without querystring', function(){
        var result = dequeryfy('http://pippo.com');
        expect(result).toEqual({});
    });

    it('Queryfy: with a key with undefined value', function(){
        var result = queryfy('', { a: 'b b', 'c': undefined });
        expect(result).toBe('?a=b%20b&c');
    });

    it('Queryfy: should not modify params passed by reference', function() {
        var api = 'http://pippo.com/';
        var result = queryfy(api, { a: 'b b', 'c': 5 });
        expect(result).toBe('http://pippo.com/?a=b%20b&c=5');
        expect(api).toEqual('http://pippo.com/');
    });

    it('Debounce: should take only last call in ms', function(done){
      var aSpy = jasmine.createSpy('spy');
      function add(a, b, callback) {
        aSpy(a, b, callback);
        return callback ? callback(a + b) : a + b;
      }
      var debounced = debounce(add, 100);
      for(var i = 0; i < 10000; i++) {
        debounced(2, 2);
      }

      setTimeout(function(){
        expect(aSpy.calls.count()).toEqual(1);
        done();
      }, 110);
    });

    it('Debounce: should be called only two times because called with leading true', function (done) {
      var aSpy = jasmine.createSpy('spy');
      function add(a, b, callback) {
        aSpy(a, b, callback);
        return callback ? callback(a + b) : a + b;
      }
      var debounced = debounce(add, 100, true);
      debounced(2, 2);
      setTimeout(function(){
        debounced(5, 2);
      }, 110);


      setTimeout(function(){
        expect(aSpy.calls.count()).toEqual(2);
        done();
      }, 115);
    });

    it('checkObject: should return null if key not exist', function () {
      var objTocheck = {a:{b:{c:{d:1}}}};
      expect(checkObject(objTocheck, 'a.b.c.d')).toEqual(1);
    });

    it('checkObject: should return defaultReturn if specified', function () {
      var objTocheck = {a:{b:{c:{d:1}}}};
      expect(checkObject(objTocheck, 'a.b.c.d.e', true)).toEqual(true);
    });

    it('Test memoization function with prototype function', function(){
      var count = 0;
      function Person() {
        this.name = 'aldo';
        this.surname = 'baglio';
        this.getFullName = memoize(this.getFullName, function(){ return [this.name, this.surname]; }.bind(this));
      };

      Person.prototype.getFullName = function() {
        count += 1;
        return this.name + " " + this.surname;
      };

      var person = new Person();
      
      // spyOn(p, 'getFullName');

      expect(person.getFullName()).toEqual('aldo baglio');
      expect(count).toEqual(1);
      expect(person.getFullName()).toEqual('aldo baglio');
      expect(count).toEqual(1);

      person.name = 'giovanni';
      expect(person.getFullName()).toEqual('giovanni baglio');
      expect(count).toEqual(2);
      expect(person.getFullName()).toEqual('giovanni baglio');
      expect(count).toEqual(2);
    });

    it('Test memoization function with prototype function 2', function(){
      var count = 0;
      function Person(){
        this.name = 'aldo';
        this.surname = 'baglio';        
      };

      Person.prototype.getFullName = function(title) {
        count += 1;
        var _title = title ? title : '';
        return _title + this.name + ' ' + this.surname;
      };

      var person = new Person();
      
      // spyOn(p, 'getFullName');
      var memoized = memoize(person.getFullName, function(){ return [this.name, this.surname];}.bind(person), person);

      expect(memoized()).toEqual('aldo baglio');
      expect(memoized()).toEqual('aldo baglio');
      expect(count).toEqual(1);

      // changing somenthing should trigger another call
      person.name = 'giovanni';
      expect(memoized()).toEqual('giovanni baglio');
      expect(count).toEqual(2);

      // change somenthing should call the function another time
      person.name = 'Giovanni';
      expect(memoized('Mr.')).toEqual('Mr.Giovanni baglio');
      expect(count).toEqual(3);

      // should remain 3
      person.name = 'Giovanni';
      expect(memoized('Mr.')).toEqual('Mr.Giovanni baglio');
      expect(count).toEqual(3);
    });

    it('Test memoization without deps', function(){
      var count = 0;
      function add() {
        count += 1;
        return [].slice.call(arguments).reduce(function(prev, current) { return prev + current;}, 0);
      }

      var addMemoized = memoize(add);
      expect(addMemoized(5, 4, 3)).toEqual(12);
      expect(addMemoized(5, 4, 3)).toEqual(12);
      expect(count).toEqual(1);
    });
});

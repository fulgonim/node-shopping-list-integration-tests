const chai = require('chai');
const chaiHTTP = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHTTP);

describe('Recipes', function() {


	//open the server before the tests run
	before(function() {
		return runServer();
	});

	//close the server after the tests are finished
	after(function() {
		return closeServer();
	});

	//test strategy:
	//1. make a request to /recipes
	//2. inspect response object and ensure correct code and keys (in response object)

	it('should list items (recipes) on GET', function() {
		return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');

				expect(res.body.length).to.be.at.least(1);

				const expectedKeys = ['id', 'name', 'ingredients'];
				res.body.forEach(function(item) {
					expect(item).to.be.a('object');
					expect(item).to.include.keys(expectedKeys);
				});

			});
	});

	//POST test
	it('should add an item (recipe) on POST', function() {
		const newItem = {name: 'lentil stew', ingredients: ['lentils', 'water', 'spices', 'carrots', 'celery', 'onions']};
		return chai.request(app)
			.post('/recipes')
			.send(newItem)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'name', 'ingredients');
				expect(res.body.id).to.not.equal(null);
				// response should be deep equal to `newItem` from above if we assign
        		// `id` to it from `res.body.id`
        		expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
			});

	});


	//PUT test
	it('should update an item (recipe) on PUT', function() {
		const updateData = {
			name: 'fish stew',
			ingredients: ['fish', 'stew']
		};

		return chai.request(app)
			.get('/recipes')
			.then(function(res) {
				updateData.id = res.body[0].id

				return chai.request(app)
					.put(`/recipes/${updateData.id}`)
					.send(updateData);
			})

			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.deep.equal(updateData);
			});
	});

	//DELETE test
	it('should delete an item (recipe) on DELETE', function() {
		return chai.request(app)
			.get('recipes')
			.then(function(res) {
				return chai.request(app)
					.delete(`recipes/${res.body[0].id}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
			});
	});
});
// Copyright (c) 2014-2015 Fernando Felix do Nascimento Junior

/**
 * Some Saiku Utilities. 
 * It needs prototype_class.min.js 1.0.0 (https://github.com/fernandojunior/prototype_class.js) and jQuery.
 **/
var SaikuUtils = Class.simple_extend({
	
        /**
	 * Build a new SaikuUtils object.
	 * 
	 * @param conf.rootpath The root path of Saiku Rest API. Default == '/pentaho/plugin/saiku/api/'
	 * @param conf.cube (optional) The default cube object.
	 * @param conf.cube.name The name of the cube
	 * @param conf.cube.schemaName The name of the schema
	 * @param conf.cube.catalog (optional) The name of the catalog. Default == conf.cube.schemaName
	 * @param conf.cube.connection (optional) The name of the connection. Default == conf.cube.schemaName
	 * @param conf.username (optional) The default name of the user.
         **/
	constructor: function (rootpath, username, cube) {
		this.rootpath = rootpath || '/pentaho/plugin/saiku/api/';
		this.username = username;
		this.cube = cube || {
			schemaName: undefined,
			name: undefined
                };
	},
	
        /**
	 * Create a new Saiku Query. Method: POST. Path: "{username}/query/{queryname}". 
	 * Observation: Saiku Query concept is similar to sql cursor.
	 * 
	 * @param conf.error The error callback
	 * @param conf.queryname The name of the new query
	 * @param conf.success The success callback
	 * @param conf.cube (optional) The cube object. Default == this.cube
	 * @param conf.cube.name The name of the cube
	 * @param conf.cube.schemaName The name of the schema
	 * @param conf.cube.catalog (optional) The name of the catalog. Default == conf.cube.schemaName
	 * @param conf.cube.connection (optional) The name of the connection. Default == conf.cube.schemaName
	 * @param conf.username (optional) The name of the user. Default == this.username
         **/
	open: function (conf) {
		var username = conf.username || this.username;
		var queryname = conf.queryname;
		var cube = conf.cube || this.cube;
		var success = conf.success;
		var error = conf.error;
		
		var uri = this.rootpath + username + "/query/" + queryname;
		
		var parameters = {
			catalog: cube.catalogName || cube.schemaName,
			connection: cube.connectionName || cube.schemaName,
			schema: cube.schemaName,
			cube: cube.name,
		};
		
		$.post(uri, parameters, function(data, status, jqXHR) {			
			success(data, status, jqXHR);
		}).fail(function() {
			console.log(arguments);
			error(arguments);
		});
		
	},
	
        /**
	 * Execute a MDX analysis. Method: POST. Path: "{username}/query/{queryname}/result".
	 * Observation: MDX analysis is similar to sql query.
	 * 
	 * @param conf.error The error callback
	 * @param conf.mdx The mdx analysis to be executed
	 * @param conf.queryname The name of the new query
	 * @param conf.success The success callback
	 * @param conf.cube (optional) The cube object. Default == this.cube
	 * @param conf.cube.name The name of the cube
	 * @param conf.cube.schemaName The name of the schema
	 * @param conf.cube.catalog (optional) The name of the catalog. Default == conf.cube.schemaName
	 * @param conf.cube.connection (optional) The name of the connection. Default == conf.cube.schemaName
	 * @param conf.mimetype (optional) The type of mdx analysis data. Default == json
	 * @param conf.open (optional) A flag to indicate if a new query to the mdx analysis must be created or not. Default == false
	 * @param conf.username (optional) The name of the user. Default == this.username
         **/
	execute: function (conf) {
		var username = conf.username || this.username;
		var queryname = conf.queryname;
		var open = conf.open || false;
		var cube = conf.cube || this.cube;
		var mdx = conf.mdx;
		var mimetype = conf.mimetype || 'json';
		var success = conf.success;
		var error = conf.error;
		
		var self = this;
		
		// creating new query
		if (open == true)
			return self.open({
				username: username,
				queryname: queryname,
				cube: cube,
				success: function (data) {
					delete conf['cube']; // bug: conf eh um parametro por referencia, portanto, deve-se copiar conf e entao deletar a chave do objeto copiado
					delete conf['open'];
					self.execute(conf);
				},
				error: error
			});
		
		var uri = this.rootpath + username + "/query/" + queryname + "/result";
		
		$.post(uri, { mdx:  mdx}, function(data, status, jqXHR) {
			
			if (mimetype != 'json') // export result set
				return self.export({
					username: username,
					queryname: queryname,
					mimetype: mimetype,
					success: success,
					error: error
				});
			
			success(data, status, jqXHR);
		}).fail(function() {
			console.log(arguments);
			error(arguments);
		});
		
	},
	
        /**
	 * Export a query. Method: GET. Path: "{username}/query/{queryname}/export/{mimetype}".
	 * 
	 * @param conf.error The error callback
	 * @param conf.queryname The name of the new query
	 * @param conf.success The success callback
	 * @param conf.mimetype (optional) The type of mdx analysis data. Default == 'json'
	 * @param conf.username (optional) The name of the user. Default == this.username
         **/
	export: function (conf) {		
		var username = conf.username || this.username;
		var queryname = conf.queryname;
		var mimetype = conf.mimetype;
		var success = conf.success;
		var error = conf.error;
		
		var uri = this.rootpath + username + "/query/" + queryname + "/export/" + mimetype;
		
		if (mimetype != 'csv' && mimetype != 'pdf' && mimetype != 'xls')
			return console.log('MIME type not suported: ' + type);
		
		$.get(uri, function(data, status, jqXHR) {
			success(data, status, jqXHR);
		}).fail( function() {
			console.log(arguments);
			error(arguments);
		});
		
	},	
	
		
});

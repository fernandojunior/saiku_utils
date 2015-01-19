// Copyright (c) 2014-2015 Fernando Felix do Nascimento Junior
//needs prototype_class.min.js (https://github.com/fernandojunior/prototype_class.js) and jquery 
var SaikuUtils = Class.simple_extend({
	
	constructor: function (rootpath, username, cube) {
		this.rootpath = rootpath || '/pentaho/plugin/saiku/api/';
		this.username = username;
		this.cube = cube;
	},
	
	// creates a query
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
	
	// executes a mdx over a query
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
		
		if (open == true)
			return self.open({
				username: username,
				queryname: queryname,
				cube: cube,
				success: function (data) {
					delete conf['cube']; // conf eh uma variavel por referencia, portanto, deve-se copiar conf
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

// export from query return this.saiku.rootpath + this.saiku.username + "/query/" + this.queryname + "/export/" + mimetype;

// export from file /pentaho/plugin/saiku/api/admin/export/saiku/xls?file=/home/admin/002.saiku

// create saiku analysis file

//POST
//
//http://localhost:8080/pentaho/plugin/saiku/api/admin/repository/resource
//
//name=/public/test2.saiku&file=/public/test2.saiku&content=<?xml version="1.0" encoding="UTF-8"?>
//<Query name="2AA5BBD2-C15D-A675-BA74-C204266B5E20" type="MDX" connection="MYSQL_TEST" cube="[Pedidos]" catalog="MYSQL_TEST" schema="MYSQL_TEST">
//  <MDX>SELECT
//NON EMPTY {Hierarchize({[Measures].[Volume Vendas]})} ON COLUMNS,
//NON EMPTY {Hierarchize({[Cliente].[Cliente].Members})} ON ROWS
//FROM [Pedidos]</MDX>
//  <Totals />
//  <Properties>
//    <Property name="saiku.olap.query.nonempty" value="true" />
//    <Property name="saiku.olap.query.nonempty.rows" value="true" />
//    <Property name="org.saiku.query.explain" value="true" />
//    <Property name="org.saiku.connection.scenario" value="false" />
//    <Property name="saiku.ui.render.mode" value="table" />
//    <Property name="saiku.olap.query.nonempty.columns" value="true" />
//    <Property name="saiku.olap.query.drillthrough" value="true" />
//    <Property name="saiku.olap.query.automatic_execution" value="true" />
//  </Properties>
//</Query>

// js/saiku/models/Repository.js

// var mq = new Query({ xml: '<Query name="C25E54AB-780D-AA9D-BCA8-260C267EE787" type="QM" connection="MYSQL_TEST" cube="[Pedidos]" catalog="MYSQL_TEST" schema="MYSQL_TEST"> <QueryModel> <Axes> <Axis location="ROWS" nonEmpty="true"> <Dimensions> <Dimension name="Filial" hierarchizeMode="PRE" hierarchyConsistent="true"> <Inclusions> <Selection dimension="Filial" type="level" node="[Filial].[Filial (Codigo)]" operator="MEMBERS" /> </Inclusions> <Exclusions /> </Dimension> </Dimensions> </Axis> <Axis location="COLUMNS" nonEmpty="true"> <Dimensions> <Dimension name="Measures" hierarchizeMode="PRE" hierarchyConsistent="true"> <Inclusions> <Selection dimension="Measures" type="member" node="[Measures].[Volume Vendas]" operator="MEMBER" /> </Inclusions> <Exclusions /> </Dimension> </Dimensions> </Axis> <Axis location="FILTER" nonEmpty="false" /> </Axes> </QueryModel> <MDX>SELECT NON EMPTY {Hierarchize({[Measures].[Volume Vendas]})} ON COLUMNS, NON EMPTY {Hierarchize({[Filial].[Filial (Codigo)].Members})} ON ROWS FROM [Pedidos]</MDX> <Totals /> <Properties> <Property name="saiku.ui.render.mode" value="table" /> <Property name="org.saiku.query.explain" value="true" /> <Property name="saiku.olap.query.nonempty.columns" value="true" /> <Property name="saiku.olap.query.nonempty.rows" value="true" /> <Property name="org.saiku.connection.scenario" value="false" /> <Property name="saiku.olap.query.automatic_execution" value="true" /> <Property name="saiku.olap.query.drillthrough" value="true" /> <Property name="saiku.olap.query.filter" value="true" /> <Property name="saiku.olap.query.limit" value="true" /> <Property name="saiku.olap.query.nonempty" value="true" /> </Properties> </Query>', formatter: Settings.CELLSET_FORMATTER}, { name: 'testaa'});
// var tab = Saiku.tabs.add(new Workspace({ query: mq }));

//var mq = new Query({ xml: '<Query name="C25E54AB-780D-AA9D-BCA8-260C267EE787" type="MDX" connection="MYSQL_TEST" cube="[Pedidos]" catalog="MYSQL_TEST" schema="MYSQL_TEST"> <MDX>SELECT NON EMPTY {Hierarchize({[Measures].[Volume Vendas]})} ON COLUMNS, NON EMPTY {Hierarchize({[Filial].[Filial (Codigo)].Members})} ON ROWS FROM [Pedidos]</MDX> <Totals /> <Properties> <Property name="saiku.ui.render.mode" value="table" /> <Property name="org.saiku.query.explain" value="true" /> <Property name="saiku.olap.query.nonempty.columns" value="true" /> <Property name="saiku.olap.query.nonempty.rows" value="true" /> <Property name="org.saiku.connection.scenario" value="false" /> <Property name="saiku.olap.query.automatic_execution" value="true" /> <Property name="saiku.olap.query.drillthrough" value="true" /> <Property name="saiku.olap.query.filter" value="true" /> <Property name="saiku.olap.query.limit" value="true" /> <Property name="saiku.olap.query.nonempty" value="true" /> </Properties> </Query>', formatter: Settings.CELLSET_FORMATTER}, { name: 'testaa'});
//var tab = Saiku.tabs.add(new Workspace({ query: mq }));

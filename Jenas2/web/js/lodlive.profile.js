var s4 = {
	url : "https://symmetric-flow-297911.appspot.com/Servlet",
	"ontology-folder" : "https://symmetric-flow-297911.appspot.com/s/",
	"ontology-prefix" : "https://symmetric-flow-297911.appspot.com/s/",
	lang : "ru",
	dbpedia : "dbpedia",
	dataType : "text",
	contentType : "application/x-www-form-urlencoded;charset=UTF-8",
	accept : "text/plain",
	order : ["title", "url", "thumbnail", "comment"],
	rel_ru : {"type": "type", "Class": "class", "subClassOf": "subClassOf", "sameAs" : "sameAs", "partOf" : "partOf", "domain" : "domain", "range" : "range", "subPropertyOf" : "subPropertyOf"},
	MaxHits : 30,
	bad_youtube : "youtu.be",
	well_youtube : "www.youtube.com/embed",
	implicit : "software-ontology"
};

var dict = {
	"software-ontology" : {"name":"Онтолония ПО⌈"},
	"http://dbpedia.org" : {"name":"База знаний DBpedia"},
	"http://fr.dbpedia.org" : {"name":"DBpedia на французском"}
};

$.jStorage.set('selectedLanguage', s4.lang);
$.jStorage.set('profile', {
	'connection' : {
			'software-ontology_' : {
			description : {
				ru : 'Проектная работа по учебному курсу «Семантический веб»',
				en : "Проектная работа по учебному курсу «Семантический веб»",
				title : "Онтолония кинематографии"
			},
			endpoint : "https://symmetric-flow-297911.appspot.com/s/", //
			sparql : {
				allClasses : 'SELECT DISTINCT ?object  WHERE {[] a ?object} ORDER BY ?object  LIMIT 50 ',
				findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} } LIMIT 1',
				documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object.FILTER ((( isIRI(?object) && ?property != <http://xmlns.com/foaf/0.1/depiction> )|| ?property = <http://www.w3.org/2000/01/rdf-schema#label>  || ?property = <http://www.georss.org/georss/point> || ?property = <http://xmlns.com/foaf/0.1/surname> || ?property = <http://xmlns.com/foaf/0.1/name> || ?property = <http://purl.org/dc/elements/1.1/title>))}  ORDER BY ?property',
				document : 'SELECT DISTINCT *  WHERE  {{<{URI}> ?property ?object. FILTER(!isLiteral(?object))} UNION  {<{URI}> ?property ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="en")} }  ORDER BY ?property',
				bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
				inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}>} LIMIT 100',
				inverseSameAs : 'SELECT DISTINCT * WHERE {?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}>}'
			},
			examples : [
			{uri : 'Country', label : 'Страна'},
			{uri : 'Genre', label : 'Жанр'},
			{uri : 'Award',	label : 'Награда'},
			{uri : 'Movie', label : 'Фильм'},
			{uri : 'Director', label : 'Режиссёр'},
			{uri : 'Company', label : 'Кинокомпания'},
			{uri : 'Actor', label : 'Актёр'},
			{uri : 'Writer', label : 'Сценарист'}
			]
		},
		'http://dbpedia.org' : {
			description : {
				ru : 'DBpedia есть крупнейшая международная база знаний, в которой можно осуществлять поиск ресурсов по ключевым словам.',
				en : 'DBpedia is a community effort to extract structured information from Wikipedia and to make this information available on the Web. DBpedia allows you to ask sophisticated queries against Wikipedia, and to link other data sets on the Web to Wikipedia data.',
				title : "DBpedia в примерах"
			},
			sparql : {
				allClasses : 'SELECT DISTINCT ?aclass ?label WHERE {?aclass rdf:type owl:Class; rdfs:label ?label .FILTER(!isBlank(?aclass) && (lang(?label) ="ru") && regex(?label, "программи|компьют", "gi")) } ORDER BY ?label',
				findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} } LIMIT 1',
				documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object.FILTER ((( isIRI(?object) && ?property != <http://xmlns.com/foaf/0.1/depiction> )|| ?property = <http://www.w3.org/2000/01/rdf-schema#label>  || ?property = <http://www.georss.org/georss/point> || ?property = <http://xmlns.com/foaf/0.1/surname> || ?property = <http://xmlns.com/foaf/0.1/name> || ?property = <http://purl.org/dc/elements/1.1/title>))}  ORDER BY ?property',
				document : 'SELECT DISTINCT *  WHERE  {{<{URI}> ?property ?object. FILTER(!isLiteral(?object))} UNION {<{URI}> ?property 	 ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="en")}}  ORDER BY ?property',
				bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
				inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}> FILTER(REGEX(STR(?object),\'//dbpedia.org\'))} LIMIT 100',
				inverseSameAs : 'SELECT DISTINCT * WHERE {?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> FILTER(REGEX(STR(?object),\'//dbpedia.org\'))}'
			},
			useForInverseSameAs : true,
			endpoint : 'http://dbpedia.org/sparql',
			examples : [{
				label : 'Semantic Web',
				uri : 'http://dbpedia.org/resource/Semantic_Web'
			}, {
				label : 'Linked data',
				uri : 'http://dbpedia.org/resource/Linked_data'
			}, {
				label : 'Obninsk',
				uri : 'http://dbpedia.org/resource/Obninsk'
			}, {
				label : 'Obninsk Institute for Nuclear Power Engineering',
				uri : 'http://dbpedia.org/resource/Obninsk_Institute_for_Nuclear_Power_Engineering'
			}, {
				label : 'Obninsk Nuclear Power Plant',
				uri : 'http://dbpedia.org/resource/Obninsk_Nuclear_Power_Plant'
			}, {
				label : 'Obninsk Meteorological tower',
				uri : 'http://dbpedia.org/resource/Obninsk_Meteorological_tower'
			}]
		},			

		'http://fr.dbpedia.org' : {
			description : {
				fr : 'DBpédia en français est le chapitre francophone de DBpedia, il s\'inscrit dans l\'effort d\'internationalisation de DBpedia dont le but est de maintenir des données structurées extraites de différents chapitres de Wikipedia.',
				en : 'French version of DBpedia',
				title : "DBpedia France"
			},
			useForInverseSameAs : false,
			sparql : {
				allClasses : 'SELECT DISTINCT ?aclass ?label WHERE {?aclass rdf:type owl:Class; rdfs:label ?label .FILTER(!isBlank(?aclass)).FILTER(lang(?label) ="fr")} LIMIT 500',
				findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} } LIMIT 1',
				documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object.FILTER ((( isIRI(?object) && ?property != <http://xmlns.com/foaf/0.1/depiction> )|| ?property = <http://www.w3.org/2000/01/rdf-schema#label>  || ?property = <http://www.georss.org/georss/point> || ?property = <http://xmlns.com/foaf/0.1/surname> || ?property = <http://xmlns.com/foaf/0.1/name> || ?property = <http://purl.org/dc/elements/1.1/title>))}  ORDER BY ?property',
				document : 'SELECT DISTINCT *  WHERE  {{<{URI}> ?property ?object. FILTER(!isLiteral(?object))} UNION 	 {<{URI}> ?property 	 ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="fr")} UNION 	 {<{URI}> ?property 	 ?object.FILTER(isLiteral(?object)).FILTER(lang(?object) ="en")}}  ORDER BY ?property',
				bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
				inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}>} LIMIT 100',
				inverseSameAs : 'SELECT DISTINCT * WHERE {?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}>}'
			},
			endpoint : 'http://fr.dbpedia.org/sparql',
			examples : [{
				uri : 'http://fr.dbpedia.org/resource/France',
				label : 'France'
			}, {
				uri : 'http://fr.dbpedia.org/resource/Paris',
				label : 'Paris'
			}, {
				uri : 'http://fr.dbpedia.org/resource/Resource_Description_Framework',
				label : 'Resource Description Framework'
			}]
		}
	},
	arrows : {
		'http://www.w3.org/2002/07/owl#sameAs' : 'isSameAs',
		'http://purl.org/dc/terms/isPartOf' : 'isPartOf',
		'http://purl.org/dc/elements/1.1/type' : 'isType',
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : 'isType'
	},
	uriSubstitutor : [{
		findStr : 'mpii.de/yago/resource/',
		replaceStr : 'yago-knowledge.org/resource/'
	}],
	'default' : {
		sparql : {
			allClasses : 'SELECT DISTINCT ?object WHERE {[] a ?object}',
			findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} }  LIMIT 1  ',
			documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object. FILTER(?property != <http://dbpedia.org/ontology/wikiPageWikiLink>)} ORDER BY ?property',
			document : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object}',
			bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
			inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}>.} LIMIT 100',
			inverseSameAs : 'SELECT DISTINCT * WHERE {?object ?t <{URI}> } '
		},
		endpoint : 'http://labs.regesta.com/resourceProxy/',
		document : {
			className : 'standard',
			titleProperties : ['http://www.w3.org/2004/02/skos/core#notation', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value', 'http://www.geonames.org/ontology#name', 'http://purl.org/dc/elements/1.1/title', 'http://purl.org/dc/terms/title', 'http://www.w3.org/2000/01/rdf-schema#label', 'http://www.w3.org/2004/02/skos/core#prefLabel', 'http://logd.tw.rpi.edu/source/visualizing-org/dataset/2010-global-agenda-council-interlinkage-survey/vocab/enhancement/1/how_councils_interlink', 'http://spcdata.digitpa.gov.it/nome_cognome', 'http://xmlns.com/foaf/0.1/firstName', 'http://xmlns.com/foaf/0.1/lastName', 'http://xmlns.com/foaf/0.1/surname', 'http://xmlns.com/foaf/0.1/name', 'http://purl.org/dc/terms/description','http://www.geonames.org/ontology/officialName', 'http://d-nb.info/standards/elementset/gnd#preferredName', 'http://d-nb.info/standards/elementset/gnd#preferredNameForTheFamily', 'http://d-nb.info/standards/elementset/gnd#preferredNameForThePerson', 'http://d-nb.info/standards/elementset/gnd#preferredNameForThePlaceOrGeographicName', 'http://d-nb.info/standards/elementset/gnd#preferredNameForTheConferenceOrEvent', 'http://d-nb.info/standards/elementset/gnd#preferredNameForTheWork', 'http://d-nb.info/standards/elementset/gnd#preferredNameForTheSubjectHeading']
		}, // http://www.w3.org/2000/01/rdf-schema#label
		images : {
			properties : ['https://symmetric-flow-297911.appspot.com/s/#image', 'http://www.w3.org/2006/vcard/ns#photo', 'http://xmlns.com/foaf/0.1/depiction', 'http://dbpedia.org/ontology/thumbnail', 'http://dbpedia.org/property/logo', 'http://linkedgeodata.org/ontology/schemaIcon']
		},
		videos : {
			properties : ['https://symmetric-flow-297911.appspot.com/s/#video']
		},
		keywords : {
			properties : ['https://symmetric-flow-297911.appspot.com/s/#keywords']
		},
		maps : {
			longs : ['http://www.w3.org/2003/01/geo/wgs84_pos#long'],
			lats : ['http://www.w3.org/2003/01/geo/wgs84_pos#lat'],
			points : ['http://www.georss.org/georss/point']
		},
		weblinks : {
			properties : ['http://www.w3.org/ns/dcat#accessURL', 'http://xmlns.com/foaf/0.1/mbox', 'http://rdfs.org/sioc/ns#links_to', 'http://it.dbpedia.org/property/url', 'http://data.nytimes.com/elements/search_api_query', 'http://www.w3.org/2000/01/rdf-schema#isDefinedBy', 'http://xmlns.com/foaf/0.1/page', 'http://xmlns.com/foaf/0.1/homepage', 'http://purl.org/dc/terms/isReferencedBy', 'http://purl.org/dc/elements/1.1/relation', 'http://dbpedia.org/ontology/wikiPageExternalLink', 'http://data.nytimes.com/elements/topicPage']
		}
	},
	'http://www.w3.org/2002/07/owl#Class' : {
		document : {className : 'Class'}
	},
	'http://www.w3.org/2002/07/owl#ObjectProperty' : {
		document : {className : 'ObjectProperty'}
	},
	'http://www.w3.org/2002/07/owl#Restriction' : {
		document : {className : 'DatatypeProperty'}
	},
	'http://www.w3.org/2002/07/owl#DatatypeProperty' : {
		document : {className : 'DatatypeProperty'}
	},
	'http://www.w3.org/2002/07/owl#Property' : {
		document : {className : 'Property'}
	},
	'http://data.oceandrilling.org/core/1/ODP' : {
		document : {
			titleProperties : ['expedition', 'http://data.oceandrilling.org/core/1/expedition', 'site', 'http://data.oceandrilling.org/core/1/site', 'hole', 'http://data.oceandrilling.org/core/1/hole']
		}
	},
	'http://www.w3.org/ns/locn#Address' : {
		document : {titleProperties : ['http://www.w3.org/ns/locn#fullAddress']}
	},
	'http://www.cnr.it/ontology/cnr/personale.owl#UnitaDiPersonaleInterno' : {
		document : {titleProperties : ['http://www.cnr.it/ontology/cnr/personale.owl#cognome', ' ', 'http://www.cnr.it/ontology/cnr/personale.owl#nome']}
	}
});
if (!document.lodliveVars) {document.lodliveVars = {};}
$.jStorage.set('boxTemplate', '<div class="boxWrapper" id="first"><div class="box sprite"></div></div>');
$.jStorage.set('relationsLimit', 55);
$.jStorage.set('doStats', $.jStorage.get('doStats', true));
$.jStorage.set('doInverse', $.jStorage.get('doInverse', true));
$.jStorage.set('doAutoExpand', $.jStorage.get('doAutoExpand', true));
$.jStorage.set('doAutoSameas', $.jStorage.get('doAutoSameas', true));
$.jStorage.set('doCollectImages', $.jStorage.get('doCollectImages', true));
$.jStorage.set('doDrawMap', $.jStorage.get('doDrawMap', true));
$.jStorage.set('showInfoConsole', $.jStorage.get('showInfoConsole', true));
$.jStorage.set('endpoints', {
	all : 'output=json&format=application/json&timeout=0',
	arcSparql : 'output=json&jsonp=lodlive',
	sesame : 'Accept=application/sparql-results%2Bjson'
});

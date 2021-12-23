// lodLive 2.0 developed by Victor Telnov
$(function() {
	img_opened_is_grab = [];
	var max_images_is_grab = 5;
	var repo_processor, max_attempts = 9;
	var current_graph = s4.implicit;
	s4.classes = [];
	s4.concept = [];
	s4.individ = [];
	var label_list = [];		// массив меток для выпадающего меню
	var connection = null;
	var ff = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1);
	$.jStorage.set('selectedLanguage', s4.lang);
	var onto_form, ontotext = true;
	$('.telnov_main').append(lang('the_beta'));
	var loader_white = '<img src="img/ajax-loader-white.gif" style="margin-left:6px;margin-top:2px"/>';
	var loader_gray = '<img src="img/ajax-loader-gray.gif" style="margin-left:6px;margin-top:2px"/>';
	var z = $('a', $('p'));
	var for_ajax = {				// данные для асинхронного POST-запроса к DBaaS
		type: "POST",
		xhrFields: { withCredentials: true },
		dataType: s4.dataType,
		contentType: s4.contentType,
		cache: false,
		crossDomain: true
	};
	// Генератор сетевых адресов серверов для их оперативного переключения, без повторов	
	jena_app = [];
	// Генератор сетевых адресов серверов	
	var spot_generator = function() { return s4.url; }	

	// Функция-конструктор создания объектов для работы с серверами DBaaS
	var repo_constructor = function(the_graph) {
		var self = this;			// внутренняя ссылка на объект
		this.alive = true;			// жив ли объект?
		this.beginning = null;
		this.ready_0 = false;
		this.ready_1 = false;
		this.ready_2 = false;
		this.for_ajax = for_ajax;
		self.for_ajax.data = {};
		self.for_ajax.data.ontofile = the_graph;
		this.for_ajax.headers = { 'Accept': s4.accept, 'Content-Type': s4.contentType, 'Access-Control-Allow-Origin':'*' };
		this.attempt_0 = 0;
		this.attempt_1 = 0;
		this.attempt_2 = 0;
		this.init = false;
		this.callback = null;
		this.go = function(init, callback){
			self.alive = true;
			try	{ alert_hide(); } catch(e){};
			self.init = init;
			self.callback = callback;
			self.start_0();
			self.start_1();
			self.start_2();
			self.waiting();
		};
		this.stop = function(){
			self.alive = false;
			if(self.beginning) clearTimeout(self.beginning);
		};
		this.waiting = function(){
			if(!self.alive) return;
			if(self.beginning) clearTimeout(self.beginning);
			self.beginning = setTimeout(function(){
				if(!self.ready_0 || !self.ready_1 || !self.ready_2) browserMessage(lang('ontotext_wait'));
			}, 5000);
		};
		this.all_ready = function(){
			if(!self.alive) return;
			if(self.ready_0 && self.ready_1 && self.ready_2) {
				if(self.beginning) clearTimeout(self.beginning);
				if(onto_form) {
				if(self.init) $('div[rel=ontotext]', onto_form).click();
				onto_form.children('div.inputClass').children('img').remove();
				$('input[name=classFrom]', onto_form).first().val('').css('display', 'block').focus();
				}
				if(self.callback) self.callback();
				try	{ alert_hide(); } catch(e){};
			}
		};
		this.start_0 = function(){
			if(!self.alive) return;
			// Все классы, которые есть в онтологии
			self.ready_0 = false;
			s4.classes = [];
			s4.concept = [];
			self.for_ajax.data.query = 'SELECT DISTINCT ?aclass ?label WHERE { ?aclass rdf:type owl:Class; rdfs:label ?label .FILTER(!isBlank(?aclass)).FILTER(lang(?label) = "' + s4.lang + '")} ORDER BY ?label';
			self.for_ajax.url = spot_generator();
			var jqXHR_0 = $.ajax(self.for_ajax);			// асинхронный запрос к DBaaS
			jqXHR_0.done(function(response) {				// успешный ответ от DBaaS
				var json = JSON.parse(response);
				json = json['results'];
				if(json) json = json['bindings'];
				if(!json) self.fail(++self.attempt_0, self.start_0);
				else {
					$.each(json, function(key, value){ 
						var name = value.label.value;
						var thing = value.aclass.value;
						s4.classes[name] = thing;		// массив классов онтологии и их меток
						var obj = { index : 0, name : name, thing : thing.substr(thing.indexOf('#')+1) };  
						s4.concept.push(obj);			// индивиды
					});
					self.ready_0 = true;
					self.all_ready();
				}
			});
			jqXHR_0.fail(function(){ self.fail(++self.attempt_0, self.start_0); });
		};
		this.start_1 = function(){
			if(!self.alive) return;
			// Все сущности, которые есть в онтологии на данном языке
			s4.individ = [];
			self.ready_1 = false;
			self.for_ajax.data.query = 'SELECT DISTINCT ?individ ?label WHERE { ?individ rdf:type owl:NamedIndividual; rdfs:label ?label .FILTER(!isBlank(?individ)).FILTER(lang(?label) = "' + s4.lang + '")} ORDER BY ?label';
			self.for_ajax.url = spot_generator();
			var jqXHR_1 = $.ajax(self.for_ajax);			// асинхронный запрос к DBaaS
			jqXHR_1.done(function(response) {		// успешный ответ от DBaaS
				var json = JSON.parse(response);
				json = json['results'];
				if(json) json = json['bindings'];
				if(!json) self.fail(++self.attempt_1, self.start_1);
				else {
					$.each(json, function(key, value){ 
						var name = value.label.value;
						var thing = value.individ.value;
						var obj = { index : 0, name : name, thing : thing.substr(thing.indexOf('#')+1) };  
						s4.individ.push(obj);			// индивиды
					});
					self.ready_1 = true;
					self.all_ready();
				}
			});
			jqXHR_1.fail(function(){ self.fail(++self.attempt_1, self.start_1); });
		};
		this.start_2 = function(){
			if(!self.alive) return;
			// Все отношения, которые есть в онтологии
			self.ready_2 = false;
			self.for_ajax.data.query = 'SELECT DISTINCT ?subject ?object WHERE {?subject rdf:type owl:ObjectProperty; rdfs:label ?object.FILTER(lang(?object) ="' + s4.lang + '")}';
			self.for_ajax.url = spot_generator();
			var jqXHR_2 = $.ajax(self.for_ajax);			// асинхронный запрос к DBaaS
			jqXHR_2.done(function(response) {		// успешный ответ от DBaaS
				var json = JSON.parse(response);
				json = json['results'];
				if(json) json = json['bindings'];
				if(!json) self.fail(++self.attempt_2, self.start_2);
				else {
					$.each(json, function(key, value){ 
						var z = value.subject.value;
						var rel = z.substr(z.indexOf('#')+1)
						s4.rel_ru[rel] = value.object.value;
					});
					self.ready_2 = true;
					self.all_ready();
				}
			});
			jqXHR_2.fail(function(){ self.fail(++self.attempt_2, self.start_2); });
		};
		this.fail = function(attempt, start_f){
			if(!self.alive) return;
			if(attempt < max_attempts) setTimeout(function(){ start_f(); }, 99);
			else { self.stop(); browserMessage(lang('ontotext_error')); }
		};
		return this;
	}
	// Конец функции-конструктора создания объектов для работы с серверами DBaaS
	
	var spriteHome = 'spriteHome';
	var nextSpeed = 500;
	var fadeSpeed = 100;
	var loca = $(location).attr('search');
    var hash = $(location).attr('hash');
	if (loca) {
		$("#startPanel").remove();
		$(".paginator").remove();
		$("#footer").remove();
		$("#lang").remove();
		$('body').append('<div id="aSpace"></div>');
		var res = $.trim(loca.substring(loca.indexOf("?") + 1));
		if (hash) res += hash;
		res = res.replace(/%2F/g, '/');
		res = res.replace(/%3A/g, ':');
		res = res.replace(/%23/g, '#');
		$("#aSpace").lodlive('init', res);	// запуск браузера RDF
	} else {
		var boxesLength = 0;
		$.each($.jStorage.get('profile').connection, function(key, value) {boxesLength++;});
		var selBox = (boxesLength + 1) * 310;
		var pag = (selBox / 930 + "").indexOf(".") > 0 ? parseInt(selBox / 930 + "".replace(/\.[0-9]*/, '')) + 1 : selBox / 930;
		$('#boxesCont').width((pag) * 930);
		$('#nextPage,#prevPage').click(function() {
			$('#boxesCont .slimScrollDiv').remove();
			var boxes = $('#boxesCont').not(':animated');
			var next = $(this).attr("id") == 'nextPage';
			if (boxes.length == 1) {
				$('.hdPage:visible').hide();
				$('.selectionList').remove();
				var props = {};
				var marginLeft = parseInt(boxes.css("marginLeft").replace(/px/g, ''), 10);
				if (next) {
					props = {marginLeft : (-930 + marginLeft) + "px"};
					if (marginLeft == 0) {
						$('#prevPage:hidden').fadeIn('fast');
					} else if ($('#boxesCont').css('marginLeft').replace(/[-px]/g, '') == (pag - 2) * 930) {
						$('#nextPage:visible').fadeOut('fast');
					}
				} else {
					props = {marginLeft : (930 + marginLeft) + "px"};
					if (marginLeft == -930) $('#prevPage:visible').fadeOut('fast');
					else $('#nextPage:hidden').fadeIn('fast');
				}
				boxes.fadeTo(fadeSpeed, 0.8, function() {
					boxes.animate(props, nextSpeed, function() {
						boxes.fadeTo(fadeSpeed, 1, function() {
							nextSpeed = 500;
							fadeSpeed = 100;
						});
					});
				});
			}
		});
		var formTemplate = '<form><div class="select"><span>' + lang('choose') + '</span><span class="' + spriteHome + ' arrow"></span></div><div class="input"><input type="text" name="startFrom" value="" readonly="readonly"/></div></form>';
		var formDBpedia = '<form class="ontotext_form"><div class="input"><input type="text" name="startFrom" value="" readonly="readonly"/></div></form>';
		var formOntotext = '<form class="ontotext_form"><div class="input"><input type="text" name="startFrom" value="" readonly="readonly"/></div></form>';
		var firstLine = $('#firstLineBoxes');
		ontotextBox(firstLine, formOntotext);
		liveOnlodLive($('#startPanel').children('#boxes').children('#boxesCont'));
		dbpediaBox(firstLine, formDBpedia);
		blueBox(firstLine, formDBpedia);
		examp();
		do_repo();
		function do_repo() {
			if(repo_processor) repo_processor.stop();
			repo_processor = new repo_constructor(current_graph);
			repo_processor.go(true);
		}
	
// 		Делаем боксы с примерами	
		function examp() {
			$.each($.jStorage.get('profile').connection, function(key, value) {
				// фиксируем нужный граф
				var the_graph = key.substr(key.indexOf('_')+1);
				var examples = value.examples;
				var aBox = $('<div class="startBox ' + spriteHome + '" rel="' + key + '" title="' + value.description[s4.lang] + '"><h1><span>' + value.description['title'] + '</span><span class="' + spriteHome + ' info"></span></h1><h2 style="margin:-9px 25px;"><span>' + lang('resource') + '</span></h2></div>');
				$('#startPanel').children('#boxes').children('#boxesCont').append(aBox);
				var descr = value.description[$.jStorage.get('selectedLanguage')];
				if (!descr) descr = value.description[s4.lang];
				var descrBox = $('<div class="startBox infoHome hdPage" rel="' + key + '"><h1><span>' + key.replace(/,.*/g, '').replace(/http:\/\//gi, '') + '</span></h1><p>' + descr + '</p></div>');
				$('#startPanel').children('#boxes').children('#boxesCont').append(descrBox);
				var form = $(formTemplate).css('margin-top','-30px');;
				aBox.append(form);
				aBox.children('h1').children('span').click(function() {
					descrBox.css({
						position : 'absolute',
						top : aBox.position().top,
						left : aBox.position().left
					});
					descrBox.fadeIn('fast');
					if ($('div.selectionList', form).length > 0) {form.find('div.select').click();}
				});
				descrBox.click(function() {descrBox.fadeOut('fast');});
				form.bind('submit', function() {
					var value = $(this).find('input[name=startFrom]').val();
					if (value != '') {		// Открытие LOD
						var name = $.trim(value);
						s4.firstUri = the_graph + '#' + name;
						var url = '?' + (ontotext ? s4.firstUri : name);
						window.open(url, '_blank');
					} else browserMessage(lang('impostaUnaURI'));
					return false;
				});
				form.find('div.select').click(function() {
					fix_graph(the_graph);			// фиксируем нужный граф
					if ($(this).data('show')) {
						$('div.selectionList', form).remove();
						$(this).data('show', false);
					} else {
						$(this).data('show', true);
						var ele = $(this);
						var jExemples = $('<div class="selectionList" style="overflow-y:auto;height:160px;margin-top:2px;"></div>');
						form.append(jExemples);
						jExemples.append('<div class="selectEle" rel="inserisci"><span>' + lang('addUri') + '</span></div>');
						jExemples.append('<div class="selectEle" rel="cerca"><span>' + lang('findResource') + '</span></div>');
						if (examples) {
							for (var a = 0; a < examples.length; a++) {
								jExemples.append('<div class="selectEle" rel="' + examples[a].uri + '"><span>' + lang('example') + ' - ' + examples[a].label + '</span></div>');
							}
						}
						jExemples.hover(function(){}, function(){$('div.selectionList', form).remove();});
						form.find('.selectEle').click(function(){
							if(form.parent().attr('rel').indexOf(s4.dbpedia)>-1) ontotext = false; else ontotext = true;
							ele.click();
							var label = $(this).attr('rel');
							if (label == 'cerca') {
								form.parent().setBackgroundPosition({y : -320});
								var cerca = $('<div class="cerca"><div class="select"><span>' + lang('choose_class') + '</span><span class="' + spriteHome + ' arrow"></span></div><div class="inputClass"><input type="text" name="classFrom" value="" readonly="readonly"/></div></div>');
								if ($('div.cerca', form).length == 0) {
									form.find('input[name=startFrom]').val('').attr('readonly', 'readonly').css({
										background : '#bdbdbd',
										color : '#575757'
									}).parent().css({background : '#bdbdbd'}).before(cerca);
								}
								cerca.find('div.select > span:first').html(lang('choose_class'));		
									form.find('.inviaForm').attr("style", 'top: 20px;');
									var jClasses = $('<div class="selectionList" style="display:none"></div>');
									var template = '<div class="selectEle" ><span>{CONTENT}</span></div>';
									fix_graph(the_graph, callback);
									function callback(){
										cerca.find('div.select > span:first').html(lang('choose_class'));
										for(var _label in s4.classes) jClasses.append(template.replace(/\{CONTENT\}/g, _label));
										cerca.append(jClasses);
										cerca.find('div.select').click(function() {
										if ($(this).data('show')) {
											$('.slimScrollDiv', cerca).remove();
											$(this).data('show', false);
										} else {
											$(this).data('show', true);
											cerca.append(jClasses);
											var ele2 = $(this);
											cerca.find('.selectEle').click(function() {
												ele2.click();
												var label = $(this).text();
												ele2.find('span:first').text(label);
												cerca.find('input[name=classFrom]').val(label).removeAttr('readonly').css({
													background : '#fff',
													color : '#000'
												}).focus().parent().css({background : '#fff'});
												var z = s4.classes[label].substr(s4.classes[label].indexOf('#')+1);
												form.find('input[name=startFrom]').val(z).removeAttr('readonly');
											});
											var invia2 = $('<div class="inviaForm2"></div>');
											if (cerca.find('.inviaForm2').length != 0) {cerca.find('.inviaForm2').remove();}
											invia2.click(function() {
												$("#aSpace").lodlive('findSubject', form.parent().attr('rel'), "http://" + ele2.find('span:first').text(), cerca.find('input[name=classFrom]').val(), form.find('input[name=startFrom]'), form.find('input[name=startFrom]'));
											});
											cerca.append(invia2);
											$('.slimScrollDiv', cerca).remove();
											jClasses.css({display : 'block'});
											jClasses.slimScroll({
												height : 8 * 20 + 5,
												width : 260,
												color : '#000'
											});
											$('.slimScrollDiv', cerca).css({
												position : 'absolute',
												display : 'block',
												left : ele2.position().left,
												top : ele2.position().top + 61
											});
											$('.slimScrollDiv', cerca).hover(function(){}, function(){ele2.click();});
										}
										});
									}
							} else if (label == 'inserisci') {
								form.find('input[name=startFrom]').val('').removeAttr('readonly').css({
									background : '#fff',
									color : '#575757'
								}).focus().parent().css({background : '#fff'});
								$('.cerca', form).remove();
								form.find('.inviaForm').attr("style", '');
								form.parent().setBackgroundPosition({y : -10});
							} else {
								var z = label.indexOf(s4.dbpedia) > -1;
								label = z ? label : label.substr(label.indexOf('#')+1);
								form.find('input[name=startFrom]').attr('readonly', 'readonly').css({
									background : '#bdbdbd',
									color : '#575757'
								}).val(label).parent().css({
									background : '#bdbdbd'
								});
								$('.cerca', form).remove();
								form.find('.inviaForm').attr("style", '');
								form.parent().setBackgroundPosition({
									y : -10
								});
							}
							form.find('div.select > span:first').text($(this).find('span').text());
						});
						jExemples.css({
							position : 'absolute',
							zIndex : '99',
							paddingTop : '3px',
							left : ele.position().left,
							top : ele.position().top + 60
						});
					}
				});
				var invia = $('<div class="exampleForm"></div>').html('<p class="start_it">' + lang('the_start') + '</p>');
				invia.click(function() {form.submit();});
				form.append(invia);
			});
		}
	}
	if (!$.support.canvas) browserMessage(lang('noIe'));
	function showDescrBox(aBox, descrBox, form) {
		aBox.children('h1').children('span').click(function() {
			descrBox.css({
				position : 'absolute',
				top : aBox.position().top,
				left : aBox.position().left
			});
			descrBox.fadeIn('fast');
			if ($('div.selectionList', form).length > 0) {form.find('div.select').click();}
		});
		descrBox.click(function() {
			descrBox.fadeOut('fast');
		});
	}
	function addSubmit(form) {
		var invia = $('<div class="inviaForm"></div>').html('<p class="start_it">' + lang('the_start') + '</p>');
		invia.click(function() {form.submit();});
		form.append(invia);
		form.bind('submit', function() {
			var value = $(this).find('*[name=startFrom]').val();
			if (value != '') {		// Открытие LOD
				var name = $.trim(value);
				s4.firstUri = current_graph + '#' + name;
				var url = '?' + (ontotext ? s4.firstUri : name);
				window.open(url, '_blank');
			} else browserMessage(lang('impostaUnaURI'));
			return false;
		});
	}
	function blueBox(firstLine, formTemplate) {
		var aBox = $('<div class="startBox ' + spriteHome + '" id="boxGoogle"><h1><span>' + lang('insertUri') + '</span><span class="' + spriteHome + ' info"></span></h1><h2 style="margin:0px 20px;"><span>' + lang('the_resource') + '</span></h2></div>');
		firstLine.append(aBox);
		var descrBox = $('<div class="startBox infoHome hdPage" ><h1><span>' + lang('insertUri') + '</span></h1><p>' + lang('insertUriDescription') + '</p></div>');
		firstLine.append(descrBox);
		var form = $(formTemplate);
		showDescrBox(aBox, descrBox, form);
		var input = form.find('div.input');
		var textarea = $("<div class=\"input textarea\"><textarea name=\"startFrom\" placeholder=\"" + lang('addUri') + "\"></textarea></div>");
		input.before(textarea);
		input.remove();
		form.children('.select').remove();
		form.find('input').attr("readonly", false);
		firstLine.children('#boxGoogle').append(form);
		addSubmit(form);
		$('#boxGoogle').mouseover(function(){
			ontotext = false;
			ele2 = form.find('textarea[name=startFrom]');
			ele2.unbind('focus');
			ele2.removeAttr('readonly').focus();
		});
	}
	function liveOnlodLive(dest) {
		var aBox = $('<div class="startBox ' + spriteHome + ' endpList"><h1><span>' + lang('endPoint') + '</span><span class="' + spriteHome + ' info"></span></h1></div>');
		dest.prepend(aBox);
		var form = $('<form><div class="select"><span>' + lang('choose') + '</span><span class="' + spriteHome + ' arrow"></span></div></form>');
		aBox.append(form);
		aBox.find('div.select').click(function() {
			if ($(this).data('show')) {
				$(this).data('show', false);
				$('.slimScrollDiv', form).remove();
			} else {
				$(this).data('show', true);
				var ele = $(this);
				var jEndpoints = $('<div class="selectionList"></div>');
				for(var key in dict) jEndpoints.append('<div class="selectEle" rel="' + key + '"><span>' + dict[key].name + '</span></div>');
				form.append(jEndpoints);
				jEndpoints.css({left : ele.position().left});
				form.find('.selectEle').click(function() {
					ele.click();
					var label = $(this).attr('rel');
					var selBox = $("div[rel='" + label + "'].startBox:first").position().left + 310;
					var pag = (selBox / 930 + "").indexOf(".") > 0 ? parseInt(selBox / 930 + "".replace(/\.[0-9]*/, '')) + 1 : selBox / 930;
					for (var a = 0; a < pag - 1; a++) {
						$.doTimeout(205 * a, function() {
							nextSpeed = 0;
							fadeSpeed = 0;
							$("#nextPage").click();
						});
					}
				});
				$('.slimScrollDiv', form).remove();
				jEndpoints.css({display : 'block'});
				jEndpoints.slimScroll({
					height : 7 * 20 + 5,
					width : 260,
					color : '#000'
				});
				$('.slimScrollDiv', form).css({
					position : 'absolute',
					display : 'block',
					paddingTop : '4px',
					zIndex : '89',
					left : ele.position().left,
					top : ele.position().top + 10
				});
				$('.slimScrollDiv', form).hover(function(){}, function() {aBox.find('div.select').click();});
			}
		})
	}
	function dbpediaBox(firstLine, formTemplate) {
		var aBox = $('<div class="startBox ' + spriteHome + '" id="boxDBpedia"><h1><span>' + lang('simpleSearch') + '</span><span class="' + spriteHome + ' info"></span></h1><h2 style="margin:0px 20px;"><span>' + lang('the_dbpedia') + '</span></h2></div>');
		firstLine.append(aBox);
		var descrBox = $('<div class="startBox infoHome hdPage" ><h1><span>' + lang('simpleSearch') + '</span></h1><p>' + lang('simpleSearchDescription') + '</p></div>');
		firstLine.append(descrBox);
		var ele2, form = $(formTemplate);
		showDescrBox(aBox, descrBox, form);
		firstLine.children('#boxDBpedia').append(form);
		form.children('.input').before($('<div class="inputClass"><input type="text" name="classFrom" value="" readonly="readonly" placeholder="' + lang('the_word') + '"></div>'));
			$('div.selectionList', form).remove();
			$('div.selectionList', form).remove();
			var jEndpoints = $('<div class="selectionList"></div>');
			jEndpoints.append('<div class="selectEle" rel="dbpedia"><span>dbpedia.org</span></div>');
			form.append(jEndpoints);
			jEndpoints.css({
				position : 'absolute',
				zIndex : '-9'
			});
			form.find('.selectEle').click(function() {
				var label = $(this).attr('rel');
				ele2 = form.find('input[name=classFrom]');
				ele2.unbind('focus');
				ele2.unbind('keyup');
				ele2.val('').removeAttr('readonly').css({
					background : '#fff',
					color : '#975E1C'
				}).focus().parent().css({
					background : '#fff'
				});
				var invia2 = $('<div class="inviaForm2" style="display:none"></div>');
				var cerca = form.find('.inputClass');
				var timer = null;
				ele2.keyup(function() {
					if ($(this).val().length > 0) {
						clearTimeout(timer);
						timer = setTimeout(function(){invia2.click();}, 250);
					}
					try	{ alert_hide(); } catch(e){};
				});
				invia2.click(function() {
					form.find('.selectionList').remove();
					if (ele2.val().length > 0) {
						form.children('div.input').children('img').remove();
						form.children('div.input').prepend(loader_white);
						var results = [];
						results = findConcept(label, ele2.val(), function() {
							form.children('div.input').children('img').remove();
							var jClasses = $('<div class="selectionList" style="overflow:auto;height:460px;"></div>');
							for (var int = 0; int < results.length; int++) {
								var row = results[int];
								jClasses.append('<div class="selectEle" ><span title="' + decodeURIComponent(row.uri) + '">' + row.label + '</span></div>');
							}
							form.append(jClasses);
							jClasses.find('span').click(function() {
								ele2.val($(this).text());
								form.find('input[name=startFrom]').val($(this).attr('title'));
								$('.selectionList').remove();
							});
							jClasses.hover(function() {
							}, function() {
								form.find('.selectionList').remove();
							});
							jClasses.css({
								position : 'absolute',
								zIndex : '299',
								display : 'block',
								left : ele2.position().left,
								top : ele2.position().top + 21
							});
						}, function() {
							form.children('div.input').children('img').remove();
						});
					}
				});
				cerca.append(invia2);
				form.children('div.select').children('span:first').text($(this).find('span').text());
			});
		addSubmit(form);
		$('div[rel=dbpedia]', form).click();
		var random, unic_img, unic_x;
		do {
			random = Math.floor(( Math.random() * (max_images_is_grab * 1000 - 1)) / 1000);
			unic_img = false; unic_x = true;
			for(var n = img_opened_is_grab.length; (n > 0) && (n > img_opened_is_grab.length-3); n--) { if(random == img_opened_is_grab[n-1]) { unic_x = false; break; }}
			if(unic_x) unic_img = true;
		} while(!unic_img);
		img_opened_is_grab.push(random);
		var $search_img = $('<img>')
			.addClass('search_img_lodlive')
			.attr({'src':'http://vt.obninsk.ru/docs/xs/ksst_search_small_' + random + '.png'});
		var $search_img_div = $('<div>').addClass('search_img_div_lodlive').append($search_img);
		$('div.startBox.endpList').append($search_img_div);
		$('#boxDBpedia').mouseover(function(){
			ontotext = false;
			ele2 = form.find('input[name=classFrom]');
			ele2.unbind('focus');
			ele2.removeAttr('readonly').focus();
		});
	}
	function findConcept(type, value, callback, onAbort) {
		var result = [];
			connection = $.ajax({
				url : 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=&MaxHits=' + s4.MaxHits  + '&QueryString=' + value,
				async : true,
				success : function(data) {
					var xml = $(data);
					xml.find('Result').each(function() {
						result.push({
							uri : $(this).children('URI').text(),
							label : $(this).children('Label').text()
						});
						callback();
					});
					if (xml.find('Result').length == 0) {onAbort();};
				},
				complete : function(a, b) {
					if (b == 'error' || b == 'parsererror' || b == 'timeout') {
						browserMessage(lang('enpointNotAvailableOrSLow'));
						onAbort();
					}
				}
			});
		return result;
	}
		// Актуализация выбранного графа знаний. Обращение: fix_graph(имя графа из s4.dict)
		function fix_graph(the_graph, callback) {
			if(the_graph.indexOf(s4.dbpedia) > -1) return;
			var form = $('form', $('#boxOntotext'));
			var the_field = $('span:first', $('div.select', form));
			var tempo = $('input[name=classFrom]', form).first();
			tempo.focus();
			$('input[name=startFrom]', form).first().val('');
			the_field.html(dict[the_graph].name);
			if(s4.implicit == the_graph) {				// остаемся в старом графе
				if(callback) callback();
				return;
			} else {									// актуализируем иной граф
//			Здесь нужно обнулить список концептов и обозначить ожидание	
				tempo.css('display', 'none');
				form.find('.selectionList').remove();
				form.children('div.inputClass').children('img').remove();
				form.children('div.inputClass').prepend(loader_gray);
//			Обновить список концептоа из свежезагруженного графа знаний				
				current_graph = the_graph;
				s4.implicit = current_graph;
				if(repo_processor) repo_processor.stop();
				repo_processor = new repo_constructor(current_graph);
				repo_processor.go(false, callback);	
			}
		}	
	function ontotextBox(firstLine, formTemplate) {
		var aBox = $('<div class="startBox ' + '" id="boxOntotext"><h1><span>' + lang('ontotextSearch') + '</span><span class="' + spriteHome + ' info"></span></h1><h2 style="margin:0px 20px;"><span>' + lang('the_graph') + s4.implicit + '.owl»' + '</span></h2></div>');
		firstLine.append(aBox);
		var descrBox = $('<div class="startBox infoHome hdPage" ><h1><span>' + lang('ontotextSearch') + '</span></h1><p>' + lang('ontotextSearchDescription') + '</p></div>');
		firstLine.append(descrBox);
		var ele2, form = $(formTemplate);
//		if(ff) form.css('margin-top','-24px');
		var graphList = $('<div class="selectionList"></div>');
		var graps = $('div.select', form);
		var graps_span = $('span:first', graps).html(lang('choose_graph'));
		showDescrBox(aBox, descrBox, form);
		form.children('.input').before($('<div class="inputClass"><input type="text" name="classFrom" value="" readonly="readonly" placeholder="' +  lang('the_word') + '"></div>'));
		form.find('.inputClass').css('margin-top','34px');
		$('div.selectionList', form).remove();
		var entitis = $('<div class="selectionList"></div>');
		entitis.append('<div class="selectEle" rel="ontotext"><span></span></div>');
		form.append(entitis);
		entitis.css({position : 'absolute', zIndex : '-9'});
		$('input[name=classFrom]', form).first().css('display', 'none');
		form.children('div.inputClass').prepend(loader_gray);
		firstLine.children('#boxOntotext').append(form);
		onto_form = form;
		// Выбрать граф знаний
		graps.click(function(){
			var ele = $(this);
			ele2 = form.find('input[name=classFrom]');
			ele2.focus();
			if (ele.data('show')) {
				ele.data('show', false);
				$('.slimScrollDiv', form).remove();
			} else {
				ele.data('show', true);
				if($('div.selectEle',graphList).length == 0){
					for(var name in dict) graphList.append('<div class="selectEle"><span>' + dict[name].name + '</span></div>');
				}
				form.append(graphList);
				var graps_span = $('span:first', graps);
				graphList.css({left : ele.position().left});
				graphList.find('.selectEle').click(function(){
					// Актуализировать выбранный граф знаний
					var z = $('span:first', $(this)).html();
					for(var name in dict) if(z == dict[name].name) { fix_graph(name); break; };
					aBox.find('div.select').click();
				});
				$('.slimScrollDiv', form).remove();
				graphList.css({display : 'block'});
				graphList.slimScroll({
					height : 7 * 20 + 5,
					width : 260,
					color : '#000'
				});
				$('.slimScrollDiv', form).css({
					position : 'absolute',
					display : 'block',
					paddingTop : '3px',
					zIndex : '299',
					left : ele.position().left,
					top : ele.position().top + 61
				});
				$('.slimScrollDiv', form).hover(function(){}, function(){aBox.find('div.select').click();});
			}
		});
		// Выбрать концепт	
			form.find('.selectEle').click(function() {
				var label = $(this).attr('rel');
				ele2 = form.find('input[name=classFrom]');
				ele2.unbind('focus');
				ele2.unbind('keyup');
				ele2.val('').removeAttr('readonly').css({
					background : '#fff',
					color : '#975E1C'
				}).focus().parent().css({
					background : '#fff'
				});
				var invia2 = $('<div class="inviaForm2" style="display:none"></div>');
				var cerca = form.find('.inputClass');
				ele2.keyup(function() {
					if ($(this).val().length > 0) {
						if(graps_span.html() == lang('choose_graph')) { fix_graph(s4.implicit); }
						entitis.css({zIndex : 9});
						invia2.click();
					}
				});
				invia2.click(function() {
					form.find('.selectionList').remove();
					if (ele2.val().length > 0) {
						form.children('div.input').children('img').remove();
						form.children('div.input').prepend(loader_gray);
						var results = [];
						results = findOntotext(ele2.val());
						form.children('div.input').children('img').remove();
						var jClasses = $('<div class="selectionList" style="overflow:auto;height:460px;"></div>');
						for (var n = 0; n < results.length; n++) {
							var row = results[n];
							jClasses.append('<div class="selectEle" ><span title="' + decodeURIComponent(row.uri) + '">' + row.label + '</span></div>');
						}
						form.append(jClasses);
						jClasses.find('span').click(function() {
							ele2.val($(this).text());
							form.find('input[name=startFrom]').val($(this).attr('title'));
							$('.selectionList').remove();
						});
						jClasses.hover(function(){}, function(){form.find('.selectionList').remove();});
						jClasses.css({
							position : 'absolute',
							zIndex : '199',
							display : 'block',
							left : ele2.position().left,
							top : ele2.position().top + 21
						});
						form.children('div.input').children('img').remove();
					}
				});
				cerca.append(invia2);
			});
		addSubmit(form);
		$('#boxOntotext').mouseover(function(){
			ontotext = true;
			ele2 = form.find('input[name=classFrom]');
			ele2.unbind('focus');
			ele2.removeAttr('readonly').focus();
		});
	}	
//	Подготовка сортированного списка классов и индивидов	
	function findOntotext(value) {
		var mashup = [];
		value = value.toLowerCase();
		for (var n = 0; n<s4.individ.length; n++) {
			s4.individ[n].index = proximity(value, s4.individ[n].name.toLowerCase())
		}
		for (var n = 0; n < s4.individ.length; n++) {
			mashup.push({
				uri : s4.individ[n].thing,
				label : s4.individ[n].name,
				index : s4.individ[n].index
			});
		};
		for (var n = 0; n < s4.concept.length; n++) {
			s4.concept[n].index = proximity(value, s4.concept[n].name.toLowerCase());
		}
		for (var n = 0; n < s4.concept.length; n++) {
			mashup.push({
				uri : s4.concept[n].thing,
				label : s4.concept[n].name,
				index : s4.concept[n].index
			});
		};
		
		return mashup.sort(comparator);
		function comparator(a, b) {
			if (a.index < b.index) return 1;
			else return -1;
		};
		// Наибольший номер символа, с которого слова из строки str отличаются от value
		function proximity(value, str) {
			var proxi_max = 0;
			var arr = str.split(' ');
			for (var n=0; n < arr.length; n++) {
				var z = proxiword(value, arr[n]);
				proxi_max = (z<proxi_max) ? proxi_max : z;
			}
			if(value.charAt(0) == str.charAt(0)) proxi_max++;
			return proxi_max;
		}
		// Номер символа, с которого слово word отличаются от value
		function proxiword(value, word) {
			var n = 0;
			for (; n<value.length; n++) {
				if(!word[n] || word[n] != value[n]) return n;
			}
			if(word.length == value.length) return 9999; else return n;
		}
	}
	var $alert = $('#alert');
	$alert.bind('mouseup', alert_hide);
	function alert_hide(){  $alert.slideUp(); }
	function browserMessage(mess) {
		$alert.html(mess);
		$alert.append($('<div>').addClass('alert_close_btn'));
		$alert.slideDown();
	}	
});



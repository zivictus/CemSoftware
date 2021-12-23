// lodLive 1.0 was developed by Diego Valerio Camarda, Silvia Mazzini and Alessandro Antonuccio
// lodLive 2.0 developed by Victor Telnov
var dict, thing;
var blank_image = 'http://vt.obninsk.ru/x/images/blank.png';
var ele_clicked, ele_hovered, last_rel, ff, isChrome;

(function($, lodLiveProfile) {
	$.jsonp.setup({
		cache : true,
		callbackParameter : 'callback',
		callback : 'lodlive',
		pageCache : true,
		timeout : 3000
	});
	var globalInfoPanelMap = {};
	var globalInnerPageMap = {};
	var context, $alert = $('#alert');
	$alert.mouseup();
	var attempts = 0;
	var max_attempts = 5;
	var openDocJSONPName = 'openDocJSONP';
	var openDocJSONPInverseName = 'openDocJSONPInverse';
	var ajaxGo = {};
	var loc, the_graph, firstUri;
	jena_app = [];
// Генератор сетевых адресов серверов	
var spot_generator = function() { return s4.url; }	
	
// Конструктор браузера RDF для работы с DBaaS	
	function OntotextBrowser(repo) {
		var openDocAjaxName = 'openDocAjax';
		var openDocInverseName = 'openDocInverse';
		var docImages = [];
		loc = location.toString();
		var pos1 = loc.indexOf("?")+1;
		var pos2 = loc.indexOf("#");
		firstUri = s4["ontology-prefix"] + loc.substr(pos1);
		var the_graph = s4.implicit = loc.substr(pos1, pos2-pos1);
		s4.onto = s4["ontology-prefix"] + the_graph + '#';
		var for_ajax = {};				// данные для асинхронного POST-запроса к DBaaS
		for_ajax.data = {};
		for_ajax.data.ontofile = the_graph;
		$.ajaxSetup({	
			type: "POST",
			headers: { 'Accept': s4.accept, 'Content-Type': s4.contentType, 'Access-Control-Allow-Origin':'*' },
			xhrFields: { withCredentials: true },
			dataType: s4.dataType,
			contentType: s4.contentType,
			cache: false,
			crossDomain: true,
			timeout : 3000
		});

		var cleaning = function() { for(var name in ajaxGo) if(!ajaxGo[name]) delete ajaxGo[name]; }
		setInterval(cleaning, 999);
		
		function close_core() {
			document.location = document.location.href.substring(0, document.location.href.indexOf("?"));
		}
		function composeQuery(resource, module, testURI) {
			var url = "";
			var res = "";
			var endpoint = "";
			$.each(lodLiveProfile.connection, function(key, value) {
				var keySplit = key.split(",");
				for (var a = 0; a < keySplit.length; a++) {
					if (( testURI ? testURI : resource).indexOf(keySplit[a]) == 0) {
						res = getSparqlConf(module, value, lodLiveProfile).replace(/\{URI\}/ig, resource.replace(/^.*~~/, ''));
						if (value.proxy) {
							url = value.proxy + '?endpoint=' + value.endpoint + "&" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + encodeURIComponent(res);
						} else {
							url = value.endpoint + "?" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + encodeURIComponent(res);
						}
						endpoint = value.endpoint;
						return false;
					}
				}
			});
			if (url == '') url = resource;
			if (endpoint && $.jStorage.get('showInfoConsole')) {
				queryConsole('log', {
					title : endpoint,
					text : res,
					id : url,
					uriId : resource
				});
			}
			return url;
		}
		function guessingEndpoint(uri, onSuccess, onFail) {
			for_ajax.data.query = 'SELECT * WHERE {?a ?b ?c} LIMIT 1';
			attempts = 0;
			thing = uri.substr(uri.indexOf('#')+1);
			guessi();
			function guessi() {
				++attempts;
				for_ajax.url = spot_generator();
				var jqXHR = $.ajax(for_ajax);			// асинхронный запрос к DBaaS
				jqXHR.done(function(response) {			// успешный ответ от DBaaS
					var json = JSON.parse(response);
					json = json['results'];
					if(json) json = json['bindings'];
					if(!json) {
						if(attempts < max_attempts) {
							setTimeout(guessi, 99);
							return;
						} else {
							onFail();
							return;
						}
					}
					var connections = lodLiveProfile.connection;
					connections[base] = { endpoint : base + "sparql" };
					lodLiveProfile.connection = connections;
					onSuccess();
					attempts = 0;
				});
				jqXHR.fail(function(obj, status) { 	// какой-то сбой
					if(attempts < max_attempts) setTimeout(guessi, 99);
					else { onFail(); }
				});
			}
		}
		function msg(msg, action, type, endpoint, inverse) {
			var msgPanel = $('#msg');
			if (action == 'init') {
				if (msgPanel.length == 0) {
					msgPanel = $('<div id="msg"></div>');
					context.append(msgPanel);
				}
			} else if (action == 'move') {
				msgPanel.hide();
				msgPanel.css({
					display : 'none'
				});
			} else if (action == 'hide') {
				msgPanel.hide();
			} else {
				msgPanel.empty();
				msg = msg.replace(/http:\/\/.+~~/g, '');
				msg = msg.replace(/nodeID:\/\/.+~~/g, '');
				msg = msg.replace(/_:\/\/.+~~/g, '');
				msg = breakLines(msg);
				msg = msg.replace(/\|/g, '<br />');
				var msgs = msg.split(" \n ");
				if (type == 'fullInfo') {
					msgPanel.append("<div class=\"corner sprite\"></div>");
					msgPanel.append("<div class=\"endpoint\">" + endpoint + "</div>");
					if (msgs.length == 2) {
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + (msgs[0].length > 200 ? msgs[0].substring(0, 200) + "..." : msgs[0]) + "</div>");
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + msgs[1] + "</div>");
					} else {
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + msgs[0] + "</div>");
					}
				} else {
					if (msgs.length == 2) {
						msgPanel.append("<div class=\"from\">" + msgs[0] + "</div>");
						if (inverse) {
							msgPanel.append("<div class=\"separ inverse sprite\"></div>");
						} else {
							msgPanel.append("<div class=\"separ sprite\"></div>");
						}
						msgPanel.append("<div class=\"from\">" + msgs[1] + "</div>");
					} else {
						msgPanel.append("<div class=\"from\">" + msgs[0] + "</div>");
					}
				}
				msgPanel.css({
					left : 0,
					top : $(window).height() - msgPanel.height(),
					position : 'fixed',
					zIndex : 9999
				});
				msgPanel.show();
			}
		}
		function queryConsole(action, toLog) {
			var id = MD5(toLog.uriId);
			var localId = MD5(toLog.id);
			var infoMap = globalInfoPanelMap;
			var panel = infoMap[id];
			if (action == 'init') {
				panel = $('<div id="q' + id + '" class="queryConsole"></div>');
				infoMap[id] = panel;
				globalInfoPanelMap = infoMap;
			} else if (action == 'log') {
				if (toLog.resource) {
//					panel.append('<h3 class="sprite"><span>' + toLog.resource + '</span><a class="sprite">&#160;</a></h3>');
					panel.append('<h3 class="sprite"><span>Service is disabled for technical reasons</span><a class="sprite">&#160;</a></h3>');
					panel.children("h3").children("a").click(function() {
						queryConsole('close', {
							uriId : toLog.uriId
						});
					}).hover(function() {
						$(this).setBackgroundPosition({x : -641});
					}, function() {
						$(this).setBackgroundPosition({x : -611});
					});
				}
				if (panel) {
					if (toLog.title) {
						var h4 = $('<h4 class="t' + localId + ' sprite"><span>' + toLog.title + '</span></h4>');
						panel.append(h4);
						h4.hover(function() {
							$(this).setBackgroundPosition({y : -700});
						}, function() {
							$(this).setBackgroundPosition({y : -650});
						});
						h4.click(function() {
							if ($(this).data('show')) {
								$(this).data('show', false);
								$(this).setBackgroundPosition({x : -680});
								$(this).removeClass('slideOpen');
								$(this).next('div').slideToggle();
							} else {
								$(this).data('show', true);
								$(this).setBackgroundPosition({x : -1290});
								panel.find('.slideOpen').click();
								$(this).addClass('slideOpen');
								$(this).next('div').slideToggle();
							}
						});
					}
					if (toLog.text) {
						var aDiv = $('<div><span><span class="contentArea">' + (toLog.text).replace(/</gi, "&lt;").replace(/>/gi, "&gt;") + '</span></span></div>');
						var aEndpoint = $.trim(panel.find('h4.t' + localId).clone().find('strong').remove().end().text());
						if (aEndpoint.indexOf("http:") == 0) {
							var aLink = $('<span class="linkArea sprite" title="' + lang('executeThisQuery') + '"></span>');
							aLink.click(function() {
								window.open(aEndpoint + '?query=' + encodeURIComponent(toLog.text));
							});
							aLink.hover(function() {
								$(this).setBackgroundPosition({x : -630});
							}, function() {
								$(this).setBackgroundPosition({x : -610});
							});
							aDiv.children('span').prepend(aLink);
						}
						aDiv.css({opacity : 0.95});
						panel.append(aDiv);
					}
					if (toLog.error) {
						panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + 'Здесь ' + lang('enpointNotAvailable') + '</strong>');
					}
					if ( typeof toLog.founded == typeof 0) {
						if (toLog.founded == 0) {
							panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + lang('propsNotFound') + '</strong>');
						} else {
							panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + toLog.founded + ' ' + lang('propsFound') + ' </strong>');
						}
					}
					infoMap[id] = panel;
					globalInfoPanelMap = infoMap;
				}
			} else if (action == 'remove') {
				delete infoMap[id];
				globalInfoPanelMap = infoMap;
			} else if (action == 'show') {
				context.append(panel);
			} else if (action == 'close') {
				panel.detach();
			}
		}
		function controlPanel(action) {
			var panel = $('#controlPanel');
			if (action == 'init') {
				panel = $('<div id="controlPanel"></div>');
				panel.css({
					left : 0,
					top : 10,
					position : 'fixed',
					zIndex : 999
				});
				panel.append('<div class="panel options sprite" ></div>');
				panel.append('<div class="panel legend sprite" ></div>');
				panel.append('<div class="panel help sprite" ></div>');
//				panel.append('<div class="panel" ></div>');
				panel.append('<div class="panel2 maps sprite" ></div>');
				panel.append('<div class="panel2 images sprite" ></div>');

				panel.children('.panel,.panel2').hover(function() {
					$(this).setBackgroundPosition({y : -450});
				}, function() {
					$(this).setBackgroundPosition({y : -400});
				});
				context.append(panel);
				panel.attr("data-top", panel.position().top);
				panel.children('.panel').click(function() {
					panel.children('.panel,.panel2').hide();
					var close = $('<div class="panel close sprite" ></div>');
					close.click(function() {
						$(this).remove();
						panel.children('#panelContent').remove();
						panel.removeClass("justX");
						panel.children('.panel,.panel2').show();
						panel.children('.inactive').hide();
					});
					close.hover(function() {
						$(this).setBackgroundPosition({y : -550});
					}, function() {
						$(this).setBackgroundPosition({y : -500});
					});
					panel.append(close);
					close.css({
						position : 'absolute',
						left : 241,
						top : 0
					});
					var panelContent = $('<div id="panelContent"></div>');
					panel.append(panelContent);
					if ($(this).hasClass("options")) {
						var anUl = $('<ul class="optionsList"></ul>');
						panelContent.append('<div></div>');
						panelContent.children('div').append('<h2>' + lang('options') + '</h2>').append(anUl);
						anUl.append('<li ' + ($.jStorage.get('doInverse') ? 'class="checked"' : 'class="check"') + ' data-value="inverse" ><span class="spriteLegenda"></span>' + lang('generateInverse') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doAutoExpand') ? 'class="checked"' : 'class="check"') + ' data-value="autoExpand" ><span class="spriteLegenda"></span>' + lang('autoExpand') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doAutoSameas') ? 'class="checked"' : 'class="check"') + ' data-value="autoSameas"><span class="spriteLegenda"></span>' + lang('autoSameAs') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doCollectImages') ? 'class="checked"' : 'class="check"') + ' data-value="autoCollectImages"><span class="spriteLegenda"></span>' + lang('autoCollectImages') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doDrawMap') ? 'class="checked"' : 'class="check"') + ' data-value="autoDrawMap"><span class="spriteLegenda"></span>' + lang('autoDrawMap') + '</li>');
						anUl.append('<li>&#160;</li>');
						anUl.append('<li class="reload"><span  class="spriteLegenda"></span>' + lang('restart') + '</li>');
						anUl.children('.reload').click(function(){
							if(window == top) window.close();
							else close_core();
						});
						anUl.children('li[data-value]').click(function() {
							if ($(this).hasClass('check')) {
								if ($(this).attr("data-value") == 'inverse') {
									$.jStorage.set('doInverse', true);
								} else if ($(this).attr("data-value") == 'autoExpand') {
									$.jStorage.set('doAutoExpand', true);
								} else if ($(this).attr("data-value") == 'autoSameas') {
									$.jStorage.set('doAutoSameas', true);
								} else if ($(this).attr("data-value") == 'autoCollectImages') {
									$.jStorage.set('doCollectImages', true);
									panel.children('div.panel2.images').removeClass('inactive');
								} else if ($(this).attr("data-value") == 'autoDrawMap') {
									$.jStorage.set('doDrawMap', true);
									panel.children('div.panel2.maps').removeClass('inactive');
								}
								$(this).attr('class', "checked");
							} else {
								if ($(this).attr("data-value") == 'inverse') {
									$.jStorage.set('doInverse', false);
								} else if ($(this).attr("data-value") == 'autoExpand') {
									$.jStorage.set('doAutoExpand', false);
								} else if ($(this).attr("data-value") == 'autoSameas') {
									$.jStorage.set('doAutoSameas', false);
								} else if ($(this).attr("data-value") == 'autoCollectImages') {
									$.jStorage.set('doCollectImages', true);
//									panel.children('div.panel2.images').addClass('inactive');
								} else if ($(this).attr("data-value") == 'autoDrawMap') {
									panel.children('div.panel2.maps').addClass('inactive');
									$.jStorage.set('doDrawMap', false);
								}
								$(this).attr('class', "check");
							}
						});
					} else if ($(this).hasClass("help")) {
						var help = $('.help').children('div').clone();
						$('a[rel=helpgroup]', help).fancybox({
							'transitionIn' : 'elastic',
							'transitionOut' : 'elastic',
							'speedIn' : 400,
							'type' : 'iframe',
							'width' : 853,
							'height' : 480,
							'speedOut' : 200,
							'hideOnContentClick' : false,
							'showCloseButton' : true,
							'overlayShow' : false
						});
						panelContent.append(help);
						if (help.height() > $(window).height() + 10) {
							panel.addClass("justX");
						}

					} else if ($(this).hasClass("legend")) {
						var legend = $('.legenda').children('div').clone();
						var counter = 0;
						legend.find("span.spriteLegenda").each(function() {
							$(this).css({
								'background-position' : '-1px -' + (counter * 20) + 'px'
							});
							counter++;
						});
						panelContent.append(legend);
						if (legend.height() > $(window).height() + 10) {
							panel.addClass("justX");
						}
					}
				});
				if (!$.jStorage.get('doCollectImages', true)) {
					panel.children('div.panel2.images').addClass('inactive').hide();
				}
				if (!$.jStorage.get('doDrawMap', true)) {
					panel.children('div.panel2.maps').addClass('inactive').hide();
				}
				panel.children('.panel2').click(function() {
					panel.children('.panel,.panel2').hide();
					var close = $('<div class="panel close2 sprite" ></div>');
					close.click(function() {
						$(this).remove();
						$('#mapPanel', panel).hide();
						$('#imagePanel', panel).hide();
						panelContent.hide();
						panel.removeClass("justX");
						panel.children('.panel,.panel2').show();
						panel.children('.inactive').hide();
					});
					close.hover(function() {
						$(this).setBackgroundPosition({
							y : -550
						});
					}, function() {
						$(this).setBackgroundPosition({
							y : -500
						});
					});
					panel.append(close);
					var panelContent = $('#panel2Content', panel);
					if (panelContent.length == 0) {
						panelContent = $('<div id="panel2Content"></div>');
						panel.append(panelContent);
					} else {
						panelContent.show();
					}
					if ($(this).hasClass("maps")) {
						var mapPanel = $('#mapPanel');
						if (mapPanel.length == 0) {
							mapPanel = $('<div id="mapPanel"></div>');
							panelContent.width(800);
							panelContent.append(mapPanel);
							try{
							$('#mapPanel').gmap3({
								action : 'init',
								options : {
									zoom : 2,
									mapTypeId : google.maps.MapTypeId.HYBRID
								}
							});
							} catch(e) {};
						} else mapPanel.show();
						updateMapPanel(panel);
					} else if ($(this).hasClass("images")) {
						var imagePanel = $('#imagePanel');
						if (imagePanel.length == 0) {
							imagePanel = $('<div id="imagePanel"><span id="imgesCnt"></span></div>');
							panelContent.append(imagePanel);
						} else {
							imagePanel.show();
						}
						updateImagePanel(panel);
					}
				});
			} else if (action == 'show') {
			} else if (action == 'hide') {
			} else if (action == 'move') {
				if (panel.hasClass("justX")) {
					panel.css({
						position : 'absolute',
						left : $('body').scrollLeft(),
						top : panel.attr("data-top")
					});
				} else {
					panel.css({
						left : 0,
						top : 10,
						position : 'fixed'
					});
					if (panel.position()) {
						panel.attr("data-top", panel.position().top);
					}
				}
			}
		}
		function updateMapPanel(panel) {
			if ($.jStorage.get('doDrawMap', true)) {
				if ($("#mapPanel:visible", panel).length > 0) {
					try {
					$('#mapPanel').gmap3({action : 'clear'});
					var panelContent = $('#panel2Content', panel);
					panelContent.width(800);
					var close = $('.close2', panel);
//					Позиционирования карты GMap на Обнинск и проставление метки				
						var map = $("#mapPanel").gmap3('get');
						map.setZoom(8);		
						map.setCenter(new google.maps.LatLng(55.0968100,36.6100600));	
						$('#mapPanel').gmap3({
							action : 'addMarker',
							latLng : [55.0968100, 36.6100600],
							title : 'Обнинский Институт Атомной Энергетики НИЯУ МИФИ',
						});					
					} catch(e){};
					close.css({
						position : 'absolute',
						left : panelContent.width() + 1,
						top : 0
					});
				} else highlight(panel.children('.maps'), 2, 200, '-565px -450px');
			}
		}
		function updateImagePanel(panel) {
			if ($.jStorage.get('doCollectImages', true)) {
				var imagePanel = $('#imagePanel', panel).children("span");
				if ($("#imagePanel:visible", panel).length > 0) {
					var panelContent = $('#panel2Content', panel);
					var close = $('.close2', panel);
					var imageMap = $.jStorage.get('imagesMap');
					var mapSize = 0;
					for (var prop in imageMap) {
						if (imageMap.hasOwnProperty(prop)) {
							mapSize++;
						}
					}
					if (mapSize > 0) {
						imagePanel.children('.amsg').remove();
						$('a',imagePanel).remove();
						var counter = 0;
						for (var prop in imageMap) {
							if (imageMap.hasOwnProperty(prop)) {
								for (var a = 0; a < imageMap[prop].length; a++) {
									for (var key in imageMap[prop][a]) {
											var img = $('<a href="' + unescape(key) + '" style="margin:0;margin-right:15px;margin-bottom:15px;" class="sprite relatedImage img-' + prop + '-' + counter + '"><img rel="' + unescape(imageMap[prop][a][key]) + '" src="' + unescape(key) + '"/></a>"');
											img.attr("data-prop", prop);
											imagePanel.append(img);
											img.fancybox({
												'transitionIn' : 'elastic',
												'transitionOut' : 'elastic',
												'speedIn' : 400,
												'type' : 'image',
												'speedOut' : 200,
												'hideOnContentClick' : true,
												'showCloseButton' : false,
												'overlayShow' : false
											});
											img.children('img').error(function() {
												$(this).parent().remove();
												counter--;
												if (counter < 3) {
													panelContent.width(148);
												} else {
													var tot = (counter / 3 + (counter % 3 > 0 ? 1 : 0) + '').split('.')[0];
													if (tot > 7) {
														tot = 7;
													}
													panelContent.width(20 + (tot) * 128);
												}
												close.css({
													position : 'absolute',
													left : panelContent.width() + 1,
													top : 0
												});
												var noImage = $.jStorage.get('noImagesMap', {});
												noImage[prop + counter] = true;
												$.jStorage.set('noImagesMap', noImage);
												close.css({
													position : 'absolute',
													left : panelContent.width() + 1,
													top : 0
												});
											});
											img.children('img').load(function() {
												var titolo = $(this).attr('rel');
												if ($(this).width() < $(this).height()) {
													$(this).height($(this).height() * 113 / $(this).width());
													$(this).width(113);
												} else {
													$(this).css({
														width : $(this).width() * 113 / $(this).height(),
														height : 113,
														marginLeft : -(($(this).width() * 113 / $(this).height() - 113) / 2)
													});
												}
												var controls = $('<span class="imgControls"><span class="imgControlCenter" title="' + lang('showResource') + '"></span><span class="imgControlZoom" title="' + lang('zoomIn') + '"></span><span class="imgTitle">' + titolo + '</span></span>');
												$(this).parent().append(controls);
												$(this).parent().hover(function() {
													$(this).children('img').hide();
												}, function() {
													$(this).children('img').show();
												});
												controls.children('.imgControlZoom').hover(function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1955
													});
												}, function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1825
													});
												});
												controls.children('.imgControlCenter').hover(function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -2085
													});
												}, function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1825
													});
												});
												controls.children('.imgControlCenter').click(function() {
													$('.close2', panel).click();
													highlight($('#' + $(this).parent().parent().attr("data-prop")).children('.box'), 8, 100, '0 0');
													// -390px
													return false;
												});
												if (counter < 3) {
													panelContent.width(148);
												} else {
													var tot = (counter / 3 + (counter % 3 > 0 ? 1 : 0) + '').split('.')[0];
													if (tot > 7) {
														tot = 7;
													}
													panelContent.width(20 + (tot) * 128);
													close.css({
														position : 'absolute',
														left : panelContent.width() + 1,
														top : 0
													});
												}
											});
										counter++;
									}
								}
							}
						}
					} else {
						panelContent.width(148);
						if (imagePanel.children('.amsg').length == 0) {
							imagePanel.append('<span class="amsg">' + lang('imagesNotFound') + '</span>');
						}
					}
					close.css({
						position : 'absolute',
						left : panelContent.width() + 1,
						top : 0
					});
				} else {
					highlight(panel.children('.images'), 2, 200, '-610px -450px');
				}
			}
		}
		function highlight(object, times, speed, backmove) {
			if (times > 0) {
				times--;
				var css = object.css('background-position');
				object.doTimeout(speed, function() {
					object.css({
						'background-position' : backmove
					});
					object.doTimeout(speed, function() {
						object.css({
							'background-position' : css
						});
						highlight(object, times, speed, backmove);
					});
				});
			}
		}
		function renewDrag(aDivList) {
			aDivList.each(function() {
				if ($(this).attr("class").indexOf('ui-draggable') == -1) {
					$(this).draggable({
						stack : '.boxWrapper',
						containment : "parent",
						start : function() {
							$(".toolBox").remove();
							$('#line-' + $(this).attr("id")).clearCanvas();
							var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + $(this).attr("id"));
							if (generatedRev) {
								for (var a = 0; a < generatedRev.length; a++) {
									generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
									$('#line-' + generatedRev[a]).clearCanvas();
								}
							}
						},
						drag : function(event, ui) {
						},
						stop : function(event, ui) {
							drawAllLines($(this));
						}
					});
				}
			});
		}
		function centerBox(aBox) {
			var top = ($(context).height() - 65) / 2 + ($(context).scrollTop() || 0);
			var left = ($(context).width() - 65) / 2 + ($(context).scrollLeft() || 0);
			var props = {
				position : 'absolute',
				left : left,
				top : top
			};
			window.scrollBy(-context.width(), -context.height());
			window.scrollBy($(context).width() / 2 - $(window).width() / 2 + 25, $(context).height() / 2 - $(window).height() / 2 + 65);
			try {
				aBox.animate(props, 1000);
			} catch (e) {aBox.css(props);}
		}
		function autoExpand(obj) {
			$.each(globalInnerPageMap, function(key, element) {
				if (element.children(".relatedBox:not([class*=exploded])").length > 0) {
					if (element.parent().length == 0) {
						context.append(element);
					}
					element.children(".relatedBox:not([class*=exploded])").each(function() {
						var aId = $(this).attr("relmd5");
						var newObj = context.children('#' + aId);
						if (newObj.length > 0) {
							$(this).click();
						}
					});
					context.children('.innerPage').detach();
				}
			});
			context.find(".relatedBox:not([class*=exploded])").each(function() {
				var aId = $(this).attr("relmd5");
				var newObj = context.children('#' + aId);
				if (newObj.length > 0) {
					$(this).click();
				}
			});
		}
		function addNewDoc(obj, ele, callback, manual_click) {
			var x  = $(obj).attr("rel");
			var z  = $(ele).attr("rel");
			var x_onto = x.indexOf(s4.DBaaS);
			var z_onto = z.indexOf(s4.DBaaS);
//			if(manual_click || x_onto < 0 || (x_onto > -1 && z_onto > -1)){
			if(true){
				var aId = ele.attr("relmd5");
				var newObj = context.find('#' + aId);
				var isInverse = ele.attr("class").indexOf("inverse") > -1;
				var exist = true;
				if (newObj.length == 0) {
					newObj = $($.jStorage.get('boxTemplate'));
					exist = false;
				}
				var originalCircus = $("#" + ele.attr("data-circleId"));
				if (!isInverse) {
					var connected = $.jStorage.get('storeIds-generatedBy-' + originalCircus.attr("id"));
					if (!connected) {
						connected = [aId];
					} else {
						if ($.inArray(aId, connected) < 0) {
							connected.push(aId);
						} else {
							return;
						}
					}					
					$.jStorage.set('storeIds-generatedBy-' + originalCircus.attr("id"), connected);
					connected = $.jStorage.get('storeIds-generatedByRev-' + aId);
					if (!connected) {
						connected = [originalCircus.attr("id")];
					} else {
						if ($.inArray(originalCircus.attr("id"), connected) == -1) {
							connected.push(originalCircus.attr("id"));
						}
					}
					$.jStorage.set('storeIds-generatedByRev-' + aId, connected);
				}
				var propertyName = ele.attr("data-property");
				newObj.attr("id", aId);
				newObj.attr("rel", ele.attr("rel"));
				var fromInverse = isInverse ? 'div[data-property="' + ele.attr("data-property") + '"][rel="' + obj.attr("rel") + '"]' : null;
				$(ele).hide();
				if (!exist) {
					var pos = parseInt(ele.attr("data-circlePos"), 10);
					var parts = parseInt(ele.attr("data-circleParts"), 10);
					var chordsListExpand = circleChords(parts > 10 ? (pos % 2 > 0 ? originalCircus.width() * 3 : originalCircus.width() * 2) : originalCircus.width() * 5 / 2, parts, originalCircus.position().left + obj.width() / 2, originalCircus.position().top + originalCircus.height() / 2, null, pos);
					context.append(newObj);
					newObj.css({
						"left" : (chordsListExpand[0][0] - newObj.height() / 2),
						"top" : (chordsListExpand[0][1] - newObj.width() / 2),
						"opacity" : 1,
						"zIndex" : 99
					});
					renewDrag(context.children('.boxWrapper'));
					if (!isInverse) {
						if ($.jStorage.get('doInverse')) {
							openDoc(z, newObj, fromInverse);
						} else {
							openDoc(z, newObj);
						}
						drawaLine(obj, newObj, propertyName);
					} else {
						openDoc(z, newObj, fromInverse);
					}
				} else {
					if (!isInverse) {
						renewDrag(context.children('.boxWrapper'));
						drawaLine(obj, newObj, propertyName);
					} 
				};
				$(ele).addClass("exploded");
			} else { $(ele).removeClass('exploded'); }; 
			if (callback) callback();
			return false;
		}
		function removeDoc(obj) {
			$(".toolBox").remove();
			var id = obj.attr("id");
			queryConsole('remove', {
				uriId : obj.attr('rel')
			});
			$("#line-" + id).clearCanvas();
			var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
			if (generatedRev) {
				for (var a = 0; a < generatedRev.length; a++) {
					$('#line-' + generatedRev[a]).clearCanvas();
				}
			}
			docInfo('', 'close');
			if ($.jStorage.get('doCollectImages', true)) {
				var imagesMap = $.jStorage.get("imagesMap", {});
				if (imagesMap[id]) {
					delete imagesMap[id];
					$.jStorage.set('imagesMap', imagesMap);
					updateImagePanel($('#controlPanel'));
					$('#controlPanel').find('a[class*=img-' + id + ']').remove();
				}
			}
			if ($.jStorage.get('doDrawMap', true)) {
				var mapsMap = $.jStorage.get("mapsMap", {});
				if (mapsMap[id]) {
					delete mapsMap[id];
					$.jStorage.set('mapsMap', mapsMap);
					updateMapPanel($('#controlPanel'));
				}
			}
			obj.fadeOut('normal', null, function() {
				obj.remove();
				$.each(globalInnerPageMap, function(key, element) {
					if (element.children("." + id).length > 0) {
						$('#' + key).append(element);
					}
				});
				$("." + id).each(function() {
					$(this).show();
					$(this).removeClass("exploded");
				});
				$.each(globalInnerPageMap, function(key, element) {
					if (element.children("." + id).length > 0) {
						var lastClick = $('#' + key).find('.lastClick').attr("rel");
						if ($('#' + key).children('.innerPage').children('.' + lastClick).length == 0) {
							$('#' + key).children('.innerPage').detach();
						}
					}
				});
				var generated = $.jStorage.get('storeIds-generatedBy-' + id);
				var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
				if (generatedRev) {
					for (var int = 0; int < generatedRev.length; int++) {
						var generatedBy = $.jStorage.get('storeIds-generatedBy-' + generatedRev[int]);
						if (generatedBy) {
							for (var int2 = 0; int2 < generatedBy.length; int2++) {
								if (generatedBy[int2] == id) {
									generatedBy.splice(int2, 1);
								}
							}
						}
						$.jStorage.set('storeIds-generatedBy-' + generatedRev[int], generatedBy);
					}
				}
				if (generated) {
					for (var int = 0; int < generated.length; int++) {
						var generatedBy = $.jStorage.get('storeIds-generatedByRev-' + generated[int]);
						if (generatedBy) {
							for (var int2 = 0; int2 < generatedBy.length; int2++) {
								if (generatedBy[int2] == id) {
									generatedBy.splice(int2, 1);
								}
							}
						}
						$.jStorage.set('storeIds-generatedByRev-' + generated[int], generatedBy);
					}
				}
				generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
				if (generatedRev) {
					for (var a = 0; a < generatedRev.length; a++) {
						generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
						if (generated) {
							for (var a2 = 0; a2 < generated.length; a2++) {
								drawaLine($('#' + generatedRev[a]), $("#" + generated[a2]));
							}
						}
					}
				}
				$.jStorage.set('storeIds-generatedByRev-' + id, []);
				$.jStorage.set('storeIds-generatedBy-' + id, []);
			});
		}
		function elHover(el) {
			var label = el.attr('data-title');
			var arr1 = label.split('\n');
			var arr2 = arr1[0].split('|');
			var arr = [];
			for(var n=0; n<arr2.length; n++){arr.push(arr2[n]);}
			arr.push(arr1[1]);
			for(var n=0; n<arr.length; n++){
				var z = arr[n];
				z = $.trim(z); 
				arr[n] = z.substr(z.indexOf('#')+1);
			}
			var new_label = '';
//			if(s4.lang == 'ru') {
//			if(true) {
				for(var n=0; n<arr.length; n++) {
					var z = arr[n];
					var not_found = true;
					if(s4.rel_ru[z]) { arr[n] = s4.rel_ru[z]; not_found = false; }
					if(not_found) {
						var x = s4.individ;
						for(var k=0; k<x.length; k++) {
							if(x[k]['thing'] == z) { arr[n] = x[k]['name']; not_found = false; break; }
						}
					}
					if(not_found) {
						var x = s4.classes;
						for(var name in x) {
							if(x[name] == z) { arr[n] = name; not_found = false; break; }
						}
					}
					var sepa = (n == arr.length-1) ? ' : ' : ', ';
					new_label += (n>0) ? sepa + arr[n] : arr[n];
				}
//			} else new_label = label;
			label = $.trim(new_label);
			arr = label.split(',');
			var max = 0;
			for(var n=0; n<arr.length; n++) {
				var z = $.trim(arr[n]);
				if(z.length > max) { label = z; max = z.length; }
			}
			el.attr("title", label);
		}
		function addClick(obj, fromInverse) {
			obj.find("div.relatedBox").each(function() {
				$(this).attr("relmd5", MD5($(this).attr("rel")));
				this.onclick = function(){
					ele_clicked = $(this).attr("relmd5");
					var option = (ele_hovered == ele_clicked);
					ele_clicked = ele_hovered = null;
					addNewDoc(obj, $(this), false, option);
					return false;
				};
					$(this).hover(function(){
						ele_hovered = $(this).attr("relmd5");
						elHover($(this));
					});
				var rel = this.getAttribute('rel');
				rel = rel.substr(rel.indexOf('#')+1);
				if(fromInverse){
					var inverse = fromInverse.substr(fromInverse.indexOf('rel=')+5);
					inverse = inverse.substr(inverse.indexOf('#')+1);
					inverse = inverse.substr(0, inverse.length-2);
					if(inverse == rel) { $(this).click(); };
				}
			});
			obj.find(".groupedRelatedBox").each(function(){
				$(this).click(function() {
					if ($(this).data('show')) {
						$(this).data('show', false);
						docInfo('', 'close');
						$(this).removeClass('lastClick');
						obj.find("." + $(this).attr("rel")).fadeOut('fast');
						$(this).fadeTo('fast', 1);
						obj.children('.innerPage').detach();
					} else {
						$(this).data('show', true);
						obj.append(globalInnerPageMap[obj.attr("id")]);
						docInfo('', 'close');
						obj.find('.lastClick').removeClass('lastClick').click();
						if (obj.children('.innerPage').length == 0) {
							obj.append(globalInnerPageMap[obj.attr("id")]);
						}
						$(this).addClass('lastClick');
						obj.find("." + $(this).attr("rel") + ":not([class*=exploded])").fadeIn('fast');
						$(this).fadeTo('fast', 0.3);
					}
				});
					$(this).hover(function(){elHover($(this));});
			});
			globalInnerPageMap[obj.attr("id")] = obj.children('.innerPage');
			obj.children('.innerPage').detach();
			obj.find(".actionBox[rel=contents]").attr('title',lang('matadata')).click(function() {
				docInfo(obj, 'open');
			});
			obj.find(".actionBox[rel=tools]").attr('title',lang('tools')).click(function() {
				if ($(".toolBox:visible").length == 0) {
					var pos = obj.position();
					var tools = $("<div class=\"toolBox sprite\" style=\"display:none\" ><div class=\"innerActionBox infoQ\" rel=\"infoQ\" title=\"" + lang('moreInfoOnThis') + "\" >&#160;</div><div class=\"innerActionBox center\" rel=\"center\" title=\"" + lang('centerClose') + "\" >&#160;</div><div class=\"innerActionBox newpage\" rel=\"newpage\" title=\"" + lang('openOnline') + "\" >&#160;</div><div class=\"innerActionBox expand\" rel=\"expand\" title=\"" + lang('openRelated') + "\" >&#160;</div><div class=\"innerActionBox remove\" rel=\"remove\" title=\"" + lang('removeResource') + "\" >&#160;</div></div>");
					context.append(tools);
					tools.css({
						top : pos.top - 23,
						left : pos.left + 10
					});
					tools.fadeIn('fast');
					tools.find(".innerActionBox[rel=expand]").each(function() {
						$(this).click(function() {
							tools.remove();
							docInfo('', 'close');
							var idx = 0;
							var elements = obj.find("div.relatedBox:visible");
							elements.doTimeout(50, function() {
								var elem = this.eq(idx++);
								if (elem.length) {
									elem.trigger('click');
									return true;
								}
							});
						});
						$(this).hover(function(){tools.setBackgroundPosition({y : -515});}, function(){tools.setBackgroundPosition({y : -395});});
					});
					tools.find(".innerActionBox[rel=infoQ]").each(function() {
						$(this).click(function() {
							tools.remove();
							queryConsole('show', {uriId : obj.attr('rel')});
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({y : -425});
						}, function() {
							tools.setBackgroundPosition({y : -395});
						});
					});
					tools.find(".innerActionBox[rel=remove]").each(function() {
						$(this).click(function() {
							removeDoc(obj);
							tools.remove();
							docInfo('', 'close');
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({y : -545});
						}, function() {
							tools.setBackgroundPosition({y : -395});
						});
					});
					tools.find(".innerActionBox[rel=newpage]").each(function() {
						$(this).click(function() {
							var uri = obj.attr('rel');
							var thing = uri.substr(uri.indexOf('#')+1);
							for_ajax.data.query = 'SELECT DISTINCT * WHERE {{<' + s4.onto + thing + '> ?property ?object.FILTER(?property = rdf:type)} UNION {<' + s4.onto + thing + '> ?property ?object.FILTER(isLiteral(?object))}}';
							attempt = 0;
							newpage();
							tools.remove();
							function newpage() {	
								++attempt;
								for_ajax.url = spot_generator();
								var jqXHR = $.ajax(for_ajax);			// асинхронный запрос к DBaaS
								jqXHR.done(function(response) {			// успешный ответ от DBaaS
									var json = JSON.parse(response);
									json = json['results'];
									if(json) json = json['bindings'];
									if(!json) newpage_fail();
									var the_link = null;
									$.each(json, function(key, value) {
										var prop = value.property.value;
										var url = value.object.value;
										if(prop.indexOf('url')>-1) the_link = unescape(url);
									});
									if(the_link) window.open(the_link);
									else window.open(s4["ontology-folder"] + s4.implicit + '.owl');
								});
								jqXHR.fail(newpage_fail);
							}
							function newpage_fail() {
								if(attempt < max_attempts) {
									setTimeout(newpage, 99);
									return;
								} else {
									window.open(s4["ontology-folder"] + s4.implicit + '.owl');
									return;
								}
							}
						});
						$(this).hover(function() {
							$(this).parent().setBackgroundPosition({y : -485});
						}, function() {
							$(this).parent().setBackgroundPosition({y : -395});
						});
					});
					tools.find(".innerActionBox[rel=center]").each(function() {
						$(this).click(function() {
							var loca = $(location).attr('href');
							if (loca.indexOf('?http') != -1) {
								document.location = loca.substring(0, loca.indexOf('?')) + '?' + obj.attr('rel');
							}
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({y : -455});
						}, function() {
							tools.setBackgroundPosition({y : -395});
						});
					});
				} else {
					$(".toolBox").fadeOut('fast', null, function() {
						$(".toolBox").remove();
					});
				};
				ele_clicked = ele_hovered = null;
			});
		}
		function docInfo(obj, action) {
			if (action == 'open') {
				var URI = obj.attr('rel');
				if ($('#docInfo[rel="info-' + URI + '"]').length > 0) { 
					$('#docInfo').remove();
					return; 
				}
				$('#docInfo').remove();
				var destBox = $('<div id="docInfo" style="opacity:0" rel="info-' + URI + '"></div>');
				$('body').append(destBox);
				$('#docInfo').fadeTo(1500,1);
				var SPARQLquery = composeQuery(URI, 'document');
				var uris = [];
				var bnodes = [];
				var values = [];
				var img_label = '';
//				Before send
				destBox.html('<img style=\"margin-left:' + (destBox.width() / 2) + 'px;margin-top:147px\" src="img/ajax-loader-gray.gif"/>');
				destBox.css({
					position : 'fixed',
					left : $(window).width() - $('#docInfo').width() - 5,
					top : 0
				});
				destBox.attr("data-top", destBox.position().top);
				thing = URI.substr(URI.indexOf('#')+1);
				for_ajax.data.query = 'SELECT DISTINCT * WHERE {{<' + s4.onto + thing + '> ?property ?object.FILTER(?property = rdf:type)} UNION {<' + s4.onto + thing + '> ?property ?object.FILTER(isLiteral(?object))}}';
				attempts = 0;
				do_docInfo();
				function do_docInfo() {	
					++attempts;
					for_ajax.url = spot_generator();
					var jqXHR = $.ajax(for_ajax);			// асинхронный запрос к DBaaS
					jqXHR.done(function(response) {			// успешный ответ от DBaaS
						var json = JSON.parse(response);
						json = json['results'];
						if(json) json = json['bindings'];
						if(!json) {
							do_docInfo_fail();
							return;
						}
						docImages = [];
						$.each(json, function(key, value){
							if (value.object.type == 'uri' || value.property.value.indexOf('keywords')>-1 || value.property.value.indexOf('image')>-1 || value.property.value.indexOf('video')>-1) {
								if(value.object['xml:lang'] == s4.lang || !value.object['xml:lang']) eval('uris.push({\'' + value.property.value + '\':\'' + escape(value.object.value) + '\'})');
								if(value.property.value.indexOf('image')>-1) eval('docImages.push({"' + escape(value.object.value) + '":"' + img_label + '"})');
							} else if (value.object.type != 'bnode'){
								if(value.object['xml:lang'] == s4.lang || !value.object['xml:lang']) {
									eval('values.push({"' + value.property.value + '":"' + escape(value.object.value) + '"})');
									if(value.property.value.indexOf('label')>-1) img_label = value.object.value;
								}
							}
						});
						var sort_values = [];
//						Пересортируем values в желаемом порядке s4.order
						for (var n = 0; n < s4.order.length; n++) {
							for (var m = 0; m < values.length; m++) {
								var name;
								for(var z in values[m]) name=z;
								if(name.indexOf(s4.order[n])>-1) { sort_values.push(values[m]); }
							}
						}
						destBox.html('');
						formatDoc(destBox, sort_values, uris, bnodes, URI);
						attempts = 0;
					});
					jqXHR.fail(do_docInfo_fail);
					function do_docInfo_fail() {
						if(attempts < max_attempts) setTimeout(do_docInfo, 99);
						else {
							attempts = 0;
							errorBox(destBox);
							values = [{'http://system/msg' : 'Ресурс не найден: ' + destBox.attr('rel')}];
							formatDoc(destBox, values, uris, bnodes, URI);
						}
					}
				}
			} else if (action == 'move') {}
				else $('#docInfo').remove();
		}
		function processDraw(x1, y1, x2, y2, canvas, toId) {
				var label = "";
				var lineStyle = "standardLine";
				if ($("#" + toId).length > 0) {
					label = canvas.attr("data-propertyName-" + toId);
					var labeArray = label.split("\|");
					label = "\n";
					for (var o = 0; o < labeArray.length; o++) {
						if (lodLiveProfile.arrows[$.trim(labeArray[o])]) {
							lineStyle = lodLiveProfile.arrows[$.trim(labeArray[o])] + "Line";
						}
						var shortKey = $.trim(labeArray[o]);
						while (shortKey.indexOf('/') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('/') + 1);
						}
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
						if (label.indexOf("\n" + shortKey + "\n") == -1) {
							label += shortKey + "\n";
						}
					}
				}
				var z = lineStyle.toLowerCase() + label.toLowerCase();
				z = (z.indexOf('sameas')>-1) || (z.indexOf('partof')>-1);
				if(!($.jStorage.get('doAutoSameas')) && z) return;
				standardLine(label, x1, y1, x2, y2, canvas, toId);
		}
		function drawAllLines(obj) {
			var generated = $.jStorage.get('storeIds-generatedBy-' + obj.attr("id"));
			var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + obj.attr("id"));
			$('#line-' + obj.attr("id")).clearCanvas();
			if (generated) {
				for (var a = 0; a < generated.length; a++) {
					drawaLine(obj, $("#" + generated[a]));
				}
			}
			if (generatedRev) {
				for (var a = 0; a < generatedRev.length; a++) {
					generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
					$('#line-' + generatedRev[a]).clearCanvas();
					if (generated) {
						for (var a2 = 0; a2 < generated.length; a2++) {
							drawaLine($('#' + generatedRev[a]), $("#" + generated[a2]));
						}
					}
				}
			}
		}
		function drawaLine(from, to, propertyName) {
			var pos1 = from.position();
			var pos2 = to.position();
			var aCanvas = $("#line-" + from.attr("id"));
			if (aCanvas.length == 1) {
				if (propertyName) {
					aCanvas.attr("data-propertyName-" + to.attr("id"), propertyName);
				}
				processDraw(pos1.left + from.width() / 2, pos1.top + from.height() / 2, pos2.left + to.width() / 2, pos2.top + to.height() / 2, aCanvas, to.attr("id"));
			} else {
				aCanvas = $("<canvas data-propertyName-" + to.attr("id") + "=\"" + propertyName + "\" height=\"" + context.height() + "\" width=\"" + context.width() + "\" id=\"line-" + from.attr("id") + "\"></canvas>");
				context.append(aCanvas);
				aCanvas.css({
					'position' : 'absolute',
					'zIndex' : '0',
					'top' : 0,
					'left' : 0
				});
				processDraw(pos1.left + from.width() / 2, pos1.top + from.height() / 2, pos2.left + to.width() / 2, pos2.top + to.height() / 2, aCanvas, to.attr("id"));
			}
		}
		function formatDoc(destBox, values, uris, bnodes, URI) {
			var docType = getJsonValue(uris, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'default');
			destBox.addClass(getProperty("document", "className", docType));
			var images = getProperty("images", "properties", docType);
			var videos = getProperty("videos", "properties", docType);
			var weblinks = getProperty("weblinks", "properties", docType);
			var keywords = getProperty("keywords", "properties", docType);
			var propertiesMapper = getProperty("document", "propertiesMapper", URI.replace(/(http:\/\/[^\/]+\/).+/, "$1"));
			if ( typeof images == typeof '') {	images = [images]; }
			if ( typeof videos == typeof '') {	videos = [videos]; }
			if ( typeof weblinks == typeof '') { weblinks = [weblinks]; }
			var result = "<div></div>";
			var jResult = $(result);
			var contents = [];
			$.each(values, function(key, value) {
				for (var akey in value) {
					eval('contents.push({\'' + akey + '\':\'' + value[akey] + '\'})');
				}
			});
			var connectedImages = [];
			var connectedVideos = [];
			var connectedWeblinks = [];
			var connectedKeywords = [];
			var types = [];
			$.each(uris, function(key, value) {
				for (var akey in value) {
					if (akey != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
						if (akey.indexOf('#image') > -1) {
							eval('connectedImages.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('#video') > -1) {
							eval('connectedVideos.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('#url') > -1) {
							eval('connectedWeblinks.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('#keywords') > -1) {
							eval('connectedKeywords.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						}
					} else {
//						if(value[akey].indexOf(s4.DBaaS)>-1) types.push(unescape(value[akey]));
						types.push(unescape(value[akey]));
					}
				}
			});
			var imagesj = null;
			if (connectedImages.length > 0) {
				imagesj = $('<div class="section"></div>');
				$.each(connectedImages, function(key, value) {
					for (var akey in value) {
						imagesj.append("<a class=\"relatedImage\"  rel=\"imagegroup\" href=\"" + unescape(value[akey]) + "\"><img src=\"" + unescape(value[akey]) + "\"/></a> ");
					}
				});
			}
			var videosj = null;
			if (connectedVideos.length > 0) {
				videosj = $('<div class="section"></div>');
				$.each(connectedVideos, function(key, value) {
					for (var akey in value) {
						var video = unescape(value[akey]).replace(s4.bad_youtube, s4.well_youtube);
						var vid = video.substr(video.indexOf('embed/')+6);   // http://www.youtube.com/embed/sgE2JhmtWLk
						thumbnail = 'http://i.ytimg.com/vi/'+vid+'/mqdefault.jpg';
						videosj.append('<a class="relatedVideo" vid="' + vid + '" rel="videogroup" href="' + video + '"><img style="border-radius:7px" src="' + thumbnail + '"/></a>');
					}
				});
			}
			var webLinkResult = null;
			if (connectedWeblinks.length > 0) {
				webLinkResult = "<div class=\"section\"><ul style=\"padding:0;margin:0;display:block;overflow:hidden;tex-overflow:ellipses\">";
				$.each(connectedWeblinks, function(key, value) {
					for (var akey in value) {
						webLinkResult += "<li><a class=\"relatedLink\" target=\"_blank\" data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" href=\"" + unescape(value[akey]) + "\">" + unescape(value[akey]) + "</a></li>";
					}
				});
				webLinkResult += "</ul></div>";
			}
			var keywordsj = null;
			if (connectedKeywords.length > 0) {
				keywordsj = $('<div class="section"></div>');
				$.each(connectedKeywords, function(key, value) {
					for (var akey in value) {
						keywordsj.append('<span>' + unescape(value[akey]) + '</span>');
					}
				});
			}
			var jContents = $('<div></div>');
			var topSection = $('<div class="topSection sprite"><span>&#160;</span></div>');
			jResult.append(topSection);
			topSection.find('span').each(function() {
				$(this).click(function() {
					docInfo('', 'close');
				});
				$(this).hover(function() {
					topSection.setBackgroundPosition({
						y : -410
					});
				}, function() {
					topSection.setBackgroundPosition({
						y : -390
					});
				});
			});
			var jSection_type = $('<div class="section"><label data-title="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">' + lang('the_type') + '</label><div></div></div>');
			if (types.length > 0) {
				jSection_type.find('label').each(function() {
					$(this).hover(function() {
						msg($(this).attr('data-title'), 'show');
					}, function() {
						msg(null, 'hide');
					});
				});
				for (var n = 0; n < types.length; n++) {
					var the_type = types[n];
					the_type = the_type.substring(the_type.indexOf('#') + 1);
					for (obj in s4.classes){
						var z = s4.classes[obj];
						z = z.substring(z.indexOf('#') + 1);
						if(z == the_type) the_type = obj;
					}
					jSection_type.children('div').append("<span title=\"" + types[n] + "\">" + the_type + " </span>");
				}
			} else jSection_type.children('div').append("<span>" + lang('the_class') + " </span>");
			jContents.append(jSection_type);
			jContents.append("<div class=\"separ sprite\"></div>");
			if (webLinkResult) {
				var jWebLinkResult = $(webLinkResult);
				jWebLinkResult.find('a').each(function() {
					$(this).hover(function() {
						msg($(this).attr('data-title'), 'show');
					}, function() {
						msg(null, 'hide');
					});
				});
				jContents.append(jWebLinkResult);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (videosj) {
				jContents.append(videosj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (imagesj) {
				jContents.append(imagesj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (propertiesMapper) {
				$.each(propertiesMapper, function(filter, label) {
					$.each(contents, function(key, value) {
						for (var akey in value) {
							if (filter == akey) {
								var shortKey = label;
									var jSection = $("<div class=\"section\"><label data-title=\"" + akey + "\">" + shortKey + "</label><div>" + unescape(value[akey]) + "</div></div><div class=\"separ sprite\"></div>");
									jSection.find('label').each(function() {
										$(this).hover(function() {
											msg($(this).attr('data-title'), 'show');
										}, function() {
											msg(null, 'hide');
										});
									});
									jContents.append(jSection);
								return true;
							}
						}
					});
				});
			} else {
//				Show all properties
				$.each(contents, function(key, value) {
					for (var akey in value) {
						var shortKey = akey;
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
						var info = unescape(value[akey]);
//						Для URL вставим ссылку в виде короткого адреса (hostname)							
						if(shortKey == 'url'){
							var a = document.createElement('a');
							a.href = info;
							['hostname'].forEach(function(k){ info = '<a class="online_link" href="' + unescape(value[akey]) + '" target="_blank">' + a[k] + '</a>';});
						}
						var z = lang('the_' + shortKey.toLowerCase());
						var x = z ? z : lang('the_property');
						var jSection = $("<div class=\"section\"><label data-title=\"" + akey + "\">" + x + "</label> <div>" + info + "</div></div><div class=\"separ sprite\"></div>");
						if(shortKey.indexOf('title')>-1) jContents.prepend(jSection);
						else jContents.append(jSection);
						jSection.find('label').each(function() {
							$(this).hover(function() {msg($(this).attr('data-title'), 'show');}, function() {msg(null, 'hide');});
						});
					}
				});
			}
			if (keywordsj) {
				jContents.append($('<div class="section"><label>' + lang('the_keywords') + '</label></div>'));
				jContents.append(keywordsj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (contents.length == 0 && bnodes.length == 0) {
				var jSection = $("<div class=\"section\"><label data-title=\"" + lang('resourceMissingDoc') + "\"></label><div>" + lang('resourceMissingDoc') + "</div></div><div class=\"separ sprite\"></div>");
				jSection.find('label').each(function() {
					$(this).hover(function() {
						msg($(this).attr('data-title'), 'show');
					}, function() {
						msg(null, 'hide');
					});
				});
				jContents.append(jSection);
			}
			destBox.append(jResult);
			destBox.append(jContents);
			$("a[rel=imagegroup]", jContents)
			.fancybox({
				'transitionIn' : 'elastic',
				'transitionOut' : 'elastic',
				'speedIn' : 400,
				'type' : 'image',
				'speedOut' : 200,
				'hideOnContentClick' : true,
				'showCloseButton' : false,
				'overlayShow' : false
			})
			.find('img').each(function() {
				$(this).load(function() {
					$(this).width(75);
					$(this).height(50);
				});
				$(this).error(function() {
					$(this).attr("title", lang('noImage') + " \n" + $(this).attr("src"));
					$(this).attr("src", "img/immagine-vuota.png");
				});
			});
			$("a[rel=videogroup]", jContents)
			.fancybox({
				'transitionIn' : 'elastic',
				'transitionOut' : 'elastic',
				'speedIn' : 400,
				'type' : 'iframe',
				'width' : 853,
				'height' : 480,
				'speedOut' : 200,
				'hideOnContentClick' : false,
				'showCloseButton' : true,
				'overlayShow' : false
			})
			.find('img').each(function() {
				$(this).load(function() { $(this).width(75); $(this).height(50); });
				$(this).error(function() {
					$(this).attr("title", lang('noImage') + " \n" + $(this).attr("src"));
					$(this).attr("src", "img/immagine-vuota.png");
				});
				var anchor = this.parentNode;
//				try {
					$.getJSON("https://www.googleapis.com/youtube/v3/videos", {
						key: "AIzaSyAmaSpCjFRLOgGeEH2bucQz0Cp3dLLe_28",
						part: "snippet",
						id: anchor.getAttribute('vid')
					}, function(data) {
						if (data.items.length === 0) return;
						var the_title = data.items[0].snippet.title;
						anchor.setAttribute('title', the_title);
					});
//				} catch(e) {};
			});
			if (jContents.height() + 40 > $(window).height()) {
				destBox.find("div.separ:last").remove();
				destBox.find("div.separLast").remove();
				jContents.slimScroll({
					height : $(window).height() - 40,
					color : '#fff'
				});
			} 
		}
		function resolveBnodes(val, URI, destBox, jContents) {
				destBox.find('span[class=bnode]').html('<img src="img/ajax-loader-black.gif"/>');
				thing = URI.substr(URI.indexOf('#')+1);
				for_ajax.data.query = 'SELECT DISTINCT * WHERE {<' + s4.onto + thing + '> ?property ?object .Filter(?property = rdfs:title || ?property = rdfs:comment)}';
				attempts = 0;
				do_bnodes();
				function do_bnodes() {
					++attempts;
					for_ajax.url = spot_generator();
					var jqXHR = $.ajax(for_ajax);			// асинхронный запрос к DBaaS
					jqXHR.done(function(response) {		// успешный ответ от DBaaS
						var json = JSON.parse(response);
						json = json['results'];
						if(json) json = json['bindings'];
						if(!json) {
							do_bnodes_fail();
							return;
						}
						destBox.find('span[class=bnode]').html('');
						$.each(json, function(key, value) {
							var shortKey = value.property.value;
							while (shortKey.indexOf('#') > -1) {shortKey = shortKey.substring(shortKey.indexOf('#') + 1);}
							if (value.object.type == 'uri') {
							} else if (value.object.type == 'bnode') {
								var jBnode = $("<span><label data-title=\"" + value.property.value + "\"> / " + shortKey + "</label><span class=\"bnode\"></span></span>");
								jBnode.find('label').each(function() {
									$(this).hover(function(){msg($(this).attr('data-title'), 'show');}, function(){msg(null, 'hide');});
								});
								destBox.find('span[class=bnode]').attr("class", "").append(jBnode);
								resolveBnodes(value.object.value, URI, destBox, jContents);
							} else {
								destBox.find('span[class=bnode]').append('<div><em title="' + value.property.value + '">' + shortKey + "</em>: " + value.object.value + '</div>');
							}
							jContents.append(destBox);
							if (jContents.height() + 40 > $(window).height()) {
								jContents.slimScroll({
									height : $(window).height() - 40,
									color : '#fff'
								});
								jContents.parent().find("div.separLast").remove();
							} else {
								jContents.parent().append("<div class=\"separLast\"></div>");
							}
						});
						attempts = 0;
					});
					jqXHR.fail(do_bnodes_fail);	
					function do_bnodes_fail() { 
						if(attempts < max_attempts) setTimeout(do_bnodes, 99);
						else {
							attempts = 0; 
							destBox.find('span').html(''); 
							errorBox(destBox); 
						}
					}
				}
			return val;
		}
		function format(destBox, values, uris, inverses) {
			var containerBox = destBox.parent('div');
			var thisUri = containerBox.attr('rel');
			var docType = getJsonValue(uris, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'default');
			if (thisUri.indexOf("~~") > -1) {docType = 'bnode';	}
			var aClass = getProperty("document", "className", docType);
			if (docType == 'bnode') {aClass = 'bnode';}
			if (aClass == null || aClass == 'standard' || aClass == '') {
				if ($.jStorage.get('classMap')[docType]) {
					aClass = $.jStorage.get('classMap')[docType];
				} else {
					var classMap = $.jStorage.get('classMap');
					aClass = "box" + $.jStorage.get('classMap').counter;
					if ($.jStorage.get('classMap').counter == 13) {
						classMap.counter = 1;
						$.jStorage.set('classMap', classMap);
					} else {
						classMap.counter = classMap.counter + 1;
						$.jStorage.set('classMap', classMap);
					}
					classMap[docType] = aClass;
					$.jStorage.set('classMap', classMap);
				}
			}
			containerBox.addClass(aClass);
			var titles = getProperty("document", "titleProperties", docType);
			var images = getProperty("images", "properties", docType);
			var videos = getProperty("videos", "properties", docType);
			var weblinks = getProperty("weblinks", "properties", docType);
			var lats = getProperty("maps", "lats", docType);
			var longs = getProperty("maps", "longs", docType);
			var points = getProperty("maps", "points", docType);
			if ( typeof titles == typeof '') { titles = [titles]; }
			if ( typeof images == typeof '') {	images = [images];	}
			if ( typeof videos == typeof '') {	videos = [videos];	}
			if ( typeof weblinks == typeof '') { weblinks = [weblinks]; }
			if ( typeof lats == typeof '') { lats = [lats]; }
			if ( typeof longs == typeof '') { longs = [longs]; }
			if ( typeof points == typeof '') { points = [points]; }
			titles.push('http://system/msg');
			var result = "<div class=\"boxTitle\"><span class=\"ellipsis_text\">";
			var maxTitles = 3;
			for (var a = 0; a < titles.length && maxTitles > 0; a++) {
				var resultArray = getJsonValue(values, titles[a], titles[a].indexOf('http') == 0 ? '' : titles[a]);
				if (titles[a].indexOf('http') != 0) {
					if (result.indexOf($.trim(unescape(titles[a])) + " \n") == -1) {
						result += $.trim(unescape(titles[a])) + " \n";
						maxTitles--;
					}
				} else {
					for (var af = 0; af < resultArray.length; af++) {
						if (result.indexOf(unescape(resultArray[af]) + " \n") == -1) {
							result += unescape(resultArray[af]) + " \n";
							maxTitles--;
						}
					}
				}
			}
			if ((values.length == 0 && uris.length == 0) || containerBox.attr("data-endpoint").indexOf("http://system/dummy") == 0) {
				if (containerBox.attr("data-endpoint").indexOf("http://system/dummy") != -1) {
					containerBox.attr("data-endpoint", lang('endpointNotConfigured'));
				}
				if (uris.length == 0 && values.length == 0) {
					result = "<div class=\"boxTitle\" threedots=\"" + lang('resourceMissing') + "\"><a target=\"_blank\" href=\"" + thisUri + "\"><span class=\"spriteLegenda\"></span>" + thisUri + "</a>";
				}
			}
			result += "</span></div>";
			var jResult = $(result);
			if (jResult.text() == '' && docType == 'bnode') {
				jResult.text('[blank node]');
			} else if (jResult.text() == '') {
				jResult.text(lang('noName')); 
				errorBox(destBox);
			}
			destBox.append(jResult);
			if (!jResult.children().html() || jResult.children().html().indexOf(">") == -1) {
				jResult.ThreeDots({
					max_rows : 3
				});
			}
			var el = jResult.find('.threedots_ellipsis');
			if (el.length > 0) {
				el.detach();
				jResult.children('span').append(el);
			}
			var resourceTitle = jResult.text();
			jResult.css({
				'marginTop' : jResult.height() == 13 ? 58 : jResult.height() == 26 ? 51 : 45,
				'height' : jResult.height() + 5
			});
			destBox.attr('title', thisUri.substr(thisUri.indexOf('#')+1));
			var connectedDocs = [];
			var invertedDocs = [];
			var propertyGroup = {};
			var propertyGroupInverted = {};
			var connectedImages = [];
			var connectedVideos = [];
			var connectedLongs = [];
			var connectedLats = [];
			var sameDocControl = [];
			$.each(uris, function(key, value) {
				for (var akey in value) {
// 					Здесь создает связанные элементы uris
					if (akey.indexOf('image') > -1) {
						eval('connectedImages.push({\'' + value[akey] + '\':\'' + escape(resourceTitle) + '\'})');
					} else if (akey.indexOf('video') > -1) {
						eval('connectedVideos.push({\'' + value[akey] + '\':\'' + escape(resourceTitle) + '\'})');
					} else if (akey.indexOf('url') == -1) {
						if ($.inArray(value[akey], sameDocControl) > -1) {
							var aCounter = 0;
							$.each(connectedDocs, function(key2, value2) {
								for (var akey2 in value2) {
									if (value2[akey2] == value[akey]) {
										eval('connectedDocs[' + aCounter + '] = {\'' + akey2 + ' | ' + akey + '\':\'' + value[akey] + '\'}');
									}
								}
								aCounter++;
							});
						} else {
							eval('connectedDocs.push({\'' + akey + '\':\'' + value[akey] + '\'})');
							sameDocControl.push(value[akey]);
						}
					}
				}
			});
			if (inverses) {
				sameDocControl = [];
				$.each(inverses, function(key, value) {
					for (var akey in value) {
						if (docType == 'bnode' && value[akey].indexOf("~~") > -1) {
							continue;
						}
						if (lodLiveProfile.uriSubstitutor) {
							$.each(lodLiveProfile.uriSubstitutor, function(skey, svalue) {
								value[akey] = value[akey].replace(escape(svalue.findStr), escape(svalue.replaceStr));
							});
						}
// 						Здесь создает связанные элементы inverses
						if ($.inArray(value[akey], sameDocControl) > -1) {
							var aCounter = 0;
							$.each(invertedDocs, function(key2, value2) {
								for (var akey2 in value2) {
									if (value2[akey2] == value[akey]) {
										var theKey = akey2;
										if (akey2 != akey) {
											theKey = akey2 + ' | ' + akey;
										}
										eval('invertedDocs[' + aCounter + '] = {\'' + theKey + '\':\'' + value[akey] + '\'}');
										return false;
									}
								}
								aCounter++;
							});
						} else {
							eval('invertedDocs.push({\'' + akey + '\':\'' + value[akey] + '\'})');
							sameDocControl.push(value[akey]);
						}
					}
				});
			}
			if ($.jStorage.get('doDrawMap', true)) {
				for (var a = 0; a < points.length; a++) {
					var resultArray = getJsonValue(values, points[a], points[a]);
					for (var af = 0; af < resultArray.length; af++) {
						if (resultArray[af].indexOf(" ") != -1) {
							eval('connectedLongs.push(\'' + unescape(resultArray[af].split(" ")[1]) + '\')');
							eval('connectedLats.push(\'' + unescape(resultArray[af].split(" ")[0]) + '\')');
						} else if (resultArray[af].indexOf("-") != -1) {
							eval('connectedLongs.push(\'' + unescape(resultArray[af].split("-")[1]) + '\')');
							eval('connectedLats.push(\'' + unescape(resultArray[af].split("-")[0]) + '\')');
						}
					}
				}
				for (var a = 0; a < longs.length; a++) {
					var resultArray = getJsonValue(values, longs[a], longs[a]);
					for (var af = 0; af < resultArray.length; af++) {
						eval('connectedLongs.push(\'' + unescape(resultArray[af]) + '\')');
					}
				}
				for (var a = 0; a < lats.length; a++) {
					var resultArray = getJsonValue(values, lats[a], lats[a]);
					for (var af = 0; af < resultArray.length; af++) {
						eval('connectedLats.push(\'' + unescape(resultArray[af]) + '\')');
					}
				}
				if (connectedLongs.length > 0 && connectedLats.length > 0) {
					var mapsMap = $.jStorage.get("mapsMap", {});
					mapsMap[containerBox.attr("id")] = {
						longs : connectedLongs[0],
						lats : connectedLats[0],
						title : thisUri + "\n" + escape(resourceTitle)
					};
					$.jStorage.set('mapsMap', mapsMap);
					updateMapPanel($('#controlPanel'));
				}
			}
			if ($.jStorage.get('doCollectImages', true)) {
				if (docImages.length > 0) {
					var imagesMap = $.jStorage.get("imagesMap", {});
					imagesMap[containerBox.attr("id")] = docImages;
					docImages = [];
					$.jStorage.set('imagesMap', imagesMap);
					updateImagePanel($('#controlPanel'));
				}
			}
			var totRelated = connectedDocs.length + invertedDocs.length;
				$.each(connectedDocs, function(key, value) {
					for (var akey in value) {
						if (propertyGroup[akey]) {
							var t = propertyGroup[akey];
							t.push(value[akey]);
							propertyGroup[akey] = t;
						} else {
							propertyGroup[akey] = [value[akey]];
						}
					}
				});
				$.each(invertedDocs, function(key, value) {
					for (var akey in value) {
						if (propertyGroupInverted[akey]) {
							var t = propertyGroupInverted[akey];
							t.push(value[akey]);
							propertyGroupInverted[akey] = t;
						} else {
							propertyGroupInverted[akey] = [value[akey]];
						}
					}
				});
				totRelated = 0;
				for (var prop in propertyGroup) {
					if (propertyGroup.hasOwnProperty(prop)) {totRelated++;}
				}
				for (var prop in propertyGroupInverted) {
					if (propertyGroupInverted.hasOwnProperty(prop)) {totRelated++;}
				}
			var chordsList = circleChords(75, 24, destBox.position().left + 65, destBox.position().top + 65);
			var chordsListGrouped = circleChords(95, 36, destBox.position().left + 65, destBox.position().top + 65);
			var a = 1;
			var inserted = {};
			var counter = 0;
			var innerCounter = 1;
			var objectList = [];
			var innerObjectList = [];
			$.each(connectedDocs, function(key, value) {
				if (counter == 16) {counter = 0;}
				if (a == 1) {
				} else if (a == 15) {a = 1;}
				for (var akey in value) {
					var obj = null;
					if (propertyGroup[akey] && propertyGroup[akey].length > 1) {
						if (!inserted[akey]) {
							innerCounter = 1;
							inserted[akey] = true;
							var objBox = $("<div class=\"groupedRelatedBox sprite\" rel=\"" + MD5(akey) + "\"    data-title=\"" + akey + " \n " + (propertyGroup[akey].length) + " " + lang('connectedResources') + "\" ></div>");
							var akeyArray = akey.split(" ");
							if (unescape(propertyGroup[akey][0]).indexOf('~~') > -1) {
								objBox.addClass('isBnode');
							} else {
								for (var i = 0; i < akeyArray.length; i++) {
									if (lodLiveProfile.arrows[akeyArray[i]]) {
										objBox.addClass(lodLiveProfile.arrows[akeyArray[i]]);
									}
								}
							}
							objBox.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
							objectList.push(objBox);
							a++;
							counter++;
						}
						if (innerCounter < 25) {
							obj = $("<div class=\"aGrouped relatedBox sprite " + MD5(akey) + " " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"  data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" ></div>");
							obj.attr('style', 'display:none;position:absolute;top:' + (chordsListGrouped[innerCounter][1] - 8) + 'px;left:' + (chordsListGrouped[innerCounter][0] - 8) + 'px');
							obj.attr("data-circlePos", innerCounter);
							obj.attr("data-circleParts", 36);
							obj.attr("data-circleId", containerBox.attr('id'));
						}
						innerCounter++;
					} else {
						obj = $("<div class=\"relatedBox sprite " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"   data-title=\"" + akey + ' \n ' + unescape(value[akey]) + "\" ></div>");
						obj.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
						obj.attr("data-circlePos", a);
						obj.attr("data-circleParts", 24);
						a++;
						counter++;
					}
					if (obj) {
						obj.attr("data-circleId", containerBox.attr('id'));
						obj.attr("data-property", akey);
						var akeyArray = akey.split(" ");
						if (obj.attr('rel').indexOf('~~') > -1) {
							obj.addClass('isBnode');
						} else {
							for (var i = 0; i < akeyArray.length; i++) {
								if (lodLiveProfile.arrows[akeyArray[i]]) {
									obj.addClass(lodLiveProfile.arrows[akeyArray[i]]);
								}
							}
						}
						if (obj.hasClass("aGrouped")) {
							innerObjectList.push(obj);
						} else {
							objectList.push(obj);
						}
					}
				}
			});
			inserted = {};
			$.each(invertedDocs, function(key, value) {
				if (counter == 16) counter = 0;
				if (a == 1) ;
				else if (a == 15) a = 1;
				for (var akey in value) {
					var obj = null;
					if (propertyGroupInverted[akey] && propertyGroupInverted[akey].length > 1) {
						if (!inserted[akey]) {
							innerCounter = 1;
							inserted[akey] = true;
							var objBox = $("<div class=\"groupedRelatedBox sprite inverse\" rel=\"" + MD5(akey) + "-i\"   data-title=\"" + akey + " \n " + (propertyGroupInverted[akey].length) + " " + lang('connectedResources') + "\" ></div>");
							var akeyArray = akey.split(" ");
							if (unescape(propertyGroupInverted[akey][0]).indexOf('~~') > -1) {
								objBox.addClass('isBnode');
							} else {
								for (var i = 0; i < akeyArray.length; i++) {
									if (lodLiveProfile.arrows[akeyArray[i]]) {
										objBox.addClass(lodLiveProfile.arrows[akeyArray[i]]);
									}
								}
							}
							objBox.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
							objectList.push(objBox);
							a++;
							counter++;
						}
						if (innerCounter < 25) {
							var destUri = unescape(value[akey].indexOf('~~') == 0 ? thisUri + value[akey] : value[akey]);
							obj = $("<div class=\"aGrouped relatedBox sprite inverse " + MD5(akey) + "-i " + MD5(unescape(value[akey])) + " \" rel=\"" + destUri + "\"  data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" ></div>");
							obj.attr('style', 'display:none;position:absolute;top:' + (chordsListGrouped[innerCounter][1] - 8) + 'px;left:' + (chordsListGrouped[innerCounter][0] - 8) + 'px');
							obj.attr("data-circlePos", innerCounter);
							obj.attr("data-circleParts", 36);
							obj.attr("data-circleId", containerBox.attr('id'));
						}
						innerCounter++;
					} else {
						obj = $("<div class=\"relatedBox sprite inverse " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"   data-title=\"" + akey + ' \n ' + unescape(value[akey]) + "\" ></div>");
						obj.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
						obj.attr("data-circlePos", a);
						obj.attr("data-circleParts", 24);
						a++;
						counter++;
					}
					if (obj) {
						obj.attr("data-circleId", containerBox.attr('id'));
						obj.attr("data-property", akey);
						var akeyArray = akey.split(" ");

						if (obj.attr('rel').indexOf('~~') > -1) {
							obj.addClass('isBnode');
						} else {
							for (var i = 0; i < akeyArray.length; i++) {
								if (lodLiveProfile.arrows[akeyArray[i]]) {
									obj.addClass(lodLiveProfile.arrows[akeyArray[i]]);
								}
							}
						}
						if (obj.hasClass("aGrouped")) {
							innerObjectList.push(obj);
						} else {
							objectList.push(obj);
						}
					}
				}
			});
			var page = 0;
			var totPages = objectList.length > 14 ? (objectList.length / 14 + (objectList.length % 14 > 0 ? 1 : 0)) : 1;
			for (var i = 0; i < objectList.length; i++) {
				if (i % 14 == 0) {
					page++;
					var aPage = $('<div class="page page' + page + '" style="display:none"></div>');
					if (page > 1 && totPages > 1) {
						aPage.append("<div class=\"pager pagePrev sprite\" data-page=\"page" + (page - 1) + "\" style=\"top:" + (chordsList[0][1] - 8) + "px;left:" + (chordsList[0][0] - 8) + "px\"></div>");
					}
					if (totPages > 1 && page < totPages - 1) {
						aPage.append("<div class=\"pager pageNext sprite\" data-page=\"page" + (page + 1) + "\" style=\"top:" + (chordsList[15][1] - 8) + "px;left:" + (chordsList[15][0] - 8) + "px\"></div>");
					}
					containerBox.append(aPage);
				}
				containerBox.children('.page' + page).append(objectList[i]);
			}
			page = 0;
			totPages = innerObjectList.length / 24 + (innerObjectList.length % 24 > 0 ? 1 : 0);
			if (innerObjectList.length > 0) {
				containerBox.append('<div class="innerPage"></div>');
				for (var i = 0; i < innerObjectList.length; i++) {
					containerBox.children('.innerPage').append(innerObjectList[i]);
				}
			}
			containerBox.children('.page1').fadeIn('fast');
			containerBox.children('.page').children('.pager').click(function() {
				var pager = $(this);
				containerBox.find('.lastClick').removeClass('lastClick').click();
				pager.parent().fadeOut('fast', null, function() {
					$(this).parent().children('.' + pager.attr("data-page")).fadeIn('fast');
				});
			}); {
				var obj = $("<div class=\"actionBox contents\" rel=\"contents\"  >&#160;</div>");
				containerBox.append(obj);
				obj.hover(function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : -260
					});
				}, function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : 0
					});
				});
				obj = $("<div class=\"actionBox tools\" rel=\"tools\" >&#160;</div>");
				containerBox.append(obj);
				obj.hover(function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : -130
					});
				}, function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : 0
					});
				});
			}
		}
		function circleChords(radius, steps, centerX, centerY, breakAt, onlyElement) {
			var values = [];
			var i = 0;
			if (onlyElement) {
				i = onlyElement;
				var radian = (2 * Math.PI) * (i / steps);
				values.push([centerX + radius * Math.cos(radian), centerY + radius * Math.sin(radian)]);
			} else {
				for (; i < steps; i++) {
					var radian = (2 * Math.PI) * (i / steps);
					values.push([centerX + radius * Math.cos(radian), centerY + radius * Math.sin(radian)]);
				}
			}
			return values;
		}
		function getJsonValue(map, key, defaultValue) {
			var returnVal = [];
			$.each(map, function(skey, value) {
				for (var akey in value) {if (akey == key) {returnVal.push(unescape(value[akey]));}}
			});
			if (returnVal == []) {returnVal = [defaultValue];}
			return returnVal;
		}
		function getProperty(area, prop, context) {
			if ( typeof context == typeof '') {
				if (lodLiveProfile[context] && lodLiveProfile[context][area]) {
					if (prop) {return lodLiveProfile[context][area][prop] ? lodLiveProfile[context][area][prop] : lodLiveProfile['default'][area][prop];} 
					else {return lodLiveProfile[context][area] ? lodLiveProfile[context][area] : lodLiveProfile['default'][area];}
				}
			} else {
				for (var a = 0; a < context.length; a++) {
					if (lodLiveProfile[context[a]] && lodLiveProfile[context[a]][area]) {
						if (prop) {return lodLiveProfile[context[a]][area][prop] ? lodLiveProfile[context[a]][area][prop] : lodLiveProfile['default'][area][prop];} 
						else {return lodLiveProfile[context[a]][area] ? lodLiveProfile[context[a]][area] : lodLiveProfile['default'][area];}
					}
				}
			}
			if (lodLiveProfile['default'][area]) {
				if (prop) {return lodLiveProfile['default'][area][prop];} 
				else {return lodLiveProfile['default'][area];}
			} else {return '';}
		}
		function parseRawResource(destBox, resource, fromInverse) {
			var values = [];
			var uris = [];
			if (lodLiveProfile['default']) {
				var res = getSparqlConf('documentUri', lodLiveProfile['default'], lodLiveProfile).replace(/\{URI\}/ig, resource);
				var url = lodLiveProfile['default'].endpoint + "?uri=" + encodeURIComponent(resource) + "&query=" + encodeURIComponent(res);
				if ($.jStorage.get('showInfoConsole')) {
					queryConsole('log', {
						title : lang('endpointNotConfiguredSoInternal'),
						text : res,
						uriId : resource
					});
				}
				$.jsonp({
					url : url,
					beforeSend : function() {
						destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
					},
					success : function(json) {
						json = json['results']['bindings'];
						var conta = 0;
						$.each(json, function(key, value) {
							conta++;
							if (value.object.type == 'uri') {
								if (value.object.value != resource) {
									eval('uris.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
								}
							} else {
								eval('values.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							}
						});
						var inverses = [];
						var callback = function() {
							destBox.children('.box').html('');
							format(destBox.children('.box'), values, uris, inverses);
							addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
							if ($.jStorage.get('doAutoExpand')) {
								autoExpand(destBox);
							}
						};
						callback();
					},
					error : function(e, j, k) {
						destBox.children('.box').html('');
						var inverses = [];
						if (fromInverse) {
							eval('uris.push({\'' + fromInverse.replace(/div\[data-property="([^"]*)"\].*/, '$1') + '\':\'' + fromInverse.replace(/.*\[rel="([^"]*)"\].*/, '$1') + '\'})');
						}
						format(destBox.children('.box'), values, uris, inverses);
						addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
						if ($.jStorage.get('doAutoExpand')) {
							autoExpand(destBox);
						}
					}
				});
			} else {
				destBox.children('.box').html('');
				var inverses = [];
				if (fromInverse) {
					eval('uris.push({\'' + fromInverse.replace(/div\[data-property="([^"]*)"\].*/, '$1') + '\':\'' + fromInverse.replace(/.*\[rel="([^"]*)"\].*/, '$1') + '\'})');
				}
				format(destBox.children('.box'), values, uris, inverses);
				addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
				if ($.jStorage.get('doAutoExpand')) {
					autoExpand(destBox);
				}
			}
		}
//	Функции-конструкторы объектов для работы Ajax при обслуживании openDoc
		function openDocAjax(name, anUri, destBox, fromInverse) {
			var self = this;			// внутренняя ссылка на объект
			this.name = name;
			this.anUri = anUri;
			this.destBox = destBox;
			this.fromInverse = fromInverse;
			this.thing = this.anUri.substr(anUri.indexOf('#')+1);
			this.attempt = 0;
			this.uris = [];
			this.values = [];
			this.inverses = [];
			this.photos = [];
			this.callback = function(){
//				if(self.values.length == 0 && self.uris.length == 0) browserMessage(lang('errorOntotext'));
				self.destBox.children('.box').html('');
				format(self.destBox.children('.box'), self.values, self.uris, self.inverses);
				addClick(self.destBox, self.fromInverse);
				if ($.jStorage.get('doAutoExpand')) {autoExpand(self.destBox);}
			};
			this.fail = function() { 
				if(self.attempt < max_attempts) setTimeout(function(){ self.go(); }, 99); 
				else {
					errorBox(self.destBox); 
					ajaxGo[self.name] = null;	// объект отработал, освободим занятую им память
				}
			};
			this.go = function() {
				self.attempt++;
				for_ajax.data.query = 'SELECT DISTINCT * WHERE {<' + self.anUri + '> ?property ?object .FILTER(isIRI(?object) || ?property=rdfs:label || ?property=<' + s4.onto + 'image> || ?property=<' + s4.onto + 'keywords> || ?property=<' + s4.onto + 'video>).FILTER(?object != owl:NamedIndividual)} ORDER BY ?property';
				for_ajax.url = spot_generator();
				var jqXHR = $.ajax(for_ajax);			// асинхронный запрос к DBaaS
				jqXHR.done(function(response) {			// успешный ответ от DBaaS
					var json = JSON.parse(response);
					json = json['results'];
					if(json) json = json['bindings'];
					if(!json) {
						self.fail();
						return;
					}
					$.each(json, function(key, value) {
						var prop = value.property.value;
						var obj = value.object.value;
						if(value.object.type == 'bnode') return true;			// однозначно пропустить bnode
						if (value.object.type == 'uri' || prop.indexOf('image')>-1 || prop.indexOf('keywords')>-1 || prop.indexOf('video')>-1) {
								if(value.object['xml:lang'] == s4.lang || !value.object['xml:lang']) eval('self.uris.push({"' + prop + '":"' + escape(obj) + '"})');
						} else {
							if(value.object['xml:lang'] == s4.lang || !value.object['xml:lang']) eval('self.values.push({"' + prop + '":"' + escape(obj) + '"})');
						}
					});
					self.destBox.children('.box').html('');		// это зачем?
					if ($.jStorage.get('doInverse')) {			// поиск обратных ролей
						destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
						var name = openDocInverseName + self.thing;
						ajaxGo[name] = new openDocInverse(name, self);
						ajaxGo[name].go();
					} else {
						format(self.destBox.children('.box'), self.values, self.uris);
						addClick(self.destBox, self.fromInverse);
						if ($.jStorage.get('doAutoExpand')) autoExpand(self.destBox);
					}
					ajaxGo[self.name] = null;	// объект отработал, освободим занятую им память
				});
				jqXHR.fail(self.fail); 
			};
		}
		function openDocInverse(name, outer) {
			var me = this;			// внутренняя ссылка на объект
			this.name = name;
			this.attempt = 0;
			this.fail = function() { 
				if(me.attempt < max_attempts) setTimeout(function(){ me.go(); }, 99); 
				else {
					outer.destBox.children('.box').html('');
					format(outer.destBox.children('.box'), outer.values, outer.uris);
					addClick(outer.destBox, outer.fromInverse);
					if ($.jStorage.get('doAutoExpand')) {autoExpand(outer.destBox);}
					ajaxGo[me.name] = null;		// объект отработал, освободим занятую им память
				}
			};
			this.attempt = 0;
			this.go = function() {
				me.attempt++;
				for_ajax.data.query = 'SELECT DISTINCT * WHERE {?object ?property <' + outer.anUri + '>} LIMIT 100';
				for_ajax.url = spot_generator();
				var jqXHR = $.ajax(for_ajax);		// асинхронный запрос к DBaaS
				jqXHR.done(function(response) {		// успешный ответ от DBaaS
					var json = JSON.parse(response);
					json = json['results'];
					if(json) json = json['bindings'];
					if(!json) {
						me.fail();
						return;
					}
					$.each(json, function(key, value) {
						var obj = value.object.value;
						var typ = value.object.type;
						var prop = value.property.value;
						if(typ == 'bnode') return true;					// однозначно пропустить bnode
						// Те sameAs inverses, которые в действительности не являются sameAs, пропускаем
//						if(prop.indexOf('sameAs')>-1){ 
//							var name = obj.substr(obj.indexOf('#')+1);
//							if(s4.individ_classes[name] != s4.individ_classes[outer.thing]) return true;
//						}
						eval('outer.inverses.push({"' + prop + '":"' + (typ == 'bnode' ? outer.anUri + '~~' : '') + escape(obj) + '"})');
					});
					outer.callback();
					ajaxGo[me.name] = null;		// объект отработал, освободим занятую им память
				}),
				jqXHR.fail(me.fail);
			}
		}
//	Конец функций-конструкторов объектов для работы Ajax при обслуживании openDoc		
		function openDoc(anUri, destBox, fromInverse) {
			if ($.jStorage.get('showInfoConsole')) {
				queryConsole('init', {uriId : anUri});
				queryConsole('log', {uriId : anUri, resource : anUri});
			}
			SPARQLquery = composeQuery(anUri, 'documentUri');
			if (SPARQLquery.indexOf("endpoint=") != -1) {
				var endpoint = SPARQLquery.substring(SPARQLquery.indexOf("endpoint=") + 9);
				endpoint = endpoint.substring(0, endpoint.indexOf("&"));
				destBox.attr("data-endpoint", endpoint);
			} else destBox.attr("data-endpoint", SPARQLquery.substring(0, SPARQLquery.indexOf("?")));
			if (SPARQLquery.indexOf("http://system/dummy") == 0) guessingEndpoint(anUri, function(){openDoc(anUri, destBox, fromInverse);}, function(){parseRawResource(destBox, anUri, fromInverse);});
			destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
			var name = openDocAjaxName + anUri.substr(anUri.indexOf('#')+1);
			ajaxGo[name] = new openDocAjax(name, anUri, destBox, fromInverse);
			ajaxGo[name].go();
		}
		function errorBox(destBox) {
			attempts = 0; 
			destBox.children('.box').addClass("errorBox");
			destBox.children('.box').html('');
			var jResult = $("<div class=\"boxTitle\"><span>" + lang('errorBox') + "</span></div>");
			destBox.children('.box').append(jResult);
			jResult.css({'marginTop' : jResult.height() == 13 ? 83 : jResult.height() == 26 ? 76 : 70});
			jResult.css({'marginLeft' : '22px'});
			var obj = $("<div class=\"actionBox tools\">&#160;</div>");
			obj.click(function() {removeDoc(destBox);});
			destBox.append(obj);
			destBox.children('.box').hover(function() {
				msg(lang('enpointNotAvailableOrSLow'), 'show', 'fullInfo', destBox.attr("data-endpoint"));
			}, function() {	msg(null, 'hide');});
		}
		function standardLine(label, x1, y1, x2, y2, canvas, toId) {
			var pen = "#ad0303";
			if(label.indexOf('type')>-1) pen = "#3333cc";
			else if(label.indexOf('subClassOf')>-1) pen = "#006666";
			else if(label.indexOf('sameAs')>-1) pen = "#999999";
			else if(label.indexOf('partOf')>-1) pen = "#996666";
			else if(label.indexOf('subProperty')>-1) pen = "#996699";
			else if(label.indexOf('domain')>-1) pen = "#bcbc04";
			else if(label.indexOf('range')>-1) pen = "#990099";
			var lineangle = (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) + 180;
			var x2bis = x1 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) + 60;
			canvas.rotateCanvas({
				rotate : lineangle,
				x : x1,
				y : y1
			}).drawLine({
				strokeStyle : pen,
				strokeWidth : 3,
				strokeCap : 'bevel',
				x1 : x1 - 60,
				y1 : y1,
				x2 : x2bis,
				y2 : y1
			});
			if (lineangle > 90 && lineangle < 270) {
				canvas.rotateCanvas({
					rotate : 180,
					x : (x2bis + x1) / 2,
					y : (y1 + y1) / 2
				});
			}
			label = $.trim(label).replace(/\n/g, ', ');
			var arr = label.split(',');
			var max = 0;
			for(var n=0; n<arr.length; n++) {
				var z = $.trim(arr[n]);
				if(z.length > max) { label = z; max = z.length; }
			}
//			if(s4.lang == 'ru') {
//			if(true) {
				if(s4.rel_ru[label]) label = s4.rel_ru[label];
//			}
/*				// Перевод всех меток на русский
				for(var n=0; n<arr.length; n++) {
					var z = $.trim(arr[n]);
					if(s4.rel_ru[z]) arr[n] = s4.rel_ru[z];
					else arr[n] = z;
					new_label += (n>0) ? ', ' + arr[n] : arr[n];
				}
*/				
			canvas.drawText({
				fillStyle : "#000000",
				strokeStyle : "#000000",
				x : (x2bis + x1 + ((x1 + 60) > x2 ? -60 : +60)) / 2,
				y : (y1 + y1 - ((x1 + 60) > x2 ? 18 : -18)) / 2,
				text : ((x1 + 60) > x2 ? " « " : "") + label + ((x1 + 60) > x2 ? "" : " » "),
				align : "center",
				strokeWidth : 0.01,
				fontSize : 12,
				fontFamily : "'Open Sans',Verdana"
			}).restoreCanvas().restoreCanvas();
			lineangle = Math.atan2(y2 - y1, x2 - x1);
			var angle = 0.79;
			var h = Math.abs(8 / Math.cos(angle));
			var fromx = x2 - 60 * Math.cos(lineangle);
			var fromy = y2 - 60 * Math.sin(lineangle);
			var angle1 = lineangle + Math.PI + angle;
			var topx = (x2 + Math.cos(angle1) * h) - 60 * Math.cos(lineangle);
			var topy = (y2 + Math.sin(angle1) * h) - 60 * Math.sin(lineangle);
			var angle2 = lineangle + Math.PI - angle;
			var botx = (x2 + Math.cos(angle2) * h) - 60 * Math.cos(lineangle);
			var boty = (y2 + Math.sin(angle2) * h) - 60 * Math.sin(lineangle);
			canvas.drawLine({
				strokeStyle : pen,
				strokeWidth : 3,
				x1 : fromx,
				y1 : fromy,
				x2 : botx,
				y2 : boty
			});
			canvas.drawLine({
				strokeStyle : pen,
				strokeWidth : 3,
				x1 : fromx,
				y1 : fromy,
				x2 : topx,
				y2 : topy
			});
		}
		this.init = function() {
			context = this;
			var storeIdsCleaner = $.jStorage.index();
			for (var int = 0; int < storeIdsCleaner.length; int++) {
				if (storeIdsCleaner[int].indexOf("storeIds-") == 0) {
					$.jStorage.deleteKey(storeIdsCleaner[int]);
				}
			}
			$.jStorage.set('imagesMap', {});
			$.jStorage.set('mapsMap', {});
			$.jStorage.set('infoPanelMap', {});
			var firstBox = $($.jStorage.get('boxTemplate'));
			centerBox(firstBox);
			context.append(firstBox);
			firstBox.attr("id", MD5(firstUri));
			firstBox.attr("rel", firstUri);
			firstBox.css({'zIndex':1});
// 			Выбор случайного цвета
			$.jStorage.set('classMap', {counter : Math.floor(Math.random() * 13) + 1});
			renewDrag(context.children('.boxWrapper'));
			thing = firstUri.substr(firstUri.indexOf('#')+1);
			openDoc(firstUri, firstBox, false);
			docInfo(firstBox, 'open');
//			start_3(firstUri, firstBox);
			controlPanel('init');
			msg('', 'init');
			$(window).bind('resize', function() {
//				docInfo('', 'close');
				$('#controlPanel').remove();
				controlPanel('init');
			});
			try{
			$(window).bind('scroll', function() {
				docInfo(null, 'move');
				controlPanel('move');
				if(top.lodlive_window_x && top.lodlive_window_y) {
					window.scrollTo(top.lodlive_window_x, top.lodlive_window_y);
					top.lodlive_window_x = top.lodlive_window_y = null;
				}
			});
			} catch(e){};
		}
	}
////////////////////////////////////////////////////////////////////////////////////////	
// Прототип браузера RDF для работы с DBpedia, Wikidata, etc.
	var methods = {
		init : function() {
			firstUri = location.search.substr(1);
			context = this;
			var storeIdsCleaner = $.jStorage.index();
			for (var int = 0; int < storeIdsCleaner.length; int++) {
				if (storeIdsCleaner[int].indexOf("storeIds-") == 0) {
					$.jStorage.deleteKey(storeIdsCleaner[int]);
				}
			}
			$.jStorage.set('imagesMap', {});
			$.jStorage.set('mapsMap', {});
			$.jStorage.set('infoPanelMap', {});
			var firstBox = $($.jStorage.get('boxTemplate'));
			methods.centerBox(firstBox);
			context.append(firstBox);
			firstBox.attr("id", MD5(firstUri));
			firstBox.attr("rel", firstUri);
			firstBox.css({'zIndex':1});
// 			Выбор случайного цвета
			$.jStorage.set('classMap', {counter : Math.floor(Math.random() * 13) + 1});
			methods.renewDrag(context.children('.boxWrapper'));
			methods.openDoc(firstUri, firstBox, false, true);
			methods.docInfo(firstBox, 'open');
			methods.controlPanel('init');
			methods.msg('', 'init');
			$(window).bind('scroll', function() {
				methods.docInfo(null, 'move');
				methods.controlPanel('move');
				if(top.lodlive_window_x && top.lodlive_window_y) {
					window.scrollTo(top.lodlive_window_x, top.lodlive_window_y);
					top.lodlive_window_x = top.lodlive_window_y = null;
				}
			});
			$(window).bind('resize', function() {
//				methods.docInfo('', 'close');
				$('#controlPanel').remove();
				methods.controlPanel('init');
			});
//			Вставка красной кнопочки для закрытия панели
			try{
			if(top.options.lodlive.frame){
				var $close_btn = $('<div/>').addClass('close_btn').attr('title', top.voice.close_search);
				context.append($close_btn); 
				$close_btn.bind('mouseup', function(){ context.lodlive('close'); });
			};
			} catch(e){};
		},
		close : function() {
			document.location = document.location.href.substring(0, document.location.href.indexOf("?"));
			top.lodlive_in_work = false;
		},
		composeQuery : function(resource, module, testURI) {
			var url = "";
			var res = "";
			var endpoint = "";
			$.each(lodLiveProfile.connection, function(key, value) {
				var keySplit = key.split(",");
				for (var a = 0; a < keySplit.length; a++) {
					if (( testURI ? testURI : resource).indexOf(keySplit[a]) == 0) {
						res = getSparqlConf(module, value, lodLiveProfile).replace(/\{URI\}/ig, resource.replace(/^.*~~/, ''));
						if (value.proxy) {
							url = value.proxy + '?endpoint=' + value.endpoint + "&" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + encodeURIComponent(res);
						} else {
							url = value.endpoint + "?" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + encodeURIComponent(res);
						}
						endpoint = value.endpoint;
						return false;
					}
				}
			});
			if (url == '') url = resource;
			if (endpoint && $.jStorage.get('showInfoConsole')) {
				methods.queryConsole('log', {
					title : endpoint,
					text : res,
					id : url,
					uriId : resource
				});
			}
			return url;
		},
		guessingEndpoint : function(uri, onSuccess, onFail) {
			var base = uri.replace(/(^http:\/\/[^\/]+\/).+/, "$1");
			var guessedEndpoint = base + "sparql?" + $.jStorage.get('endpoints')['all'] + "&query=" + encodeURIComponent("select * where {?a ?b ?c} LIMIT 1");
			$.jsonp({
				url : guessedEndpoint,
				success : function(data) {
					if (data && data.results && data.results.bindings[0]) {
						var connections = lodLiveProfile.connection;
						connections[base] = { endpoint : base + "sparql" };
						lodLiveProfile.connection = connections;
						onSuccess();
					} else {
						onFail();
					}
				},
				error : function(){ onFail(); }
			});
		},
		doStats : function(uri) {},
		msg : function(msg, action, type, endpoint, inverse) {
			var msgPanel = $('#msg');
			if (action == 'init') {
				if (msgPanel.length == 0) {
					msgPanel = $('<div id="msg"></div>');
					context.append(msgPanel);
				}
			} else if (action == 'move') {
				msgPanel.hide();
				msgPanel.css({
					display : 'none'
				});
			} else if (action == 'hide') {
				msgPanel.hide();
			} else {
				msgPanel.empty();
				msg = msg.replace(/http:\/\/.+~~/g, '');
				msg = msg.replace(/nodeID:\/\/.+~~/g, '');
				msg = msg.replace(/_:\/\/.+~~/g, '');
				msg = breakLines(msg);
				msg = msg.replace(/\|/g, '<br />');
				var msgs = msg.split(" \n ");
				if (type == 'fullInfo') {
					msgPanel.append("<div class=\"corner sprite\"></div>");
					msgPanel.append("<div class=\"endpoint\">" + endpoint + "</div>");
					if (msgs.length == 2) {
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + (msgs[0].length > 200 ? msgs[0].substring(0, 200) + "..." : msgs[0]) + "</div>");
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + msgs[1] + "</div>");
					} else {
						msgPanel.append("<div class=\"separline sprite\"></div>");
						msgPanel.append("<div class=\"from upperline\">" + msgs[0] + "</div>");
					}
				} else {
					if (msgs.length == 2) {
						msgPanel.append("<div class=\"from\">" + msgs[0] + "</div>");
						if (inverse) {
							msgPanel.append("<div class=\"separ inverse sprite\"></div>");
						} else {
							msgPanel.append("<div class=\"separ sprite\"></div>");
						}

						msgPanel.append("<div class=\"from\">" + msgs[1] + "</div>");
					} else {
						msgPanel.append("<div class=\"from\">" + msgs[0] + "</div>");
					}
				}
				msgPanel.css({
					left : 0,
					top : $(window).height() - msgPanel.height(),
					position : 'fixed',
					zIndex : 99999999
				});
				msgPanel.show();
			}
		},
		queryConsole : function(action, toLog) {
			var id = MD5(toLog.uriId);
			var localId = MD5(toLog.id);
			var infoMap = globalInfoPanelMap;
			var panel = infoMap[id];
			if (action == 'init') {
				panel = $('<div id="q' + id + '" class="queryConsole"></div>');
				infoMap[id] = panel;
				globalInfoPanelMap = infoMap;
			} else if (action == 'log') {
				if (toLog.resource) {
					panel.append('<h3 class="sprite"><span>' + toLog.resource + '</span><a class="sprite">&#160;</a></h3>');
					panel.children("h3").children("a").click(function() {
						methods.queryConsole('close', {
							uriId : toLog.uriId
						});
					}).hover(function() {
						$(this).setBackgroundPosition({
							x : -641
						});
					}, function() {
						$(this).setBackgroundPosition({
							x : -611
						});
					});

				}
				if (panel) {
					if (toLog.title) {
						var h4 = $('<h4 class="t' + localId + ' sprite"><span>' + toLog.title + '</span></h4>');
						panel.append(h4);
						h4.hover(function() {
							$(this).setBackgroundPosition({
								y : -700
							});
						}, function() {
							$(this).setBackgroundPosition({
								y : -650
							});
						});
						h4.click(function() {
							if ($(this).data('show')) {
								$(this).data('show', false);
								$(this).setBackgroundPosition({
									x : -680
								});
								$(this).removeClass('slideOpen');
								$(this).next('div').slideToggle();
							} else {
								$(this).data('show', true);
								$(this).setBackgroundPosition({
									x : -1290
								});
								panel.find('.slideOpen').click();
								$(this).addClass('slideOpen');
								$(this).next('div').slideToggle();
							}
						});
					}

					if (toLog.text) {
						var aDiv = $('<div><span><span class="contentArea">' + (toLog.text).replace(/</gi, "&lt;").replace(/>/gi, "&gt;") + '</span></span></div>');
						var aEndpoint = $.trim(panel.find('h4.t' + localId).clone().find('strong').remove().end().text());
						if (aEndpoint.indexOf("http:") == 0) {
							var aLink = $('<span class="linkArea sprite" title="' + lang('executeThisQuery') + '"></span>');
							aLink.click(function() {
								window.open(aEndpoint + '?query=' + encodeURIComponent(toLog.text));
							});
							aLink.hover(function() {
								$(this).setBackgroundPosition({
									x : -630
								});
							}, function() {
								$(this).setBackgroundPosition({
									x : -610
								});
							});
							aDiv.children('span').prepend(aLink);
						}
						aDiv.css({
							opacity : 0.95
						});
						panel.append(aDiv);
					}
					if (toLog.error) {
						panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + 'Здесь ' + lang('enpointNotAvailable') + '</strong>');
					}
					if ( typeof toLog.founded == typeof 0) {
						if (toLog.founded == 0) {
							panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + lang('propsNotFound') + '</strong>');
						} else {
							panel.find('h4.t' + localId + ' > span').append('<strong style="float:right">' + toLog.founded + ' ' + lang('propsFound') + ' </strong>');
						}

					}
					infoMap[id] = panel;
					globalInfoPanelMap = infoMap;
				}
			} else if (action == 'remove') {
				delete infoMap[id];
				globalInfoPanelMap = infoMap;
			} else if (action == 'show') {
				context.append(panel);
			} else if (action == 'close') {
				panel.detach();
			}
		},
		controlPanel : function(action) {
			var panel = $('#controlPanel');
			if (action == 'init') {
				panel = $('<div id="controlPanel"></div>');
				panel.css({
					left : 0,
					top : 10,
					position : 'fixed',
					zIndex : 999
				});
				panel.append('<div class="panel options sprite" ></div>');
				panel.append('<div class="panel legend sprite" ></div>');
				panel.append('<div class="panel help sprite" ></div>');
				panel.append('<div class="panel" ></div>');
				panel.append('<div class="panel2 maps sprite" ></div>');
				panel.append('<div class="panel2 images sprite" ></div>');

				panel.children('.panel,.panel2').hover(function() {
					$(this).setBackgroundPosition({
						y : -450
					});
				}, function() {
					$(this).setBackgroundPosition({
						y : -400
					});
				});
				context.append(panel);
				panel.attr("data-top", panel.position().top);
				panel.children('.panel').click(function() {
					panel.children('.panel,.panel2').hide();
					var close = $('<div class="panel close sprite" ></div>');
					close.click(function() {
						$(this).remove();
						panel.children('#panelContent').remove();
						panel.removeClass("justX");
						panel.children('.panel,.panel2').show();
						panel.children('.inactive').hide();
					});
					close.hover(function() {
						$(this).setBackgroundPosition({
							y : -550
						});
					}, function() {
						$(this).setBackgroundPosition({
							y : -500
						});
					});
					panel.append(close);
					close.css({
						position : 'absolute',
						left : 241,
						top : 0
					});
					var panelContent = $('<div id="panelContent"></div>');
					panel.append(panelContent);
					if ($(this).hasClass("options")) {
						var anUl = $('<ul class="optionsList"></ul>');
						panelContent.append('<div></div>');
						panelContent.children('div').append('<h2>' + lang('options') + '</h2>').append(anUl);
						anUl.append('<li ' + ($.jStorage.get('doInverse') ? 'class="checked"' : 'class="check"') + ' data-value="inverse" ><span class="spriteLegenda"></span>' + lang('generateInverse') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doAutoExpand') ? 'class="checked"' : 'class="check"') + ' data-value="autoExpand" ><span class="spriteLegenda"></span>' + lang('autoExpand') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doAutoSameas') ? 'class="checked"' : 'class="check"') + ' data-value="autoSameas"><span class="spriteLegenda"></span>' + lang('autoSameAs') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doCollectImages') ? 'class="checked"' : 'class="check"') + ' data-value="autoCollectImages"><span class="spriteLegenda"></span>' + lang('autoCollectImages') + '</li>');
						anUl.append('<li ' + ($.jStorage.get('doDrawMap') ? 'class="checked"' : 'class="check"') + ' data-value="autoDrawMap"><span class="spriteLegenda"></span>' + lang('autoDrawMap') + '</li>');
						anUl.append('<li>&#160;</li>');
						anUl.append('<li class="reload"><span  class="spriteLegenda"></span>' + lang('restart') + '</li>');
						anUl.children('.reload').click(function(){
							if(window == top) window.close();
							else context.lodlive('close');
						});
						anUl.children('li[data-value]').click(function() {
							if ($(this).hasClass('check')) {
								if ($(this).attr("data-value") == 'inverse') {
									$.jStorage.set('doInverse', true);
								} else if ($(this).attr("data-value") == 'autoExpand') {
									$.jStorage.set('doAutoExpand', true);
								} else if ($(this).attr("data-value") == 'autoSameas') {
									$.jStorage.set('doAutoSameas', true);
								} else if ($(this).attr("data-value") == 'autoCollectImages') {
									$.jStorage.set('doCollectImages', true);
									panel.children('div.panel2.images').removeClass('inactive');
								} else if ($(this).attr("data-value") == 'autoDrawMap') {
									$.jStorage.set('doDrawMap', true);
									panel.children('div.panel2.maps').removeClass('inactive');
								}
								$(this).attr('class', "checked");
							} else {
								if ($(this).attr("data-value") == 'inverse') {
									$.jStorage.set('doInverse', false);
								} else if ($(this).attr("data-value") == 'autoExpand') {
									$.jStorage.set('doAutoExpand', false);
								} else if ($(this).attr("data-value") == 'autoSameas') {
									$.jStorage.set('doAutoSameas', false);
								} else if ($(this).attr("data-value") == 'autoCollectImages') {
									$.jStorage.set('doCollectImages', false);
									panel.children('div.panel2.images').addClass('inactive');
								} else if ($(this).attr("data-value") == 'autoDrawMap') {
									panel.children('div.panel2.maps').addClass('inactive');
									$.jStorage.set('doDrawMap', false);
								}
								$(this).attr('class', "check");
							}
						});

					} else if ($(this).hasClass("help")) {
						var help = $('.help').children('div').clone();
						$('a[rel=helpgroup]', help).fancybox({
							'transitionIn' : 'elastic',
							'transitionOut' : 'elastic',
							'speedIn' : 400,
							'type' : 'iframe',
							'width' : 853,
							'height' : 480,
							'speedOut' : 200,
							'hideOnContentClick' : false,
							'showCloseButton' : true,
							'overlayShow' : false
						});
						panelContent.append(help);
						if (help.height() > $(window).height() + 10) {
							panel.addClass("justX");
						}

					} else if ($(this).hasClass("legend")) {
						var legend = $('.legenda').children('div').clone();
						var counter = 0;
						legend.find("span.spriteLegenda").each(function() {
							$(this).css({
								'background-position' : '-1px -' + (counter * 20) + 'px'
							});
							counter++;
						});
						panelContent.append(legend);
						if (legend.height() > $(window).height() + 10) {
							panel.addClass("justX");
						}
					}
				});
				if (!$.jStorage.get('doCollectImages', true)) {
					panel.children('div.panel2.images').addClass('inactive').hide();
				}
				if (!$.jStorage.get('doDrawMap', true)) {
					panel.children('div.panel2.maps').addClass('inactive').hide();
				}

				panel.children('.panel2').click(function() {
					panel.children('.panel,.panel2').hide();
					var close = $('<div class="panel close2 sprite" ></div>');
					close.click(function() {
						$(this).remove();
						$('#mapPanel', panel).hide();
						$('#imagePanel', panel).hide();
						panelContent.hide();
						panel.removeClass("justX");
						panel.children('.panel,.panel2').show();
						panel.children('.inactive').hide();
					});
					close.hover(function() {
						$(this).setBackgroundPosition({
							y : -550
						});
					}, function() {
						$(this).setBackgroundPosition({
							y : -500
						});
					});
					panel.append(close);
					var panelContent = $('#panel2Content', panel);
					if (panelContent.length == 0) {
						panelContent = $('<div id="panel2Content"></div>');
						panel.append(panelContent);
					} else {
						panelContent.show();
					}
					if ($(this).hasClass("maps")) {
						var mapPanel = $('#mapPanel');
						if (mapPanel.length == 0) {
							mapPanel = $('<div id="mapPanel"></div>');
							panelContent.width(800);
							panelContent.append(mapPanel);
							try {
							$('#mapPanel').gmap3({
								action : 'init',
								options : {
									zoom : 2,
									mapTypeId : google.maps.MapTypeId.HYBRID
								}
							});
							} catch(e) {}
						} else {
							mapPanel.show();
						}
						try { methods.updateMapPanel(panel); } catch(e){};
					} else if ($(this).hasClass("images")) {
						var imagePanel = $('#imagePanel');
						if (imagePanel.length == 0) {
							imagePanel = $('<div id="imagePanel"><span id="imgesCnt"></span></div>');
							panelContent.append(imagePanel);
						} else {
							imagePanel.show();
						}
						methods.updateImagePanel(panel);
					}
				});
			} else if (action == 'show') {
			} else if (action == 'hide') {
			} else if (action == 'move') {
				if (panel.hasClass("justX")) {
					panel.css({
						position : 'absolute',
						left : $('body').scrollLeft(),
						top : panel.attr("data-top")
					});
				} else {
					panel.css({
						left : 0,
						top : 10,
						position : 'fixed'
					});
					if (panel.position()) {
						panel.attr("data-top", panel.position().top);
					}
				}
			}
		},
		updateMapPanel : function(panel) {
			if ($.jStorage.get('doDrawMap', true)) {
				if ($("#mapPanel:visible", panel).length > 0) {
					$('#mapPanel').gmap3({
						action : 'clear'
					});
					var panelContent = $('#panel2Content', panel);
					panelContent.width(800);
					var close = $('.close2', panel);
//					Обычная работа с геолокационными данными					
					var mapsMap = $.jStorage.get('mapsMap');
					var mapSize = 0;
					for (var prop in mapsMap) {
						if (mapsMap.hasOwnProperty(prop)) {
							mapSize++;
						}
					}
					for (var prop in mapsMap) {
						if (mapsMap.hasOwnProperty(prop)) {
							$('#mapPanel').gmap3({
								action : 'addMarker',
								latLng : [mapsMap[prop].lats, mapsMap[prop].longs],
								title : unescape(mapsMap[prop].title)
							}, mapSize > 1 ? {
								action : "autofit"
							} : {});
						}
					}
					close.css({
						position : 'absolute',
						left : panelContent.width() + 1,
						top : 0
					});
				} else {
					methods.highlight(panel.children('.maps'), 2, 200, '-565px -450px');
				}
			}
		},
		updateImagePanel : function(panel) {
			if ($.jStorage.get('doCollectImages', true)) {
				var imagePanel = $('#imagePanel', panel).children("span");
				if ($("#imagePanel:visible", panel).length > 0) {
					var panelContent = $('#panel2Content', panel);
					var close = $('.close2', panel);
					var imageMap = $.jStorage.get('imagesMap');
					var mapSize = 0;
					for (var prop in imageMap) {
						if (imageMap.hasOwnProperty(prop)) {
							mapSize++;
						}
					}
					if (mapSize > 0) {
						imagePanel.children('.amsg').remove();
						$('a',imagePanel).remove();
						var counter = 0;
						for (var prop in imageMap) {
							if (imageMap.hasOwnProperty(prop)) {
								for (var a = 0; a < imageMap[prop].length; a++) {
									for (var key in imageMap[prop][a]) {
											var img = $('<a href="' + unescape(key) + '" style="margin:0;margin-right:15px;margin-bottom:15px;" class="sprite relatedImage img-' + prop + '-' + counter + '"><img rel="' + unescape(imageMap[prop][a][key]) + '" src="' + unescape(key) + '"/></a>"');
											img.attr("data-prop", prop);
											imagePanel.append(img);
											img.fancybox({
												'transitionIn' : 'elastic',
												'transitionOut' : 'elastic',
												'speedIn' : 400,
												'type' : 'image',
												'speedOut' : 200,
												'hideOnContentClick' : true,
												'showCloseButton' : false,
												'overlayShow' : false
											});
											img.children('img').error(function() {
												$(this).parent().remove();
												counter--;
												if (counter < 3) {
													panelContent.width(148);
												} else {
													var tot = (counter / 3 + (counter % 3 > 0 ? 1 : 0) + '').split('.')[0];
													if (tot > 7) {
														tot = 7;
													}
													panelContent.width(20 + (tot) * 128);
												}
												close.css({
													position : 'absolute',
													left : panelContent.width() + 1,
													top : 0
												});
												var noImage = $.jStorage.get('noImagesMap', {});
												noImage[prop + counter] = true;
												$.jStorage.set('noImagesMap', noImage);
												close.css({
													position : 'absolute',
													left : panelContent.width() + 1,
													top : 0
												});
											});
											img.children('img').load(function() {
												var titolo = $(this).attr('rel');
												if ($(this).width() < $(this).height()) {
													$(this).height($(this).height() * 113 / $(this).width());
													$(this).width(113);
												} else {
													$(this).css({
														width : $(this).width() * 113 / $(this).height(),
														height : 113,
														marginLeft : -(($(this).width() * 113 / $(this).height() - 113) / 2)
													});
												}
												var controls = $('<span class="imgControls"><span class="imgControlCenter" title="' + lang('showResource') + '"></span><span class="imgControlZoom" title="' + lang('zoomIn') + '"></span><span class="imgTitle">' + titolo + '</span></span>');
												$(this).parent().append(controls);
												$(this).parent().hover(function() {
													$(this).children('img').hide();
												}, function() {
													$(this).children('img').show();
												});
												controls.children('.imgControlZoom').hover(function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1955
													});
												}, function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1825
													});
												});
												controls.children('.imgControlCenter').hover(function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -2085
													});
												}, function() {
													$(this).parent().parent().setBackgroundPosition({
														x : -1825
													});
												});
												controls.children('.imgControlCenter').click(function() {
													$('.close2', panel).click();
													methods.highlight($('#' + $(this).parent().parent().attr("data-prop")).children('.box'), 8, 100, '0 0');
													// -390px
													return false;
												});
												if (counter < 3) {
													panelContent.width(148);
												} else {
													var tot = (counter / 3 + (counter % 3 > 0 ? 1 : 0) + '').split('.')[0];
													if (tot > 7) {
														tot = 7;
													}
													panelContent.width(20 + (tot) * 128);
													close.css({
														position : 'absolute',
														left : panelContent.width() + 1,
														top : 0
													});
												}
											});
//										}
										counter++;
									}
								}
							}
						}
					} else {
						panelContent.width(148);
						if (imagePanel.children('.amsg').length == 0) {
							imagePanel.append('<span class="amsg">' + lang('imagesNotFound') + '</span>');
						}
					}
					close.css({
						position : 'absolute',
						left : panelContent.width() + 1,
						top : 0
					});

				} else {
					methods.highlight(panel.children('.images'), 2, 200, '-610px -450px');
				}
			}
		},
		highlight : function(object, times, speed, backmove) {
			if (times > 0) {
				times--;
				var css = object.css('background-position');
				object.doTimeout(speed, function() {
					object.css({
						'background-position' : backmove
					});
					object.doTimeout(speed, function() {
						object.css({
							'background-position' : css
						});
						methods.highlight(object, times, speed, backmove);
					});
				});
			}
		},
		renewDrag : function(aDivList) {
			aDivList.each(function() {
				if ($(this).attr("class").indexOf('ui-draggable') == -1) {
					$(this).draggable({
						stack : '.boxWrapper',
						containment : "parent",
						start : function() {
							$(".toolBox").remove();
							$('#line-' + $(this).attr("id")).clearCanvas();
							var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + $(this).attr("id"));
							if (generatedRev) {
								for (var a = 0; a < generatedRev.length; a++) {
									generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
									$('#line-' + generatedRev[a]).clearCanvas();
								}
							}
						},
						drag : function(event, ui) {
						},
						stop : function(event, ui) {
							methods.drawAllLines($(this));
						}
					});
				}
			});
		},
		centerBox : function(aBox) {
			var top = ($(context).height() - 65) / 2 + ($(context).scrollTop() || 0);
			var left = ($(context).width() - 65) / 2 + ($(context).scrollLeft() || 0);
			var props = {
				position : 'absolute',
				left : left,
				top : top
			};
			window.scrollBy(-context.width(), -context.height());
			window.scrollBy($(context).width() / 2 - $(window).width() / 2 + 25, $(context).height() / 2 - $(window).height() / 2 + 65);
			try {
				aBox.animate(props, 1000);
			} catch (e) {aBox.css(props);}
		},
		autoExpand : function(obj) {
			$.each(globalInnerPageMap, function(key, element) {
				if (element.children(".relatedBox:not([class*=exploded])").length > 0) {
					if (element.parent().length == 0) {
						context.append(element);
					}
					element.children(".relatedBox:not([class*=exploded])").each(function() {
						var aId = $(this).attr("relmd5");
						var newObj = context.children('#' + aId);
						if (newObj.length > 0) {
							$(this).click();
						}
					});
					context.children('.innerPage').detach();
				}
			});
			context.find(".relatedBox:not([class*=exploded])").each(function() {
				var aId = $(this).attr("relmd5");
				var newObj = context.children('#' + aId);
				if (newObj.length > 0) {
					$(this).click();
				}
			});
		},
		addNewDoc : function(obj, ele, callback, manual_click) {
			var x  = $(obj).attr("rel");
			var z  = $(ele).attr("rel");
			var x_onto = x.indexOf(s4.DBaaS);
			var z_onto = z.indexOf(s4.DBaaS);
			if(manual_click || x_onto < 0 || (x_onto > -1 && z_onto > -1)){
				var aId = ele.attr("relmd5");
				var newObj = context.find('#' + aId);
				var isInverse = ele.attr("class").indexOf("inverse") > -1;
				var exist = true;
				if (newObj.length == 0) {
					newObj = $($.jStorage.get('boxTemplate'));
					exist = false;
				}
				var originalCircus = $("#" + ele.attr("data-circleId"));
				if (!isInverse) {
					var connected = $.jStorage.get('storeIds-generatedBy-' + originalCircus.attr("id"));
					if (!connected) {
						connected = [aId];
					} else {
						if ($.inArray(aId, connected) < 0) {
							connected.push(aId);
						} else {
							return;
						}
					}					
					$.jStorage.set('storeIds-generatedBy-' + originalCircus.attr("id"), connected);
					connected = $.jStorage.get('storeIds-generatedByRev-' + aId);
					if (!connected) {
						connected = [originalCircus.attr("id")];
					} else {
						if ($.inArray(originalCircus.attr("id"), connected) == -1) {
							connected.push(originalCircus.attr("id"));
						}
					}
					$.jStorage.set('storeIds-generatedByRev-' + aId, connected);
				}
				var propertyName = ele.attr("data-property");
				newObj.attr("id", aId);
				newObj.attr("rel", ele.attr("rel"));
				var fromInverse = isInverse ? 'div[data-property="' + ele.attr("data-property") + '"][rel="' + obj.attr("rel") + '"]' : null;
				$(ele).hide();
				if (!exist) {
					var pos = parseInt(ele.attr("data-circlePos"), 10);
					var parts = parseInt(ele.attr("data-circleParts"), 10);
					var chordsListExpand = methods.circleChords(parts > 10 ? (pos % 2 > 0 ? originalCircus.width() * 3 : originalCircus.width() * 2) : originalCircus.width() * 5 / 2, parts, originalCircus.position().left + obj.width() / 2, originalCircus.position().top + originalCircus.height() / 2, null, pos);
					context.append(newObj);
					newObj.css({
						"left" : (chordsListExpand[0][0] - newObj.height() / 2),
						"top" : (chordsListExpand[0][1] - newObj.width() / 2),
						"opacity" : 1,
						"zIndex" : 99
					});
					methods.renewDrag(context.children('.boxWrapper'));
					if (!isInverse) {
						if ($.jStorage.get('doInverse')) {
							methods.openDoc(z, newObj, fromInverse);
						} else {
							methods.openDoc(z, newObj);
						}
						methods.drawaLine(obj, newObj, propertyName);
					} else {
						methods.openDoc(z, newObj, fromInverse);
					}
				} else {
					if (!isInverse) {
						methods.renewDrag(context.children('.boxWrapper'));
						methods.drawaLine(obj, newObj, propertyName);
					} 
				};
				$(ele).addClass("exploded");
			} else { $(ele).removeClass('exploded'); }; 
			if (callback) callback();
			return false;
		},
		removeDoc : function(obj) {
			$(".toolBox").remove();
			var id = obj.attr("id");
			methods.queryConsole('remove', {
				uriId : obj.attr('rel')
			});
			$("#line-" + id).clearCanvas();
			var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
			if (generatedRev) {
				for (var a = 0; a < generatedRev.length; a++) {
					$('#line-' + generatedRev[a]).clearCanvas();
				}
			}
			methods.docInfo('', 'close');
			if ($.jStorage.get('doCollectImages', true)) {
				var imagesMap = $.jStorage.get("imagesMap", {});
				if (imagesMap[id]) {
					delete imagesMap[id];
					$.jStorage.set('imagesMap', imagesMap);
					methods.updateImagePanel($('#controlPanel'));
					$('#controlPanel').find('a[class*=img-' + id + ']').remove();
				}
			}
			if ($.jStorage.get('doDrawMap', true)) {
				var mapsMap = $.jStorage.get("mapsMap", {});
				if (mapsMap[id]) {
					delete mapsMap[id];
					$.jStorage.set('mapsMap', mapsMap);
					try { methods.updateMapPanel($('#controlPanel')); } catch(e){};
				}
			}
			obj.fadeOut('normal', null, function() {
				obj.remove();
				$.each(globalInnerPageMap, function(key, element) {
					if (element.children("." + id).length > 0) {
						$('#' + key).append(element);
					}
				});
				$("." + id).each(function() {
					$(this).show();
					$(this).removeClass("exploded");
				});
				$.each(globalInnerPageMap, function(key, element) {
					if (element.children("." + id).length > 0) {
						var lastClick = $('#' + key).find('.lastClick').attr("rel");
						if ($('#' + key).children('.innerPage').children('.' + lastClick).length == 0) {
							$('#' + key).children('.innerPage').detach();
						}
					}
				});
				var generated = $.jStorage.get('storeIds-generatedBy-' + id);
				var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
				if (generatedRev) {
					for (var int = 0; int < generatedRev.length; int++) {
						var generatedBy = $.jStorage.get('storeIds-generatedBy-' + generatedRev[int]);
						if (generatedBy) {
							for (var int2 = 0; int2 < generatedBy.length; int2++) {
								if (generatedBy[int2] == id) {
									generatedBy.splice(int2, 1);
								}
							}
						}
						$.jStorage.set('storeIds-generatedBy-' + generatedRev[int], generatedBy);
					}
				}
				if (generated) {
					for (var int = 0; int < generated.length; int++) {
						var generatedBy = $.jStorage.get('storeIds-generatedByRev-' + generated[int]);
						if (generatedBy) {
							for (var int2 = 0; int2 < generatedBy.length; int2++) {
								if (generatedBy[int2] == id) {
									generatedBy.splice(int2, 1);
								}
							}
						}
						$.jStorage.set('storeIds-generatedByRev-' + generated[int], generatedBy);
					}
				}
				generatedRev = $.jStorage.get('storeIds-generatedByRev-' + id);
				if (generatedRev) {
					for (var a = 0; a < generatedRev.length; a++) {
						generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
						if (generated) {
							for (var a2 = 0; a2 < generated.length; a2++) {
								methods.drawaLine($('#' + generatedRev[a]), $("#" + generated[a2]));
							}
						}
					}
				}
				$.jStorage.set('storeIds-generatedByRev-' + id, []);
				$.jStorage.set('storeIds-generatedBy-' + id, []);
			});
		},
		elHover : function(el) {
			var label = el.attr('data-title');
			var arr1 = label.split('\n');
			var arr2 = arr1[0].split('|');
			var arr = [];
			for(var n=0; n<arr2.length; n++){arr.push(arr2[n]);}
			arr.push(arr1[1]);
			for(var n=0; n<arr.length; n++){
				var z = arr[n];
				z = $.trim(z); 
				arr[n] = z.substr(z.indexOf('#')+1);
			}
			var new_label = '';
				for(var n=0; n<arr.length; n++) {
					var z = arr[n];
					var not_found = true;
					if(s4.rel_ru[z]) { arr[n] = s4.rel_ru[z]; not_found = false; }
					if(not_found) {
						var x = s4.individ;
						for(var k=0; k<x.length; k++) {
							if(x[k]['thing'] == z) { arr[n] = x[k]['name']; not_found = false; break; }
						}
					}
					if(not_found) {
						var x = s4.classes;
						for(var name in x) {
							if(x[name] == z) { arr[n] = name; not_found = false; break; }
						}
					}
					var sepa = (n == arr.length-1) ? ' : ' : ', ';
					new_label += (n>0) ? sepa + arr[n] : arr[n];
				}
			el.attr("title", new_label);
		},
		addClick : function(obj, fromInverse) {
			obj.find("div.relatedBox").each(function() {
				$(this).attr("relmd5", MD5($(this).attr("rel")));
				this.onclick = function(){
					ele_clicked = $(this).attr("relmd5");
					var option = (ele_hovered == ele_clicked);
					ele_clicked = ele_hovered = null;
					methods.addNewDoc(obj, $(this), false, option);
					return false;
				};
					$(this).hover(
						function(){
							ele_hovered = $(this).attr("relmd5");
							methods.msg($(this).attr('data-title'), 'show', null, null, $(this).hasClass("inverse"));
						}, 
						function(){ methods.msg(null, 'hide');}
					);	
				var rel = this.getAttribute('rel');
				if(fromInverse){
					var inverse = fromInverse.substr(fromInverse.indexOf('rel=')+5);
					inverse = inverse.substr(0, inverse.length-2);
					if(inverse == rel) { $(this).click(); };
				}
			});
			obj.find(".groupedRelatedBox").each(function(){
				$(this).click(function() {
					if ($(this).data('show')) {
						$(this).data('show', false);
						methods.docInfo('', 'close');
						$(this).removeClass('lastClick');
						obj.find("." + $(this).attr("rel")).fadeOut('fast');
						$(this).fadeTo('fast', 1);
						obj.children('.innerPage').detach();
					} else {
						$(this).data('show', true);
						obj.append(globalInnerPageMap[obj.attr("id")]);
						methods.docInfo('', 'close');
						obj.find('.lastClick').removeClass('lastClick').click();
						if (obj.children('.innerPage').length == 0) {
							obj.append(globalInnerPageMap[obj.attr("id")]);
						}
						$(this).addClass('lastClick');
						obj.find("." + $(this).attr("rel") + ":not([class*=exploded])").fadeIn('fast');
						$(this).fadeTo('fast', 0.3);
					}
				});
					$(this).hover(function() {
						methods.msg($(this).attr('data-title'), 'show', null, null, $(this).hasClass("inverse"));
					}, function() {
						methods.msg(null, 'hide');
					});
			});
			globalInnerPageMap[obj.attr("id")] = obj.children('.innerPage');
			obj.children('.innerPage').detach();
			
			obj.find(".actionBox[rel=contents]").attr('title',lang('matadata')).click(function() {
				methods.docInfo(obj, 'open');
			});
			obj.find(".actionBox[rel=tools]").attr('title',lang('tools')).click(function() {
				if ($(".toolBox:visible").length == 0) {
					var pos = obj.position();
					var tools = $("<div class=\"toolBox sprite\" style=\"display:none\" ><div class=\"innerActionBox infoQ\" rel=\"infoQ\" title=\"" + lang('moreInfoOnThis') + "\" >&#160;</div><div class=\"innerActionBox center\" rel=\"center\" title=\"" + lang('centerClose') + "\" >&#160;</div><div class=\"innerActionBox newpage\" rel=\"newpage\" title=\"" + lang('openOnline') + "\" >&#160;</div><div class=\"innerActionBox expand\" rel=\"expand\" title=\"" + lang('openRelated') + "\" >&#160;</div><div class=\"innerActionBox remove\" rel=\"remove\" title=\"" + lang('removeResource') + "\" >&#160;</div></div>");
					context.append(tools);
					tools.css({
						top : pos.top - 23,
						left : pos.left + 10
					});
					tools.fadeIn('fast');
					tools.find(".innerActionBox[rel=expand]").each(function() {
						$(this).click(function() {
							tools.remove();
							methods.docInfo('', 'close');
							var idx = 0;
							var elements = obj.find("div.relatedBox:visible");
							elements.doTimeout(50, function() {
								var elem = this.eq(idx++);
								if (elem.length) {
									elem.trigger('click');
									return true;
								}
							});
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({
								y : -515
							});
						}, function() {
							tools.setBackgroundPosition({
								y : -395
							});
						});
					});
					tools.find(".innerActionBox[rel=infoQ]").each(function() {
						$(this).click(function() {
							tools.remove();
							methods.queryConsole('show', {
								uriId : obj.attr('rel')
							});
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({y : -425});
						}, function() {
							tools.setBackgroundPosition({y : -395});
						});
					});
					tools.find(".innerActionBox[rel=remove]").each(function() {
						$(this).click(function() {
							methods.removeDoc(obj);
							tools.remove();
							methods.docInfo('', 'close');
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({
								y : -545
							});
						}, function() {
							tools.setBackgroundPosition({
								y : -395
							});
						});
					});
					tools.find(".innerActionBox[rel=newpage]").each(function() {
						$(this).click(function() {
							tools.remove();
							methods.docInfo('', 'close');
							var url = obj.attr("rel");
							window.open(url);
						});
						$(this).hover(function() {
							$(this).parent().setBackgroundPosition({
								y : -485
							});
						}, function() {
							$(this).parent().setBackgroundPosition({
								y : -395
							});
						});

					});
					tools.find(".innerActionBox[rel=center]").each(function() {
						$(this).click(function() {
							var loca = $(location).attr('href');
							if (loca.indexOf('?http') != -1) {
								document.location = loca.substring(0, loca.indexOf('?')) + '?' + obj.attr('rel');
							}
						});
						$(this).hover(function() {
							tools.setBackgroundPosition({
								y : -455
							});
						}, function() {
							tools.setBackgroundPosition({
								y : -395
							});
						});
					});
				} else {
					$(".toolBox").fadeOut('fast', null, function() {
						$(".toolBox").remove();
					});
				};
				ele_clicked = ele_hovered = null;
			});
		},
		parseRawResourceDoc : function(destBox, URI) {
			var uris = [];
			var bnodes = [];
			var values = [];
			if (lodLiveProfile['default']) {
				var res = getSparqlConf('document', lodLiveProfile['default'], lodLiveProfile).replace(/\{URI\}/ig, URI);
				var url = lodLiveProfile['default'].endpoint + "?uri=" + encodeURIComponent(URI) + "&query=" + encodeURIComponent(res);
				if ($.jStorage.get('showInfoConsole')) {
					methods.queryConsole('log', {
						title : lang('endpointNotConfiguredSoInternal'),
						text : res,
						uriId : URI
					});
				}
				$.jsonp({
					url : url,
					beforeSend : function() {
						$('body').append(destBox);
						destBox.html('<img style=\"margin-left:' + (destBox.width() / 2) + 'px;margin-top:147px\" src="img/ajax-loader-gray.gif"/>');
						destBox.css({
							position : 'fixed',
							left : $(window).width() - $('#docInfo').width() - 20,
							top : 0
						});
						destBox.attr("data-top", destBox.position().top);
					},
					success : function(json) {
						json = json['results']['bindings'];
						$.each(json, function(key, value) {
							if (value.object.type == 'uri') {
								eval('uris.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							} else if (value.object.type == 'bnode') {
								eval('bnodes.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							} else {
								eval('values.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							}
						});
						destBox.html('');
						methods.formatDoc(destBox, values, uris, bnodes, URI);
					},
					error : function(e, b, v) {
						destBox.html('');
						values = [{
							'http://system/msg' : 'Ресурс не обнаружен: ' + destBox.attr('rel')
						}];
						methods.formatDoc(destBox, values, uris, bnodes, URI);
					}
				});
			}
		},
		docInfo : function(obj, action) {
			if (action == 'open') {
				var URI = obj.attr('rel');
				if ($('#docInfo[rel="info-' + URI + '"]').length > 0) { 
					$('#docInfo').remove();
					return; 
				}
				$('#docInfo').remove();
				var destBox = $('<div id="docInfo" style="opacity:0" rel="info-' + URI + '"></div>');
				$('body').append(destBox);
				$('#docInfo').fadeTo(1500,1);
				var SPARQLquery = methods.composeQuery(URI, 'document');
				var uris = [];
				var bnodes = [];
				var values = [];
				if (SPARQLquery.indexOf("http://system/dummy") == 0) {
					methods.parseRawResourceDoc(destBox, URI);
				} else {
						$.jsonp({
						url : SPARQLquery,
						beforeSend : function() {
							destBox.html('<img style=\"margin-left:' + (destBox.width() / 2) + 'px;margin-top:147px\" src="img/ajax-loader-gray.gif"/>');
							destBox.css({
								position : 'fixed',
								left : $(window).width() - $('#docInfo').width() - 5,
								top : 0
							});
							destBox.attr("data-top", destBox.position().top);
						},
						success : function(json) {
							json = json['results']['bindings'];
							$.each(json, function(key, value) {
								if (value.object.type == 'uri') {
									eval('uris.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
								} else if (value.object.type == 'bnode') {
									eval('bnodes.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
								} else {
									eval('values.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
								}
							});
							destBox.html('');
							methods.formatDoc(destBox, values, uris, bnodes, URI);
						},
						error : function(e, b, v){
							destBox.html('');
							values = [{'http://system/msg' : 'ресурс не найден: ' + destBox.attr('rel')}];
							methods.formatDoc(destBox, values, uris, bnodes, URI);
						}
						});
				}
			} else if (action == 'move') {}
			else $('#docInfo').remove();
		},
		processDraw : function(x1, y1, x2, y2, canvas, toId) {
				var label = "";
				var lineStyle = "standardLine";
				if ($("#" + toId).length > 0) {
					label = canvas.attr("data-propertyName-" + toId);
					var labeArray = label.split("\|");
					label = "\n";
					for (var o = 0; o < labeArray.length; o++) {
						if (lodLiveProfile.arrows[$.trim(labeArray[o])]) {
							lineStyle = lodLiveProfile.arrows[$.trim(labeArray[o])] + "Line";
						}
						var shortKey = $.trim(labeArray[o]);
						while (shortKey.indexOf('/') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('/') + 1);
						}
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
						if (label.indexOf("\n" + shortKey + "\n") == -1) {
							label += shortKey + "\n";
						}
					}
				}
				if (lineStyle == 'standardLine') {
					context.lodlive(lineStyle, label, x1, y1, x2, y2, canvas, toId);
				} else {
					$().customLines(context, lineStyle, label, x1, y1, x2, y2, canvas, toId);
				}
		},
		drawAllLines : function(obj) {
			var generated = $.jStorage.get('storeIds-generatedBy-' + obj.attr("id"));
			var generatedRev = $.jStorage.get('storeIds-generatedByRev-' + obj.attr("id"));
			$('#line-' + obj.attr("id")).clearCanvas();
			if (generated) {
				for (var a = 0; a < generated.length; a++) {
					methods.drawaLine(obj, $("#" + generated[a]));
				}
			}
			if (generatedRev) {
				for (var a = 0; a < generatedRev.length; a++) {
					generated = $.jStorage.get('storeIds-generatedBy-' + generatedRev[a]);
					$('#line-' + generatedRev[a]).clearCanvas();
					if (generated) {
						for (var a2 = 0; a2 < generated.length; a2++) {
							methods.drawaLine($('#' + generatedRev[a]), $("#" + generated[a2]));
						}
					}
				}

			}
		},
		drawaLine : function(from, to, propertyName) {
			var pos1 = from.position();
			var pos2 = to.position();
			var aCanvas = $("#line-" + from.attr("id"));
			if (aCanvas.length == 1) {
				if (propertyName) {
					aCanvas.attr("data-propertyName-" + to.attr("id"), propertyName);
				}
				methods.processDraw(pos1.left + from.width() / 2, pos1.top + from.height() / 2, pos2.left + to.width() / 2, pos2.top + to.height() / 2, aCanvas, to.attr("id"));
			} else {
				aCanvas = $("<canvas data-propertyName-" + to.attr("id") + "=\"" + propertyName + "\" height=\"" + context.height() + "\" width=\"" + context.width() + "\" id=\"line-" + from.attr("id") + "\"></canvas>");
				context.append(aCanvas);
				aCanvas.css({
					'position' : 'absolute',
					'zIndex' : '0',
					'top' : 0,
					'left' : 0
				});
				methods.processDraw(pos1.left + from.width() / 2, pos1.top + from.height() / 2, pos2.left + to.width() / 2, pos2.top + to.height() / 2, aCanvas, to.attr("id"));
			}
		},
		formatDoc : function(destBox, values, uris, bnodes, URI) {
			var docType = methods.getJsonValue(uris, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'default');
			destBox.addClass(methods.getProperty("document", "className", docType));
			var images = methods.getProperty("images", "properties", docType);
			var videos = methods.getProperty("videos", "properties", docType);
			var weblinks = methods.getProperty("weblinks", "properties", docType);
			var keywords = methods.getProperty("keywords", "properties", docType);
			var propertiesMapper = methods.getProperty("document", "propertiesMapper", URI.replace(/(http:\/\/[^\/]+\/).+/, "$1"));
			if ( typeof images == typeof '') {	images = [images]; }
			if ( typeof videos == typeof '') {	videos = [videos]; }
			if ( typeof weblinks == typeof '') { weblinks = [weblinks]; }
			var result = "<div></div>";
			var jResult = $(result);
			var contents = [];
			$.each(values, function(key, value) {
				for (var akey in value) {
					eval('contents.push({\'' + akey + '\':\'' + value[akey] + '\'})');
				}
			});
			var connectedImages = [];
			var connectedVideos = [];
			var connectedWeblinks = [];
			var connectedKeywords = [];
			var types = [];
			$.each(uris, function(key, value) {
				for (var akey in value) {
					if (akey != 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
						if (akey.indexOf('image') > -1) {
							eval('connectedImages.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('video') > -1) {
							eval('connectedVideos.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('url') > -1) {
							eval('connectedWeblinks.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						} else if (akey.indexOf('keywords') > -1) {
							eval('connectedKeywords.push({\'' + akey + '\':\'' + value[akey] + '\'})');
						}
					} else {
						if(value[akey].indexOf(s4.DBaaS)>-1) types.push(unescape(value[akey]));
					}
				}
			});
			var imagesj = null;
			if (connectedImages.length > 0) {
				imagesj = $('<div class="section"></div>');
				$.each(connectedImages, function(key, value) {
					for (var akey in value) {
						imagesj.append("<a class=\"relatedImage\"  rel=\"imagegroup\" href=\"" + unescape(value[akey]) + "\"><img src=\"" + unescape(value[akey]) + "\"/></a> ");
					}
				});
			}
			var videosj = null;
			if (connectedVideos.length > 0) {
				videosj = $('<div class="section"></div>');
				$.each(connectedVideos, function(key, value) {
					for (var akey in value) {
						var video = unescape(value[akey]).replace(s4.bad_youtube, s4.well_youtube);
						var vid = video.substr(video.indexOf('embed/')+6);   // http://www.youtube.com/embed/sgE2JhmtWLk
						thumbnail = 'http://i.ytimg.com/vi/'+vid+'/mqdefault.jpg';
						videosj.append('<a class="relatedVideo" vid="' + vid + '" rel="videogroup" href="' + video + '"><img style="border-radius:7px" src="' + thumbnail + '"/></a>');
					}
				});
			}
			var webLinkResult = null;
			if (connectedWeblinks.length > 0) {
				webLinkResult = "<div class=\"section\"><ul style=\"padding:0;margin:0;display:block;overflow:hidden;tex-overflow:ellipses\">";
				$.each(connectedWeblinks, function(key, value) {
					for (var akey in value) {
						webLinkResult += "<li><a class=\"relatedLink\" target=\"_blank\" data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" href=\"" + unescape(value[akey]) + "\">" + unescape(value[akey]) + "</a></li>";
					}
				});
				webLinkResult += "</ul></div>";
			}
			var keywordsj = null;
			if (connectedKeywords.length > 0) {
				keywordsj = $('<div class="section"></div>');
				$.each(connectedKeywords, function(key, value) {
					for (var akey in value) {
						keywordsj.append('<span>' + unescape(value[akey]) + '</span>');
					}
				});
			}
			var jContents = $('<div></div>');
			var topSection = $('<div class="topSection sprite"><span>&#160;</span></div>');
			jResult.append(topSection);
			topSection.find('span').each(function() {
				$(this).click(function() {
					methods.docInfo('', 'close');
				});
				$(this).hover(function() {
					topSection.setBackgroundPosition({
						y : -410
					});
				}, function() {
					topSection.setBackgroundPosition({
						y : -390
					});
				});
			});
			if (types.length > 0) {
				var jSection = $("<div class=\"section\"><label data-title=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\">type</label><div></div></div>");
				jSection.find('label').each(function() {
					$(this).hover(function() {
						methods.msg($(this).attr('data-title'), 'show');
					}, function() {
						methods.msg(null, 'hide');
					});
				});
				for (var int = 0; int < types.length; int++) {
					var shortKey = types[int];
					while (shortKey.indexOf('/') > -1) {
						shortKey = shortKey.substring(shortKey.indexOf('/') + 1);
					}
					while (shortKey.indexOf('#') > -1) {
						shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
					}
					jSection.children('div').append("<span title=\"" + types[int] + "\">" + shortKey + " </span>");
				}
				jContents.append(jSection);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (webLinkResult) {
				var jWebLinkResult = $(webLinkResult);
				jWebLinkResult.find('a').each(function() {
					$(this).hover(function() {
						methods.msg($(this).attr('data-title'), 'show');
					}, function() {
						methods.msg(null, 'hide');
					});
				});
				jContents.append(jWebLinkResult);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (videosj) {
				jContents.append(videosj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (imagesj) {
				jContents.append(imagesj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (propertiesMapper) {
				$.each(propertiesMapper, function(filter, label) {
					$.each(contents, function(key, value) {
						for (var akey in value) {
							if (filter == akey) {
								var shortKey = label;
									var jSection = $("<div class=\"section\"><label data-title=\"" + akey + "\">" + shortKey + "</label><div>" + unescape(value[akey]) + "</div></div><div class=\"separ sprite\"></div>");
									jSection.find('label').each(function() {
										$(this).hover(function() {
											methods.msg($(this).attr('data-title'), 'show');
										}, function() {
											methods.msg(null, 'hide');
										});
									});
									jContents.append(jSection);
								return true;
							}
						}
					});
				});
			} else {
//				Show all properties
				$.each(contents, function(key, value) {
					for (var akey in value) {
						var shortKey = akey;
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
							var info = unescape(value[akey]);
//							Для URL вставим ссылку в виде короткого адреса (hostname)							
							if(shortKey == 'url'){
								var a = document.createElement('a');
								a.href = info;
								['hostname'].forEach(function(k){ info = '<a class="online_link" href="' + unescape(value[akey]) + '" target="_blank">' + a[k] + '</a>';});
							}
							var z = lang('the_' + shortKey.toLowerCase());
							var x = z ? z : lang('the_property');
							var jSection = $("<div class=\"section\"><label data-title=\"" + akey + "\">" + x + "</label> <div>" + info + "</div></div><div class=\"separ sprite\"></div>");
							if(shortKey.indexOf('title')>-1) jContents.prepend(jSection);
							else jContents.append(jSection);
							jSection.find('label').each(function() {
								$(this).hover(function() {
									methods.msg($(this).attr('data-title'), 'show');
								}, function() {
									methods.msg(null, 'hide');
								});
							});
					}
				});
			}
			if (keywordsj) {
				jContents.append($('<div class="section"><label>' + lang('the_keywords') + '</label></div>'));
				jContents.append(keywordsj);
				jContents.append("<div class=\"separ sprite\"></div>");
			}
			if (bnodes.length > 0) {
				$.each(bnodes, function(key, value) {
					for (var akey in value) {
						var shortKey = akey;
						while (shortKey.indexOf('/') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('/') + 1);
						}
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
						var jBnode = $("<div class=\"section\"><label data-title=\"" + akey + "\">" + shortKey + "</label><span class=\"bnode\"></span></div><div class=\"separ sprite\"></div>");
						jBnode.find('label').each(function() {
							$(this).hover(function() {
								methods.msg($(this).attr('data-title'), 'show');
							}, function() {
								methods.msg(null, 'hide');
							});
						});
						methods.resolveBnodes(unescape(value[akey]), URI, jBnode, jContents);
					}
				});
			}
			if (contents.length == 0 && bnodes.length == 0) {
				var jSection = $("<div class=\"section\"><label data-title=\"" + lang('resourceMissingDoc') + "\"></label><div>" + lang('resourceMissingDoc') + "</div></div><div class=\"separ sprite\"></div>");
				jSection.find('label').each(function() {
					$(this).hover(function() {
						methods.msg($(this).attr('data-title'), 'show');
					}, function() {
						methods.msg(null, 'hide');
					});
				});
				jContents.append(jSection);
			}
			destBox.append(jResult);
			destBox.append(jContents);
			$("a[rel=imagegroup]", jContents)
			.fancybox({
				'transitionIn' : 'elastic',
				'transitionOut' : 'elastic',
				'speedIn' : 400,
				'type' : 'image',
				'speedOut' : 200,
				'hideOnContentClick' : true,
				'showCloseButton' : false,
				'overlayShow' : false
			})
			.find('img').each(function() {
				$(this).load(function() {
					$(this).width(75);
					$(this).height(50);
				});
				$(this).error(function() {
					$(this).attr("title", lang('noImage') + " \n" + $(this).attr("src"));
					$(this).attr("src", "img/immagine-vuota.png");
				});
			});
			$("a[rel=videogroup]", jContents)
			.fancybox({
				'transitionIn' : 'elastic',
				'transitionOut' : 'elastic',
				'speedIn' : 400,
				'type' : 'iframe',
				'width' : 853,
				'height' : 480,
				'speedOut' : 200,
				'hideOnContentClick' : false,
				'showCloseButton' : true,
				'overlayShow' : false
			})
			.find('img').each(function() {
				$(this).load(function() { $(this).width(75); $(this).height(50); });
				$(this).error(function() {
					$(this).attr("title", lang('noImage') + " \n" + $(this).attr("src"));
					$(this).attr("src", "img/immagine-vuota.png");
				});
				var anchor = this.parentNode;
				$.getJSON("https://www.googleapis.com/youtube/v3/videos", {
					key: "AIzaSyAmaSpCjFRLOgGeEH2bucQz0Cp3dLLe_28",
					part: "snippet",
					id: anchor.getAttribute('vid')
				}, function(data) {
					if (data.items.length === 0) return;
					var the_title = data.items[0].snippet.title;
					anchor.setAttribute('title', the_title);
				});
			});
			if (jContents.height() + 40 > $(window).height()) {
				destBox.find("div.separ:last").remove();
				destBox.find("div.separLast").remove();
				jContents.slimScroll({
					height : $(window).height() - 40,
					color : '#fff'
				});
			} else {
			}
		},
		resolveBnodes : function(val, URI, destBox, jContents) {
				var SPARQLquery = methods.composeQuery(val, 'bnode', URI);
				$.jsonp({
				url : SPARQLquery,
				beforeSend : function(){destBox.find('span[class=bnode]').html('<img src="img/ajax-loader-black.gif"/>');},
				success : function(json) {
					destBox.find('span[class=bnode]').html('');
					json = json['results']['bindings'];
					$.each(json, function(key, value) {
						var shortKey = value.property.value;
						while (shortKey.indexOf('/') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('/') + 1);
						}
						while (shortKey.indexOf('#') > -1) {
							shortKey = shortKey.substring(shortKey.indexOf('#') + 1);
						}
						if (value.object.type == 'uri') {
						} else if (value.object.type == 'bnode') {
							var jBnode = $("<span><label data-title=\"" + value.property.value + "\"> / " + shortKey + "</label><span class=\"bnode\"></span></span>");
							jBnode.find('label').each(function() {
								$(this).hover(function() {
									methods.msg($(this).attr('data-title'), 'show');
								}, function() {
									methods.msg(null, 'hide');
								});
							});
							destBox.find('span[class=bnode]').attr("class", "").append(jBnode);
							methods.resolveBnodes(value.object.value, URI, destBox, jContents);
						} else {
							destBox.find('span[class=bnode]').append('<div><em title="' + value.property.value + '">' + shortKey + "</em>: " + value.object.value + '</div>');
						}
						jContents.append(destBox);
						if (jContents.height() + 40 > $(window).height()) {
							jContents.slimScroll({
								height : $(window).height() - 40,
								color : '#fff'
							});
							jContents.parent().find("div.separLast").remove();
						} else {
							jContents.parent().append("<div class=\"separLast\"></div>");
						}
					});
				},
				error : function(e, b, v) {
					destBox.find('span').html('');
				}
				});
			return val;
		},
		format : function(destBox, values, uris, inverses) {
			var containerBox = destBox.parent('div');
			var thisUri = containerBox.attr('rel');
			var docType = methods.getJsonValue(uris, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'default');
			if (thisUri.indexOf("~~") > -1) {
				docType = 'bnode';
			}
			var aClass = methods.getProperty("document", "className", docType);
			if (docType == 'bnode') {
				aClass = 'bnode';
			}
			if (aClass == null || aClass == 'standard' || aClass == '') {
				if ($.jStorage.get('classMap')[docType]) {
					aClass = $.jStorage.get('classMap')[docType];
				} else {
					var classMap = $.jStorage.get('classMap');
					aClass = "box" + $.jStorage.get('classMap').counter;
					if ($.jStorage.get('classMap').counter == 13) {
						classMap.counter = 1;
						$.jStorage.set('classMap', classMap);
					} else {
						classMap.counter = classMap.counter + 1;
						$.jStorage.set('classMap', classMap);
					}
					classMap[docType] = aClass;
					$.jStorage.set('classMap', classMap);
				}
			}
			containerBox.addClass(aClass);
			var titles = methods.getProperty("document", "titleProperties", docType);
			var images = methods.getProperty("images", "properties", docType);
			var videos = methods.getProperty("videos", "properties", docType);
			var weblinks = methods.getProperty("weblinks", "properties", docType);
			var lats = methods.getProperty("maps", "lats", docType);
			var longs = methods.getProperty("maps", "longs", docType);
			var points = methods.getProperty("maps", "points", docType);
			if ( typeof titles == typeof '') { titles = [titles]; }
			if ( typeof images == typeof '') {	images = [images];	}
			if ( typeof videos == typeof '') {	videos = [videos];	}
			if ( typeof weblinks == typeof '') { weblinks = [weblinks]; }
			if ( typeof lats == typeof '') { lats = [lats]; }
			if ( typeof longs == typeof '') { longs = [longs]; }
			if ( typeof points == typeof '') { points = [points]; }
			titles.push('http://system/msg');
			var result = "<div class=\"boxTitle\"><span class=\"ellipsis_text\">";
			var maxTitles = 3;
			for (var a = 0; a < titles.length && maxTitles > 0; a++) {
				var resultArray = methods.getJsonValue(values, titles[a], titles[a].indexOf('http') == 0 ? '' : titles[a]);
				if (titles[a].indexOf('http') != 0) {
					if (result.indexOf($.trim(unescape(titles[a])) + " \n") == -1) {
						result += $.trim(unescape(titles[a])) + " \n";
						maxTitles--;
					}
				} else {
					for (var af = 0; af < resultArray.length; af++) {
						if (result.indexOf(unescape(resultArray[af]) + " \n") == -1) {
							result += unescape(resultArray[af]) + " \n";
							maxTitles--;
						}
					}
				}
			}
			if ((values.length == 0 && uris.length == 0) || containerBox.attr("data-endpoint").indexOf("http://system/dummy") == 0) {
				if (containerBox.attr("data-endpoint").indexOf("http://system/dummy") != -1) {
					containerBox.attr("data-endpoint", lang('endpointNotConfigured'));
				}
				if (uris.length == 0 && values.length == 0) {
					result = "<div class=\"boxTitle\" threedots=\"" + lang('resourceMissing') + "\"><a target=\"_blank\" href=\"" + thisUri + "\"><span class=\"spriteLegenda\"></span>" + thisUri + "</a>";
				}
			}
			result += "</span></div>";
			var jResult = $(result);
			if (jResult.text() == '' && docType == 'bnode') {
				jResult.text('[blank node]');
			} else if (jResult.text() == '') {
				jResult.text(lang('noName'));
			}
			destBox.append(jResult);
			if (!jResult.children().html() || jResult.children().html().indexOf(">") == -1) {
				jResult.ThreeDots({
					max_rows : 3
				});
			}
			var el = jResult.find('.threedots_ellipsis');
			if (el.length > 0) {
				el.detach();
				jResult.children('span').append(el);
			}
			var resourceTitle = jResult.text();
			jResult.css({
				'marginTop' : jResult.height() == 13 ? 58 : jResult.height() == 26 ? 51 : 45,
				'height' : jResult.height() + 5
			});
				destBox.hover(function() {
					methods.msg(jResult.attr("threedots") == '' ? jResult.text() : jResult.attr("threedots") + " \n " + thisUri, 'show', 'fullInfo', containerBox.attr("data-endpoint"));
				}, function() {
					methods.msg(null, 'hide');
				});
			var connectedDocs = [];
			var invertedDocs = [];
			var propertyGroup = {};
			var propertyGroupInverted = {};
			var connectedImages = [];
			var connectedVideos = [];
			var connectedLongs = [];
			var connectedLats = [];
			var sameDocControl = [];
			$.each(uris, function(key, value) {
				for (var akey in value) {
// 					Здесь создает связанные элементы uris
						if (lodLiveProfile.uriSubstitutor) {
							$.each(lodLiveProfile.uriSubstitutor, function(skey, svalue) {
								value[akey] = value[akey].replace(svalue.findStr, svalue.replaceStr);
							});
						}
					if ($.inArray(akey, images) > -1) {
						eval('connectedImages.push({\'' + value[akey] + '\':\'' + escape(resourceTitle) + '\'})');
					} else if ($.inArray(akey, videos) > -1) {
						eval('connectedVideos.push({\'' + value[akey] + '\':\'' + escape(resourceTitle) + '\'})');
					} else if ($.inArray(akey, weblinks) == -1) {
						if ($.inArray(value[akey], sameDocControl) > -1) {
							var aCounter = 0;
							$.each(connectedDocs, function(key2, value2) {
								for (var akey2 in value2) {
									if (value2[akey2] == value[akey]) {
										eval('connectedDocs[' + aCounter + '] = {\'' + akey2 + ' | ' + akey + '\':\'' + value[akey] + '\'}');
									}
								}
								aCounter++;
							});
						} else {
							eval('connectedDocs.push({\'' + akey + '\':\'' + value[akey] + '\'})');
							sameDocControl.push(value[akey]);
						}
					}
				}
			});
			if (inverses) {
				sameDocControl = [];
				$.each(inverses, function(key, value) {
					for (var akey in value) {
						if (docType == 'bnode' && value[akey].indexOf("~~") > -1) {
							continue;
						}
						if (lodLiveProfile.uriSubstitutor) {
							$.each(lodLiveProfile.uriSubstitutor, function(skey, svalue) {
								value[akey] = value[akey].replace(escape(svalue.findStr), escape(svalue.replaceStr));
							});
						}
// 						Здесь создает связанные элементы inverses
						if ($.inArray(value[akey], sameDocControl) > -1) {
							var aCounter = 0;
							$.each(invertedDocs, function(key2, value2) {
								for (var akey2 in value2) {
									if (value2[akey2] == value[akey]) {
										var theKey = akey2;
										if (akey2 != akey) {
											theKey = akey2 + ' | ' + akey;
										}
										eval('invertedDocs[' + aCounter + '] = {\'' + theKey + '\':\'' + value[akey] + '\'}');
										return false;
									}
								}
								aCounter++;
							});
						} else {
							eval('invertedDocs.push({\'' + akey + '\':\'' + value[akey] + '\'})');
							sameDocControl.push(value[akey]);
						}
					}
				});
			}
			if ($.jStorage.get('doDrawMap', true)) {
				for (var a = 0; a < points.length; a++) {
					var resultArray = methods.getJsonValue(values, points[a], points[a]);
					for (var af = 0; af < resultArray.length; af++) {
						if (resultArray[af].indexOf(" ") != -1) {
							eval('connectedLongs.push(\'' + unescape(resultArray[af].split(" ")[1]) + '\')');
							eval('connectedLats.push(\'' + unescape(resultArray[af].split(" ")[0]) + '\')');
						} else if (resultArray[af].indexOf("-") != -1) {
							eval('connectedLongs.push(\'' + unescape(resultArray[af].split("-")[1]) + '\')');
							eval('connectedLats.push(\'' + unescape(resultArray[af].split("-")[0]) + '\')');
						}
					}
				}
				for (var a = 0; a < longs.length; a++) {
					var resultArray = methods.getJsonValue(values, longs[a], longs[a]);
					for (var af = 0; af < resultArray.length; af++) {
						eval('connectedLongs.push(\'' + unescape(resultArray[af]) + '\')');
					}
				}
				for (var a = 0; a < lats.length; a++) {
					var resultArray = methods.getJsonValue(values, lats[a], lats[a]);
					for (var af = 0; af < resultArray.length; af++) {
						eval('connectedLats.push(\'' + unescape(resultArray[af]) + '\')');
					}
				}
				if (connectedLongs.length > 0 && connectedLats.length > 0) {
					var mapsMap = $.jStorage.get("mapsMap", {});
					mapsMap[containerBox.attr("id")] = {
						longs : connectedLongs[0],
						lats : connectedLats[0],
						title : thisUri + "\n" + escape(resourceTitle)
					};
					$.jStorage.set('mapsMap', mapsMap);
					try { methods.updateMapPanel($('#controlPanel')); } catch(e){};
				}
			}
			if ($.jStorage.get('doCollectImages', true)) {
				if (connectedImages.length > 0) {
					var imagesMap = $.jStorage.get("imagesMap", {});
					imagesMap[containerBox.attr("id")] = connectedImages;
					$.jStorage.set('imagesMap', imagesMap);
					methods.updateImagePanel($('#controlPanel'));
				}
			}
			var totRelated = connectedDocs.length + invertedDocs.length;
			if (totRelated > 16) {
				$.each(connectedDocs, function(key, value) {
					for (var akey in value) {
						if (propertyGroup[akey]) {
							var t = propertyGroup[akey];
							t.push(value[akey]);
							propertyGroup[akey] = t;
						} else {
							propertyGroup[akey] = [value[akey]];
						}
					}
				});
				$.each(invertedDocs, function(key, value) {
					for (var akey in value) {
						if (propertyGroupInverted[akey]) {
							var t = propertyGroupInverted[akey];
							t.push(value[akey]);
							propertyGroupInverted[akey] = t;
						} else {
							propertyGroupInverted[akey] = [value[akey]];
						}
					}
				});
				totRelated = 0;
				for (var prop in propertyGroup) {
					if (propertyGroup.hasOwnProperty(prop)) {
						totRelated++;
					}
				}
				for (var prop in propertyGroupInverted) {
					if (propertyGroupInverted.hasOwnProperty(prop)) {
						totRelated++;
					}
				}
			}
			var chordsList = methods.circleChords(75, 24, destBox.position().left + 65, destBox.position().top + 65);
			var chordsListGrouped = methods.circleChords(95, 36, destBox.position().left + 65, destBox.position().top + 65);
			var a = 1;
			var inserted = {};
			var counter = 0;
			var innerCounter = 1;
			var objectList = [];
			var innerObjectList = [];
			$.each(connectedDocs, function(key, value) {
				if (counter == 16) {
					counter = 0;
				}
				if (a == 1) {
				} else if (a == 15) {
					a = 1;
				}
				for (var akey in value) {
					var obj = null;
					if (propertyGroup[akey] && propertyGroup[akey].length > 1) {
						if (!inserted[akey]) {
							innerCounter = 1;
							inserted[akey] = true;
							var objBox = $("<div class=\"groupedRelatedBox sprite\" rel=\"" + MD5(akey) + "\"    data-title=\"" + akey + " \n " + (propertyGroup[akey].length) + " " + lang('connectedResources') + "\" ></div>");
							var akeyArray = akey.split(" ");
							if (unescape(propertyGroup[akey][0]).indexOf('~~') > -1) {
								objBox.addClass('isBnode');
							} else {
								for (var i = 0; i < akeyArray.length; i++) {
									if (lodLiveProfile.arrows[akeyArray[i]]) {
										objBox.addClass(lodLiveProfile.arrows[akeyArray[i]]);
									}
								}
							}
							objBox.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
							objectList.push(objBox);
							a++;
							counter++;
						}
						if (innerCounter < 25) {
							obj = $("<div class=\"aGrouped relatedBox sprite " + MD5(akey) + " " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"  data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" ></div>");
							obj.attr('style', 'display:none;position:absolute;top:' + (chordsListGrouped[innerCounter][1] - 8) + 'px;left:' + (chordsListGrouped[innerCounter][0] - 8) + 'px');
							obj.attr("data-circlePos", innerCounter);
							obj.attr("data-circleParts", 36);
							obj.attr("data-circleId", containerBox.attr('id'));
						}
						innerCounter++;
					} else {
						obj = $("<div class=\"relatedBox sprite " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"   data-title=\"" + akey + ' \n ' + unescape(value[akey]) + "\" ></div>");
						obj.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
						obj.attr("data-circlePos", a);
						obj.attr("data-circleParts", 24);
						a++;
						counter++;
					}
					if (obj) {
						obj.attr("data-circleId", containerBox.attr('id'));
						obj.attr("data-property", akey);
						var akeyArray = akey.split(" ");
						if (obj.attr('rel').indexOf('~~') > -1) {
							obj.addClass('isBnode');
						} else {
							for (var i = 0; i < akeyArray.length; i++) {
								if (lodLiveProfile.arrows[akeyArray[i]]) {
									obj.addClass(lodLiveProfile.arrows[akeyArray[i]]);
								}
							}
						}
						if (obj.hasClass("aGrouped")) {
							innerObjectList.push(obj);
						} else {
							objectList.push(obj);
						}
					}
				}
			});
			inserted = {};
			$.each(invertedDocs, function(key, value) {
				if (counter == 16) {
					counter = 0;
				}
				if (a == 1) {
				} else if (a == 15) {
					a = 1;
				}
				for (var akey in value) {
					var obj = null;
					if (propertyGroupInverted[akey] && propertyGroupInverted[akey].length > 1) {
						if (!inserted[akey]) {
							innerCounter = 1;
							inserted[akey] = true;
							var objBox = $("<div class=\"groupedRelatedBox sprite inverse\" rel=\"" + MD5(akey) + "-i\"   data-title=\"" + akey + " \n " + (propertyGroupInverted[akey].length) + " " + lang('connectedResources') + "\" ></div>");
							var akeyArray = akey.split(" ");
							if (unescape(propertyGroupInverted[akey][0]).indexOf('~~') > -1) {
								objBox.addClass('isBnode');
							} else {
								for (var i = 0; i < akeyArray.length; i++) {
									if (lodLiveProfile.arrows[akeyArray[i]]) {
										objBox.addClass(lodLiveProfile.arrows[akeyArray[i]]);
									}
								}
							}
							objBox.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
							objectList.push(objBox);
							a++;
							counter++;
						}
						if (innerCounter < 25) {
							var destUri = unescape(value[akey].indexOf('~~') == 0 ? thisUri + value[akey] : value[akey]);
							obj = $("<div class=\"aGrouped relatedBox sprite inverse " + MD5(akey) + "-i " + MD5(unescape(value[akey])) + " \" rel=\"" + destUri + "\"  data-title=\"" + akey + " \n " + unescape(value[akey]) + "\" ></div>");
							obj.attr('style', 'display:none;position:absolute;top:' + (chordsListGrouped[innerCounter][1] - 8) + 'px;left:' + (chordsListGrouped[innerCounter][0] - 8) + 'px');
							obj.attr("data-circlePos", innerCounter);
							obj.attr("data-circleParts", 36);
							obj.attr("data-circleId", containerBox.attr('id'));
						}
						innerCounter++;
					} else {
						obj = $("<div class=\"relatedBox sprite inverse " + MD5(unescape(value[akey])) + "\" rel=\"" + unescape(value[akey]) + "\"   data-title=\"" + akey + ' \n ' + unescape(value[akey]) + "\" ></div>");
						obj.attr('style', 'top:' + (chordsList[a][1] - 8) + 'px;left:' + (chordsList[a][0] - 8) + 'px');
						obj.attr("data-circlePos", a);
						obj.attr("data-circleParts", 24);
						a++;
						counter++;
					}
					if (obj) {
						obj.attr("data-circleId", containerBox.attr('id'));
						obj.attr("data-property", akey);
						var akeyArray = akey.split(" ");

						if (obj.attr('rel').indexOf('~~') > -1) {
							obj.addClass('isBnode');
						} else {
							for (var i = 0; i < akeyArray.length; i++) {
								if (lodLiveProfile.arrows[akeyArray[i]]) {
									obj.addClass(lodLiveProfile.arrows[akeyArray[i]]);
								}
							}
						}
						if (obj.hasClass("aGrouped")) {
							innerObjectList.push(obj);
						} else {
							objectList.push(obj);
						}
					}
				}
			});
			var page = 0;
			var totPages = objectList.length > 14 ? (objectList.length / 14 + (objectList.length % 14 > 0 ? 1 : 0)) : 1;
			for (var i = 0; i < objectList.length; i++) {
				if (i % 14 == 0) {
					page++;
					var aPage = $('<div class="page page' + page + '" style="display:none"></div>');
					if (page > 1 && totPages > 1) {
						aPage.append("<div class=\"pager pagePrev sprite\" data-page=\"page" + (page - 1) + "\" style=\"top:" + (chordsList[0][1] - 8) + "px;left:" + (chordsList[0][0] - 8) + "px\"></div>");
					}
					if (totPages > 1 && page < totPages - 1) {
						aPage.append("<div class=\"pager pageNext sprite\" data-page=\"page" + (page + 1) + "\" style=\"top:" + (chordsList[15][1] - 8) + "px;left:" + (chordsList[15][0] - 8) + "px\"></div>");
					}
					containerBox.append(aPage);
				}
				containerBox.children('.page' + page).append(objectList[i]);
			}
			page = 0;
			totPages = innerObjectList.length / 24 + (innerObjectList.length % 24 > 0 ? 1 : 0);
			if (innerObjectList.length > 0) {
				containerBox.append('<div class="innerPage"></div>');
				for (var i = 0; i < innerObjectList.length; i++) {
					containerBox.children('.innerPage').append(innerObjectList[i]);
				}
			}
			containerBox.children('.page1').fadeIn('fast');
			containerBox.children('.page').children('.pager').click(function() {
				var pager = $(this);
				containerBox.find('.lastClick').removeClass('lastClick').click();
				pager.parent().fadeOut('fast', null, function() {
					$(this).parent().children('.' + pager.attr("data-page")).fadeIn('fast');
				});
			}); {
				var obj = $("<div class=\"actionBox contents\" rel=\"contents\"  >&#160;</div>");
				containerBox.append(obj);
				obj.hover(function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : -260
					});
				}, function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : 0
					});
				});
				obj = $("<div class=\"actionBox tools\" rel=\"tools\" >&#160;</div>");
				containerBox.append(obj);
				obj.hover(function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : -130
					});
				}, function() {
					$(this).parent().children('.box').setBackgroundPosition({
						y : 0
					});
				});
			}
		},
		circleChords : function(radius, steps, centerX, centerY, breakAt, onlyElement) {
			var values = [];
			var i = 0;
			if (onlyElement) {
				i = onlyElement;
				var radian = (2 * Math.PI) * (i / steps);
				values.push([centerX + radius * Math.cos(radian), centerY + radius * Math.sin(radian)]);
			} else {
				for (; i < steps; i++) {
					var radian = (2 * Math.PI) * (i / steps);
					values.push([centerX + radius * Math.cos(radian), centerY + radius * Math.sin(radian)]);
				}
			}
			return values;
		},
		getJsonValue : function(map, key, defaultValue) {
			var returnVal = [];
			$.each(map, function(skey, value) {
				for (var akey in value) {
					if (akey == key) {
						returnVal.push(unescape(value[akey]));
					}
				}
			});
			if (returnVal == []) {
				returnVal = [defaultValue];
			}
			return returnVal;
		},
		getProperty : function(area, prop, context) {
			if ( typeof context == typeof '') {
				if (lodLiveProfile[context] && lodLiveProfile[context][area]) {
					if (prop) {
						return lodLiveProfile[context][area][prop] ? lodLiveProfile[context][area][prop] : lodLiveProfile['default'][area][prop];
					} else {
						return lodLiveProfile[context][area] ? lodLiveProfile[context][area] : lodLiveProfile['default'][area];
					}
				}
			} else {

				for (var a = 0; a < context.length; a++) {
					if (lodLiveProfile[context[a]] && lodLiveProfile[context[a]][area]) {
						if (prop) {
							return lodLiveProfile[context[a]][area][prop] ? lodLiveProfile[context[a]][area][prop] : lodLiveProfile['default'][area][prop];
						} else {
							return lodLiveProfile[context[a]][area] ? lodLiveProfile[context[a]][area] : lodLiveProfile['default'][area];
						}
					}
				}
			}
			if (lodLiveProfile['default'][area]) {
				if (prop) {
					return lodLiveProfile['default'][area][prop];
				} else {
					return lodLiveProfile['default'][area];
				}
			} else {
				return '';
			}
		},
		parseRawResource : function(destBox, resource, fromInverse) {
			var values = [];
			var uris = [];
			if (lodLiveProfile['default']) {
				var res = getSparqlConf('documentUri', lodLiveProfile['default'], lodLiveProfile).replace(/\{URI\}/ig, resource);
				var url = lodLiveProfile['default'].endpoint + "?uri=" + encodeURIComponent(resource) + "&query=" + encodeURIComponent(res);
				if ($.jStorage.get('showInfoConsole')) {
					methods.queryConsole('log', {
						title : lang('endpointNotConfiguredSoInternal'),
						text : res,
						uriId : resource
					});
				}
				$.jsonp({
					url : url,
					beforeSend : function() {
						destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
					},
					success : function(json) {
						json = json['results']['bindings'];
						var conta = 0;
						$.each(json, function(key, value) {
							conta++;
							if (value.object.type == 'uri') {
								if (value.object.value != resource) {
									eval('uris.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
								}
							} else {
								eval('values.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							}
						});
						var inverses = [];
						var callback = function() {
							destBox.children('.box').html('');
							methods.format(destBox.children('.box'), values, uris, inverses);
							methods.addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
							if ($.jStorage.get('doAutoExpand')) {
								methods.autoExpand(destBox);
							}
						};
						if ($.jStorage.get('doAutoSameas')) {
							var counter = 0;
							var tot = 0;
							$.each(lodLiveProfile.connection, function(key, value) {
								tot++;
							});
							methods.findInverseSameAs(resource, counter, inverses, callback, tot);
						} else {
							callback();
						}
					},
					error : function(e, j, k) {
						destBox.children('.box').html('');
						var inverses = [];
						if (fromInverse) {
							eval('uris.push({\'' + fromInverse.replace(/div\[data-property="([^"]*)"\].*/, '$1') + '\':\'' + fromInverse.replace(/.*\[rel="([^"]*)"\].*/, '$1') + '\'})');
						}
						methods.format(destBox.children('.box'), values, uris, inverses);
						methods.addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
						if ($.jStorage.get('doAutoExpand')) {
							methods.autoExpand(destBox);
						}
					}
				});
			} else {
				destBox.children('.box').html('');
				var inverses = [];
				if (fromInverse) {
					eval('uris.push({\'' + fromInverse.replace(/div\[data-property="([^"]*)"\].*/, '$1') + '\':\'' + fromInverse.replace(/.*\[rel="([^"]*)"\].*/, '$1') + '\'})');
				}
				methods.format(destBox.children('.box'), values, uris, inverses);
				methods.addClick(destBox, fromInverse ? function(){$(fromInverse).click();} : null);
				if ($.jStorage.get('doAutoExpand')) {
					methods.autoExpand(destBox);
				}
			}
		},
		
//	Функции-конструкторы объектов для работы JSONP при обслуживании openDoc
		openDocJSONP : function(name, anUri, destBox, fromInverse) {
			var self = this;			// внутренняя ссылка на объект
			this.name = name;
			this.anUri = anUri;
			this.SPARQLquery = methods.composeQuery(anUri, 'documentUri');
			this.destBox = destBox;
			this.fromInverse = fromInverse;
			this.thing = this.anUri.substr(anUri.lastIndexOf('/')+1).replace(/[^A-Za-z0-9]/gi, '');
			this.attempt = 0;
			this.uris = [];
			this.values = [];
			this.inverses = [];
			this.callback = function(){
				self.destBox.children('.box').html('');
				methods.format(self.destBox.children('.box'), self.values, self.uris, self.inverses);
				methods.addClick(self.destBox, self.fromInverse);
				if ($.jStorage.get('doAutoExpand')) {methods.autoExpand(self.destBox);}
			};
			this.fail = function() { 
				methods.errorBox(self.destBox); 
				ajaxGo[self.name] = null;	// объект отработал, освободим занятую им память
			};
			this.go = function() {
				self.attempt++;
				$.jsonp({							// запрос для поиска центрального элемента
					url : self.SPARQLquery,
					success : function(response) {
						var json = response['results'];
						if(json) json = json['bindings'];
						if(!json) {
							if(self.attempt < max_attempts) {
								setTimeout(function(){ self.go(); }, 99); 
								return;
							} else {
								self.fail();
								return;
							}
						}
						var conta = 0;
						$.each(json, function(key, value) {
							conta++;
							if (value.object.type == 'uri' || value.object.type == 'bnode') {
								if (value.object.value != anUri) {
									if (value.object.type == 'bnode') {
										eval('self.uris.push({\'' + value['property']['value'] + '\':\'' + escape(self.anUri + '~~' + value.object.value) + '\'})');
									} else {
										eval('self.uris.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
									}
								}
							} else {
								eval('self.values.push({\'' + value['property']['value'] + '\':\'' + escape(value.object.value) + '\'})');
							}
						});
						if ($.jStorage.get('showInfoConsole')) {
							methods.queryConsole('log', {
								founded : conta,
								id : self.SPARQLquery,
								uriId : self.anUri
							});
						}
						self.destBox.children('.box').html('');
						if ($.jStorage.get('doInverse')) {
							destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
							var name = openDocJSONPInverseName + self.thing;
							ajaxGo[name] = new methods.openDocInverseJSONP(name, self);
							ajaxGo[name].go();
						} else {
							methods.format(self.destBox.children('.box'), self.values, self.uris);
							methods.addClick(self.destBox, self.fromInverse);
							if ($.jStorage.get('doAutoExpand')) methods.autoExpand(self.destBox);
						}
						ajaxGo[self.name] = null;	// объект отработал, освободим занятую им память
					},
					error : function() {
						if(self.attempt < max_attempts) setTimeout(function(){ self.go(); }, 99); 
						else self.fail();
					}
				});
			};
		},
		openDocInverseJSONP : function(name, outer) {
			var me = this;			// внутренняя ссылка на объект
			this.name = name;
			this.SPARQLquery = methods.composeQuery(outer.anUri, 'inverse');
			this.attempt = 0;
			this.fail = function() { 
				outer.destBox.children('.box').html('');
				methods.format(outer.destBox.children('.box'), outer.values, outer.uris);
				if ($.jStorage.get('showInfoConsole')) {
					methods.queryConsole('log', {
						error : 'error',
						id : me.SPARQLquery,
						uriId : outer.anUri
					});
				}
				methods.addClick(outer.destBox, outer.fromInverse);
				if ($.jStorage.get('doAutoExpand')) {methods.autoExpand(outer.destBox);}
				ajaxGo[me.name] = null;		// объект отработал, освободим занятую им память
			};
			this.attempt = 0;
			this.go = function() {
				me.attempt++;
				$.jsonp({							// запрос для поиска дочерних элементов
					url : me.SPARQLquery,
					success : function(response) {
						var json = response['results'];
						if(json) json = json['bindings'];
						if(!json) {
							if(me.attempt < max_attempts) {
								setTimeout(function(){ me.go(); }, 99); 
								return;
							} else {
								me.fail();
								return;
							}
						}
						var conta = 0;
						$.each(json, function(key, value) {
							conta++;
							try {
								eval('outer.inverses.push({\'' + value['property']['value'] + '\':\'' + (value.object.type == 'bnode' ? outer.anUri + '~~' : '') + escape(value.object.value) + '\'})');
							} catch(e) {};
						});
						if ($.jStorage.get('showInfoConsole')) {
							methods.queryConsole('log', {
								founded : conta,
								id : me.SPARQLquery,
								uriId : outer.anUri
							});
						}
						if ($.jStorage.get('doAutoSameas')) {
							var counter = 0;
							var tot = 0;
							$.each(lodLiveProfile.connection, function(key, value) {
								tot++;
							});
							methods.findInverseSameAs(outer.anUri, counter, outer.inverses, outer.callback, tot);
						} else outer.callback();
						ajaxGo[me.name] = null;	// объект отработал, освободим занятую им память
					},
					error : function() {
						if(me.attempt < max_attempts) setTimeout(function(){ me.go(); }, 99); 
						else me.fail();
					}
				});
			}
		},
//	Конец функций-конструкторов объектов для работы JSONP при обслуживании openDoc		
		openDoc : function(anUri, destBox, fromInverse) {
			if ($.jStorage.get('showInfoConsole')) {
				methods.queryConsole('init', {uriId : anUri});
				methods.queryConsole('log', {uriId : anUri, resource : anUri});
			}
			SPARQLquery = methods.composeQuery(anUri, 'documentUri');
			if ($.jStorage.get('doStats')) methods.doStats(anUri);
			if (SPARQLquery.indexOf("endpoint=") != -1) {
				var endpoint = SPARQLquery.substring(SPARQLquery.indexOf("endpoint=") + 9);
				endpoint = endpoint.substring(0, endpoint.indexOf("&"));
				destBox.attr("data-endpoint", endpoint);
			} else destBox.attr("data-endpoint", SPARQLquery.substring(0, SPARQLquery.indexOf("?")));
			if (SPARQLquery.indexOf("http://system/dummy") == 0) {
				methods.guessingEndpoint(anUri, function(){methods.openDoc(anUri, destBox, fromInverse);}, function(){methods.parseRawResource(destBox, anUri, fromInverse);});
			} else {
				destBox.children('.box').html('<img style=\"margin-top:' + (destBox.children('.box').height() / 2 - 8) + 'px\" src="img/ajax-loader.gif"/>');
				var name = openDocJSONPName + anUri.substr(anUri.lastIndexOf('/')+1).replace(/[^A-Za-z0-9]/gi, '');
				ajaxGo[name] = new methods.openDocJSONP(name, anUri, destBox, fromInverse);
				ajaxGo[name].go();
			}
		},
		errorBox : function(destBox) {
			destBox.children('.box').addClass("errorBox");
			destBox.children('.box').html('');
			var jResult = $("<div class=\"boxTitle\"><span>" + lang('errorBox') + "</span></div>");
			destBox.children('.box').append(jResult);
			jResult.css({'marginTop' : jResult.height() == 13 ? 83 : jResult.height() == 26 ? 76 : 70});
			jResult.css({'marginLeft' : '22px'});
			var obj = $("<div class=\"actionBox tools\">&#160;</div>");
			obj.click(function() {
				methods.removeDoc(destBox);
			});
			destBox.append(obj);
			destBox.children('.box').hover(function() {
				methods.msg(lang('enpointNotAvailableOrSLow'), 'show', 'fullInfo', destBox.attr("data-endpoint"));
			}, function() {
				methods.msg(null, 'hide');
			});
		},
		
		// Найти все классы для DBpeida
		allClasses : function(SPARQLquery, classes, callback) {
			SPARQLquery = methods.composeQuery(SPARQLquery, 'allClasses');
			$.jsonp({
			url : SPARQLquery,
			success : function(json) {
				json = json['results']['bindings'];
				$.each(json, function(key, value) {
					classes[value.label.value] = value.aclass.value;
				});
				callback();
			},
			error : function(e, b, v) {
				classes[lang('enpointNotAvailable')] = lang('no_classes');
				callback();
			}
			});
		},

		findInverseSameAs : function(anUri, counter, inverse, callback, tot) {
			var innerCounter = 0;
			$.each(lodLiveProfile.connection, function(key, value) {
				if (innerCounter == counter) {
					var skip = false;
					var keySplit = key.split(",");
					if (!value.useForInverseSameAs) {
//						skip = true;
					} else {
						for (var a = 0; a < keySplit.length; a++) {
							if (anUri.indexOf(keySplit[a]) != -1) {
//								skip = true;
							}
						}
					}
					if (skip) {
						counter++;
						if (counter < tot) {
							methods.findInverseSameAs(anUri, counter, inverse, callback, tot);
						} else {
							callback();
						}
						return false;
					}
					var SPARQLquery = value.endpoint + "?" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + escape(getSparqlConf('inverseSameAs', value, lodLiveProfile).replace(/\{URI\}/g, anUri));
					if (value.proxy) {
						SPARQLquery = value.proxy + '?endpoint=' + value.endpoint + "&" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + escape(getSparqlConf('inverseSameAs', value, lodLiveProfile).replace(/\{URI\}/g, anUri));
					}
					$.jsonp({
						url : SPARQLquery,
						timeout : 3000,
						beforeSend : function() {
							if ($.jStorage.get('showInfoConsole')) {
								methods.queryConsole('log', {
									title : value.endpoint,
									text : getSparqlConf('inverseSameAs', value, lodLiveProfile).replace(/\{URI\}/g, anUri),
									id : SPARQLquery,
									uriId : anUri
								});
							}
						},
						success : function(json) {
							json = json['results']['bindings'];
							var conta = 0;
							$.each(json, function(key, value) {
								conta++;
								if (value.property && value.property.value) {
									eval('inverse.splice(1,0,{\'' + value.property.value + '\':\'' + escape(value.object.value) + '\'})');
								} else {
									eval('inverse.splice(1,0,{\'' + 'http://www.w3.org/2002/07/owl#sameAs' + '\':\'' + escape(value.object.value) + '\'})');
								}
							});
							if ($.jStorage.get('showInfoConsole')) {
								methods.queryConsole('log', {
									founded : conta,
									id : SPARQLquery,
									uriId : anUri
								});
							}
							counter++;
							if (counter < tot) {
								methods.findInverseSameAs(anUri, counter, inverse, callback, tot);
							} else {
								callback();
							}
						},
						error : function(e, b, v) {
							if ($.jStorage.get('showInfoConsole')) {
								methods.queryConsole('log', {
									error : 'error',
									id : SPARQLquery,
									uriId : anUri
								});
							}
							counter++;
							if (counter < tot) {
								methods.findInverseSameAs(anUri, counter, inverse, callback, tot);
							} else {
								callback();
							}
						}
					});
				}
				innerCounter++;
			});
		},
		findSubject : function(SPARQLquery, selectedClass, selectedValue, destBox, destInput) {
			$.each(lodLiveProfile.connection, function(key, value) {
				var keySplit = key.split(",");
				for (var a = 0; a < keySplit.length; a++) {
					if (SPARQLquery.indexOf(keySplit[a]) != -1) {
						SPARQLquery = value.endpoint + "?" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + escape(getSparqlConf('findSubject', value, lodLiveProfile).replace(/\{CLASS\}/g, selectedClass).replace(/\{VALUE\}/g, selectedValue));
						if (value.proxy) {
							SPARQLquery = value.proxy + "?endpoint=" + value.endpoint + "&" + (value.endpointType ? $.jStorage.get('endpoints')[value.endpointType] : $.jStorage.get('endpoints')['all']) + "&query=" + escape(getSparqlConf('findSubject', value, lodLiveProfile).replace(/\{CLASS\}/g, selectedClass).replace(/\{VALUE\}/g, selectedValue));
						}
					}
				}
			});
			var values = [];
			$.jsonp({
				url : SPARQLquery,
				beforeSend : function() {
					destBox.html('<img src="img/ajax-loader.gif"/>');
				},
				success : function(json) {
					destBox.html('');
					json = json['results']['bindings'];
					$.each(json, function(key, value) {
						values.push(json[key].subject.value);
					});
					for (var i = 0; i < values.length; i++) {
						destInput.val(values[i]);
					}
				},
				error : function(e, b, v) {
					destBox.html('errore: ' + e);
				}
			});
		},
		standardLine : function(label, x1, y1, x2, y2, canvas, toId) {
			var lineangle = (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) + 180;
			var x2bis = x1 - Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)) + 60;
			canvas.rotateCanvas({
				rotate : lineangle,
				x : x1,
				y : y1
			}).drawLine({
				strokeStyle : "#ad0303",
				strokeWidth : 3,
				strokeCap : 'bevel',
				x1 : x1 - 60,
				y1 : y1,
				x2 : x2bis,
				y2 : y1
			});
			if (lineangle > 90 && lineangle < 270) {
				canvas.rotateCanvas({
					rotate : 180,
					x : (x2bis + x1) / 2,
					y : (y1 + y1) / 2
				});
			}
			label = $.trim(label).replace(/\n/g, ', ');
			canvas.drawText({
				fillStyle : "#000000",
				strokeStyle : "#000000",
				x : (x2bis + x1 + ((x1 + 60) > x2 ? -60 : +60)) / 2,
				y : (y1 + y1 - ((x1 + 60) > x2 ? 18 : -18)) / 2,
				text : ((x1 + 60) > x2 ? " « " : "") + label + ((x1 + 60) > x2 ? "" : " » "),
				align : "center",
				strokeWidth : 0.01,
				fontSize : 12,
				fontFamily : "'Open Sans',Verdana"
			}).restoreCanvas().restoreCanvas();
			lineangle = Math.atan2(y2 - y1, x2 - x1);
			var angle = 0.79;
			var h = Math.abs(8 / Math.cos(angle));
			var fromx = x2 - 60 * Math.cos(lineangle);
			var fromy = y2 - 60 * Math.sin(lineangle);
			var angle1 = lineangle + Math.PI + angle;
			var topx = (x2 + Math.cos(angle1) * h) - 60 * Math.cos(lineangle);
			var topy = (y2 + Math.sin(angle1) * h) - 60 * Math.sin(lineangle);
			var angle2 = lineangle + Math.PI - angle;
			var botx = (x2 + Math.cos(angle2) * h) - 60 * Math.cos(lineangle);
			var boty = (y2 + Math.sin(angle2) * h) - 60 * Math.sin(lineangle);
			canvas.drawLine({
				strokeStyle : "#ad0303",
				strokeWidth : 3,
				x1 : fromx,
				y1 : fromy,
				x2 : botx,
				y2 : boty
			});
			canvas.drawLine({
				strokeStyle : "#ad0303",
				strokeWidth : 3,
				x1 : fromx,
				y1 : fromy,
				x2 : topx,
				y2 : topy
			});
		}
	}
	$.fn.lodlive = function(method) {
		var rdf_browser;
		if(location.search.indexOf(s4.dbpedia) < 0) {
			rdf_browser = new OntotextBrowser();
		} else {
			function Browser(){} 
			Browser.prototype = methods;
			rdf_browser = new Browser();
		}
		if (rdf_browser[method]) {
			return rdf_browser[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof method === 'object' || !method) {
			return rdf_browser.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.lodlive');
		}
	};
})(jQuery, $.jStorage.get('profile'));

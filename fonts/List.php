<?php

class BaseComissions_List_View extends Vtiger_List_View {
	function process (Vtiger_Request $request) {
		global $adb,$current_user;
		
		echo "<br>";
		echo "<button class=\"btn btn-success\" type=\"button\" onclick=\"pagar();\"><strong>Marcar como pagado</strong></button>";
		echo "&nbsp;&nbsp;&nbsp;";
		echo "<button class=\"btn btn-success\" type=\"button\" onclick=\"notificar();\"><strong>Enviar notificación pago</strong></button>";
		echo "<br>";
		echo "<br>";

		parent::process($request);
		
		$lastExecution = "";
		$sql = "select value from vtiger_mycloudsettings where config = 'LAST_COMISSION_EXECUTION'";
		$laste = $adb->query($sql);
		if ($adb->num_rows($laste) > 0) {
			$lastExecution = $adb->query_result($laste,0,'value');
		}
			
		$proposed = 0;
		$sql = "select sum(comission) as proposed from vtiger_comissions";
		$comm = $adb->query($sql);
		if ($adb->num_rows($comm) > 0) {
			$proposed = $adb->query_result($comm,0,'proposed');
		}

		$selected = 0;
		$sql = "select sum(comission) as selected from vtiger_comissions where pay_now = 1";
		$comm = $adb->query($sql);
		if ($adb->num_rows($comm) > 0) {
			$selected = $adb->query_result($comm,0,'selected');
		}
		
		echo "<br>";
		echo "Propuesta hasta el: ";
		if ($lastExecution != "") {
			$date = new DateTimeField($lastExecution);
			echo $date->getDisplayDate();
			
			$cf = new CurrencyField($proposed);	
			echo "<br>";
			echo "<br>";
			echo "Total propuesto: ".$cf->getDisplayValue()." ".$current_user->currency_symbol;
			//echo "<br>";
			$cf = new CurrencyField($selected);	
			//echo "Total seleccionado: ".$cf->getDisplayValue()." ".$current_user->currency_symbol;
		} else {
			echo "no se ha ejecutado nunca";
		}		

		//if ($lastExecution < date("Y-m-d")) {
			echo "<br>";
			echo "<br>";
			echo "<button class=\"btn btn-success\" onclick=\"confirmExec();\"><strong>Calcular propuesta</strong></button>";
			//}
	}
	
	function postProcess(Vtiger_Request $request) {
		parent::postProcess($request);
		
		echo "
			<script>
				function getPagarArguments(data){    
		            var frm_str = '<form id=\"some-form\">'
			 						+ '<div style=\"height:150px;\">'
		                            + '<div class=\"form-group\" style=\"float: left;height:100px;\">'
		                            + data.agent + '<br><br>' 
									+ 'Comisión propuesta del ' + (new Date(data.from)).toString('dd-MM-yyyy') + ' al ' + (new Date(data.to)).toString('dd-MM-yyyy') + ': ' + parseFloat(parseFloat(data.proposal).toFixed(2)).toLocaleString('es-ES') +  ' € <br><br>'
									+ '<input checked data-to=\"'+(new Date(data.to)).toString('dd-MM-yyyy')+'\" data-from=\"'+(new Date(data.from)).toString('dd-MM-yyyy')+'\" data-amount=\"'+parseFloat(parseFloat(data.proposal).toFixed(2)).toLocaleString('es-ES') + ' €'+'\" type=\"radio\" name=\"registerType\" value=\"1\" onclick=\"jQuery(\'.date\').datepicker(\'hide\');\">'
									+ '&nbsp;&nbsp;Registrar pago de ' + parseFloat(parseFloat(data.proposal).toFixed(2)).toLocaleString('es-ES') + ' €'
									+ '</input><br>'
									+ '<input data-to=\"'+(new Date(data.to)).toString('dd-MM-yyyy')+'\" data-from=\"'+(new Date(data.from)).toString('dd-MM-yyyy')+'\" type=\"radio\" id=\"opt2\" name=\"registerType\" value=\"2\" onclick=\"jQuery(\'#pay_to\').focus()\">'
									+ '&nbsp;&nbsp;Registrar pago hasta el '
									+ '<input onclick=\"jQuery(\'#opt2\').prop(\'checked\',true)\" id=\"pay_to\" class=\"date form-control input-sm\" style=\"width: 75px !important;\" type=\"text\" value=\"'+(new Date(data.to)).toString('dd-MM-yyyy')+'\">'
									+ '</input><br>'
									+ '<input type=\"radio\" id=\"opt3\" name=\"registerType\" value=\"3\" onclick=\"jQuery(\'.date\').datepicker(\'hide\');jQuery(\'#pay_ammount\').focus();\">'
									+ '&nbsp;&nbsp;Registrar pago de '
									+ '<input onselect=\"jQuery(\'#opt3\').prop(\'checked\',true)\" onclick=\"jQuery(\'#opt3\').prop(\'checked\',true)\" id=\"pay_ammount\" class=\"form-control input-sm\" style=\"width: 100px !important;\" type=\"text\" value=\"0\">'
									+ '</input><br>'
		                            + '</div>'
								    + '</div>'
								    + '</form>';

		            var object = $('<div/>').html(frm_str).contents();

		            object.find('.date').datepicker({
		                format: 'dd-mm-yyyy',
							language: 'es',
							weekStart: 1,
		                autoclose: true}).on('changeDate', function (ev) {
		                   $(this).blur();
		                   $(this).datepicker('hide');
		            });

		            return object;
		        }

				function pagar() {
					var aDeferred = jQuery.Deferred();
					var selected = '';
					var num = 0;
					
					// Obtener los elementos marcados y validaciones
					jQuery('.listViewEntriesCheckBox:checked').each(function(index, value) {
						var element = jQuery(value);
						
						if (selected != '') {
							selected = selected + ',';
						}
						
						selected = selected + element.val();
						num++;
					});
					
					if (num == 0) {
						bootbox.alert('Debe seleccionar un prescriptor / representante', function() {});
						return aDeferred.promise();
					}
					
					if (num > 1) {
						bootbox.alert('Sólo puede seleccionar un prescriptor / representante', function() {});
						return aDeferred.promise();
					}
					
					// Obtener los datos del seleccionado
                    var element = jQuery('<div></div>');
					
					element.progressIndicator({
                            'position':'html',
                            'blockInfo' : {
                                    'enabled' : true,
                                    'elementToBlock' : jQuery('#page')
                            }
                    });
					
                    var params = {
                            module : app.getModuleName(),
                            action : 'IndexAjax',
                            mode : 'getProposal',
							ids: selected,
                    }
					
					AppConnector.request(params).then(function(data) {
                        if(data){
							element.progressIndicator({'mode': 'hide'});
							
							var bootBoxModal = bootbox.dialog(getPagarArguments(data.result),
								[{
									'label': 'Pagar',
				    				'callback': function() {
										var registerType = $(\"[name='registerType']:checked\").val();
										
										if (registerType == 1) {
											var amount = $(\"[name='registerType']:checked\").data(\"amount\");
											var from = $(\"[name='registerType']:checked\").data(\"from\");
											var to = $(\"[name='registerType']:checked\").data(\"to\");
											
											Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a registrar un pago de '+amount+' para el periodo del '+from+' al ' +to+' para '+data.result.agent+'. ¿Desea hacerlo?.'}).then(function(data){
												var element = jQuery('<div></div>');
					
							                    element.progressIndicator({
							                            'position':'html',
							                            'blockInfo' : {
							                                    'enabled' : true,
							                                    'elementToBlock' : jQuery('#page')
							                            }
							                    });
						
						                        var params = {
						                                module : app.getModuleName(),
						                                action : 'IndexAjax',
						                                mode : 'pagar1',
														ids: selected,
						                        };
						
												AppConnector.request(params).then(function(data) {
						                            if(data){
														element.progressIndicator({'mode': 'hide'});
														if (data.result.success) {
															bootbox.alert('Pago registrado.', function() {
																jQuery('.date').datepicker('hide');
																location.reload();
															});
														}
						                            }							
												});
											},
						                    function(error, err){
												jQuery('.date').datepicker('hide');
						                    });												
										} else if (registerType == 2) {
											var date = jQuery('#pay_to').val();
											var parts = date.split('-');
											var d = new Date(parts[2]+'-'+parts[1]+'-'+parts[0]);
											var lfrom = new Date(data.result.from);
											var lto = new Date(data.result.to);
											var agentName = data.result.agent;
											var from = $(\"[name='registerType']:checked\").data(\"from\");
											var to = $(\"[name='registerType']:checked\").data(\"to\");
											
											if ((lfrom <= d) && (d <= lto)) {
						                        var params = {
						                                module : app.getModuleName(),
						                                action : 'IndexAjax',
						                                mode : 'comissionUpTo',
														agentId: data.result.agentId,
														agentType: data.result.agentType,
														date: date
						                        };

												AppConnector.request(params).then(function(data) {
													element.progressIndicator({'mode': 'hide'});
													jQuery('.date').datepicker('hide');
						                            if(data){
														var amount = data.result.total;
														
														Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a registrar un pago de '+parseFloat(parseFloat(data.result.total).toFixed(2)).toLocaleString('es-ES')+' € para el periodo del ' + from + ' al ' + date + ' para '   +agentName+'. ¿Desea hacerlo?.'}).then(function(data){
															var element = jQuery('<div></div>');
					
										                    element.progressIndicator({
										                            'position':'html',
										                            'blockInfo' : {
										                                    'enabled' : true,
										                                    'elementToBlock' : jQuery('#page')
										                            }
										                    });
													console.log(data);
									                        var params = {
									                                module : app.getModuleName(),
									                                action : 'IndexAjax',
									                                mode : 'pagar3',
																	ids: selected,
																	ammount: amount,
									                        };
						
															AppConnector.request(params).then(function(data) {
									                            if(data){
																	element.progressIndicator({'mode': 'hide'});
																	location.reload();
									                            }							
															});
														},
									                    function(error, err){
															jQuery('.date').datepicker('hide');
									                    });	
						                            }							
												});
																								
											} else {
												bootbox.alert('Fecha incorrecta.', function() {
													jQuery('.date').datepicker('hide');
												});
											}
										} else if (registerType == 3) {
											var ammount = jQuery('#pay_ammount').val();
											if (isNaN(ammount)) {
												bootbox.alert('Formato incorrecto. Sólo se admiten números y el punto (.) decimal.', function() {
													jQuery('.date').datepicker('hide');
												});
											} else if (parseFloat(ammount) == 0) {
												bootbox.alert('Debe indicar el importe a pagar (no puede ser 0).', function() {
													jQuery('.date').datepicker('hide');
												});
											} else if (parseFloat(ammount) > parseFloat(data.result.proposal)) {
												bootbox.alert('El importe no puede ser superior al propuesto por el periodo ('+parseFloat(parseFloat(data.result.proposal).toFixed(2)).toLocaleString('es-ES')+' €).', function() {
													jQuery('.date').datepicker('hide');
												});
											} else {
												Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a registrar un pago de '+ammount+' € para '+data.result.agent+'. ¿Desea hacerlo?.'}).then(function(data){
													var element = jQuery('<div></div>');
					
								                    element.progressIndicator({
								                            'position':'html',
								                            'blockInfo' : {
								                                    'enabled' : true,
								                                    'elementToBlock' : jQuery('#page')
								                            }
								                    });
													
							                        var params = {
							                                module : app.getModuleName(),
							                                action : 'IndexAjax',
							                                mode : 'pagar3',
															ids: selected,
															ammount: ammount,
							                        };
						
													AppConnector.request(params).then(function(data) {
							                            if(data){
															element.progressIndicator({'mode': 'hide'});
															location.reload();
							                            }							
													});
												},
							                    function(error, err){
													jQuery('.date').datepicker('hide');
							                    });		
											}
										}										
				    				}
								},
								{
									'label': 'Cancelar',
				    				'callback': function() {
										jQuery(\".date\").datepicker(\"hide\");
				    				}
								}]
							);
                        }							
					});

/*
					var aDeferred = jQuery.Deferred();
					var bootBoxModal = bootbox.dialog(getPagarArguments,
						[{
							'label': 'Ver informe',
		    				'callback': function() {
								var start = jQuery('#report-date-start').val();
								var end = jQuery('#report-date-end').val();
								var sort = jQuery('#sort').val();
					
								if (start == '') {
									bootbox.alert('Debe seleccionar al menos la fecha desde', function() {
									});
								} else {
									window.location = '".$urlSalesByCountry."&sort=' + sort + '&arg1=' + start + '&arg2=' + end;
								}
		    				}
						},
						{
							'label': 'Cancelar',
		    				'callback': function() {
		    				}
						}]
					);
			*/
					return aDeferred.promise();
/*									

					Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a marcar como pagadas las comisiones de los registros seleccionados. ¿Desea hacerlo?.'}).then(function(data){
						var element = jQuery('<div></div>');
					
	                    element.progressIndicator({
	                            'position':'html',
	                            'blockInfo' : {
	                                    'enabled' : true,
	                                    'elementToBlock' : jQuery('#page')
	                            }
	                    });
						
                        var params = {
                                module : app.getModuleName(),
                                action : 'IndexAjax',
                                mode : 'pagar',
								ids: selected,
                        }
						
						AppConnector.request(params).then(function(data) {
                            if(data){
								element.progressIndicator({'mode': 'hide'});
								location.reload();
                            }							
						});
					},
                    function(error, err){
						jQuery('.date').datepicker('hide');
                    });						
					*/
				}

				function notificar() {
					var aDeferred = jQuery.Deferred();
					var selected = '';
					var num = 0;
					
					// Obtener los elementos marcados y validaciones
					jQuery('.listViewEntriesCheckBox:checked').each(function(index, value) {
						var element = jQuery(value);
						
						if (selected != '') {
							selected = selected + ',';
						}
						
						selected = selected + element.val();
						num++;
					});
					
					if (num == 0) {
						bootbox.alert('Debe seleccionar un prescriptor / representante', function() {});
						return aDeferred.promise();
					}
					
					if (num > 1) {
						bootbox.alert('Sólo puede seleccionar un prescriptor / representante', function() {});
						return aDeferred.promise();
					}
					
					// Obtener los datos del seleccionado
                    var element = jQuery('<div></div>');
					
					element.progressIndicator({
                            'position':'html',
                            'blockInfo' : {
                                    'enabled' : true,
                                    'elementToBlock' : jQuery('#page')
                            }
                    });
					
                    var params = {
                            module : app.getModuleName(),
                            action : 'IndexAjax',
                            mode : 'getProposal',
							ids: selected,
                    }
					
					AppConnector.request(params).then(function(data) {
                        if(data){
							element.progressIndicator({'mode': 'hide'});	
							Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a enviar un mail de notificación de importe de comisión a ' + data.result.agent + '. ¿Desea hacerlo?.'}).then(function(data){
								var element = jQuery('<div></div>');
					
								element.progressIndicator({'mode': 'hide'});

				                var params = {};
				                params['module'] = 'Accounts';
				                params['view'] = 'MassActionAjax';
				                params['selected_ids'] = '['+selected+']';
				                params['mode'] = 'showComposeEmailForm';
				                params['step'] = 'step1';
				                params['relatedLoad'] = true;
								
								Vtiger_Index_Js.showComposeEmailPopup(params);
							});						
                        }							
					});

					return aDeferred.promise();
				}
								
				function confirmExec() {
					Vtiger_Helper_Js.showConfirmationBox({'message' : 'Va a ejecutar el proceso de cálculo de propuestas de comisiones. Esto calculará las ventas acumuladas, el promedio de ventas y la propuesta de comisión a pagar para cada uno de los comisionistas, respecto el último pago de comisiones de cada uno de ellos. ¿Desea hacerlo?.'}).then(function(data){
						var element = jQuery('<div></div>');
					
	                    element.progressIndicator({
	                            'position':'html',
	                            'blockInfo' : {
	                                    'enabled' : true,
	                                    'elementToBlock' : jQuery('#page')
	                            }
	                    });
						
                        var params = {
                                module : app.getModuleName(),
                                action : 'IndexAjax',
                                mode : 'execProposal',
                        }
						
						AppConnector.request(params).then(function(data) {
                            if(data){
								element.progressIndicator({'mode': 'hide'});
								location.reload();
                            }							
						});
					},
                    function(error, err){
                    });			
				}
			</script>
		";
	}
}
?>
<?php
	// Check if there is an extended class
	if (file_exists(dirname(__FILE__).'/Custom'.basename(__FILE__))) {
		include_once(dirname(__FILE__).'/Custom'.basename(__FILE__));
	} else {
		class Comissions_List_View extends BaseComissions_List_View {}
	}
?>
					
					
					
					
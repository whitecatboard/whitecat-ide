<?php

class BaseComissions_IndexAjax_Action extends Vtiger_BasicAjax_Action {
    function __construct() {
    	parent::__construct();
		
        $this->exposeMethod('execProposal');
        $this->exposeMethod('pagar1');
        $this->exposeMethod('pagar3');
        $this->exposeMethod('getProposal');
        $this->exposeMethod('comissionUpTo');
    }

	function process(Vtiger_Request $request) {
		$mode = $request->get('mode');
		if(!empty($mode)) {
			$this->invokeExposedMethod($mode, $request);
		}
		return;
	}

	function comissionUpTo($request) {
		global $adb;
		
		$agent = $request->get("agentId");
		$type = $request->get("agentType");
		$adate = $request->get("date");
		
		$date = DateTime::createFromFormat('d-m-Y', $adate);
		$date = $date->format('Y-m-d');
		
		if ($type == 'Prescriptor') {
			$sql = "select sum(comission - payed) as total from vtiger_salesorder where agent = ? and comission <> payed and sodate <= ?";
		} else {
			$sql = "select sum(mcomission - mpayed) as total from vtiger_salesorder where manager = ? and mcomission <> mpayed and sodate <= ?";			
		}

		$result = $adb->pquery($sql,array($agent,$date));
		
		$response = new Vtiger_Response();
    	$response->setResult(array(
			'success'=>true,
			'total'=>round($adb->query_result($result,0,'total'),2)
		));
		$response->emit();
	}
	
	function getProposal($request) {
		global $adb, $current_user;
		
		require_once("config.php");
		require_once('include/logging.php');
		require_once('include/database/PearDatabase.php');
		require_once('modules/Users/Users.php');
		require_once('include/utils/utils.php');
		require_once('modules/Comissions/Comissions.php');
		require_once('modules/ComissionPays/ComissionPays.php');

		$id = $request->get('ids');

		// Últime ejecución
		$sql = "select value from vtiger_mycloudsettings where config = 'LAST_COMISSION_EXECUTION'";
		$result = $adb->pquery($sql,array());
		$to = $adb->query_result($result,0,'value');
		
		// Último pago
		$sql = "select * from vtiger_comissionpays where comissionpaysid = ? order by date desc";
		$result = $adb->pquery($sql,array($id));
		if ($adb->num_rows($result) > 0) {
			$from = $adb->query_result($result,0,'date');
		} else {
			$from = '2016-01-01';
		}
		
		// Comisión propuesta
		$sql = "select * from vtiger_comissions where comissionsid = ?";
		$result = $adb->pquery($sql,array($id));
		if ($adb->num_rows($result) > 0) {
			$agent = $adb->query_result($result,0,'agent');
			$proposal = $adb->query_result($result,0,'comission');
			$agent_type = $adb->query_result($result,0,'agent_type');
		} else {
			$agent = 0;
			$proposal = 0;
			$agent_type = "";
		}
		
		// Agent
		$sql = "select * from vtiger_account where accountid = ?";
		$result = $adb->pquery($sql,array($agent));
		if ($adb->num_rows($result) > 0) {
			$agentName = $adb->query_result($result,0,'accountname');
		} else {
			$agentName = "";
		}
		
		$response = new Vtiger_Response();
    	$response->setResult(array(
			'success'=>true,
			'to'=>$to,
			'from'=>$from,
			'proposal'=>$proposal,
			'agentId'=>$agent,
			'agent'=>html_entity_decode($agentName,ENT_COMPAT,"UTF-8"),
			'agentType'=>$agent_type,
		));
		$response->emit();
	}
	
	function pagar1($request) {
		global $adb, $current_user;
		
		require_once("config.php");
		require_once('include/logging.php');
		require_once('include/database/PearDatabase.php');
		require_once('modules/Users/Users.php');
		require_once('include/utils/utils.php');
		require_once('modules/Comissions/Comissions.php');
		require_once('modules/ComissionPays/ComissionPays.php');

		$ids = $request->get('ids');
		$ids = preg_split('/,/',$ids);
		
		$date1 = Vtiger_Date_UIType::getDisplayValue(date('Y-m-d'));
		$date2 = date("Y-m-d");
			
		$adb->pquery("update vtiger_salesorder set payed = 0 where payed is null",array());
		$adb->pquery("update vtiger_salesorder set mpayed = 0 where mpayed is null",array());

		foreach($ids as $id) {
			$sql = "select * from vtiger_comissions where comissionsid = ?";
			$result = $adb->pquery($sql,array($id));
			$comission = $adb->query_result($result,0,'comission');
			$agent = $adb->query_result($result,0,'agent');
			$agent_name = $adb->query_result($result,0,'agent_name');
			$last_pay = $adb->query_result($result,0,'last_pay');
			$agent_type = $adb->query_result($result,0,'agent_type');
			
			$payEnt = new ComissionPays();
			
			$payEnt->column_fields['date'] = $date1;
			$payEnt->column_fields['total'] = $comission;
			$payEnt->column_fields['agent'] = $agent;
			$payEnt->column_fields['agent_name'] = html_entity_decode($agent_name,ENT_COMPAT,"UTF-8");
			$payEnt->column_fields['related_to'] = $id;
			
			$payEnt->column_fields['assigned_user_id'] = $current_user->id;
			$payEnt->saveentity('ComissionPays');
			
			$sql = "update vtiger_comissions set pay_now = 1, last_pay = ? where comissionsid = ?";
			$adb->pquery($sql,array($date2,$id));
			
			if ($agent_type == 'Prescriptor') {
				$adb->pquery("update vtiger_salesorder set payment = ?, payed = comission where agent = ?",array($payEnt->id,$agent));

				chdir(dirname(__FILE__)."/../../../reports/gene");
				file_put_contents("report.txt","./exec \"salesByPrescriptorCom1\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"");
				exec("./exec \"salesByPrescriptorCom1\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"",$out,$ret);
			} else {
				$adb->pquery("update vtiger_salesorder set mpayment = ?, payed = comission where manager = ?",array($payEnt->id,$agent));				

				chdir(dirname(__FILE__)."/../../../reports/gene");
				file_put_contents("report.txt","./exec \"salesByPrescriptorCom2\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"");
				exec("./exec \"salesByPrescriptorCom2\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"",$out,$ret);
			}
			
			if ($ret == 0) {
				rename($out[0],"../../comissions/".$out[0]);
				$adb->pquery("update vtiger_comissionpays set report = ? where comissionpaysid = ?",array("comissions/".$out[0], $payEnt->id));
			}
		}

	    $response = new Vtiger_Response();
	    $response->setResult(array('success'=>true));
		$response->emit();
	}
	
	function pagar3($request) {
		global $adb, $current_user;
		
		require_once("config.php");
		require_once('include/logging.php');
		require_once('include/database/PearDatabase.php');
		require_once('modules/Users/Users.php');
		require_once('include/utils/utils.php');
		require_once('modules/Comissions/Comissions.php');
		require_once('modules/ComissionPays/ComissionPays.php');

		file_put_contents("payment.txt","");
		
		$id = $request->get('ids');
		$ammount = round($request->get('ammount'),2);
		
		$date1 = Vtiger_Date_UIType::getDisplayValue(date('Y-m-d'));
		$date2 = date("Y-m-d");

		file_put_contents("payment.txt","ammount: $ammount\r\n",FILE_APPEND);
			
		$adb->pquery("update vtiger_salesorder set payed = 0 where payed is null",array());
		$adb->pquery("update vtiger_salesorder set mpayed = 0 where mpayed is null",array());
				
		$sql = "select * from vtiger_comissions where comissionsid = ?";
		$result = $adb->pquery($sql,array($id));
		$agent = $adb->query_result($result,0,'agent');
		$agent_name = $adb->query_result($result,0,'agent_name');
		$last_pay = $adb->query_result($result,0,'last_pay');
		$agent_type = $adb->query_result($result,0,'agent_type');		
		
		$payEnt = new ComissionPays();
		
		$payEnt->column_fields['date'] = $date1;
		$payEnt->column_fields['total'] = $ammount;
		$payEnt->column_fields['agent'] = $agent;
		$payEnt->column_fields['agent_name'] = html_entity_decode($agent_name,ENT_COMPAT,"UTF-8");
		$payEnt->column_fields['related_to'] = $id;
		
		$payEnt->column_fields['assigned_user_id'] = $current_user->id;
		$payEnt->saveentity('ComissionPays');
		
		$sql = "update vtiger_comissions set pay_now = 1, last_pay = ? where comissionsid = ?";
		$adb->pquery($sql,array($date2,$id));			

		if ($agent_type == 'Prescriptor') {
			$sql = "select salesorderid, comission - payed as pending from vtiger_salesorder where agent = ? and (comission - payed > 0) order by sodate asc";
		} else {
			$sql = "select salesorderid, mcomission - mpayed as pending from vtiger_salesorder where manager = ? and (mcomission - mpayed > 0) order by sodate asc";		
		}
		
		$acc = 0;
		$result = $adb->pquery($sql,array($agent));
		for($i=0; $i < $adb->num_rows($result); $i++) {
			$salesorderid = $adb->query_result($result,$i,'salesorderid');
			$pending = round($adb->query_result($result,$i,'pending'),2);
			file_put_contents("payment.txt","pending: $pending\r\n",FILE_APPEND);
			$acc += round($pending,2);
			file_put_contents("payment.txt","acc: $acc\r\n",FILE_APPEND);
			if (intval($acc * 100) <= intval($ammount * 100)) {
				file_put_contents("payment.txt","mark\r\n",FILE_APPEND);
				if ($agent_type == 'Prescriptor') {
					$adb->pquery("update vtiger_salesorder set payed = payed + ?,payment=? where salesorderid = ?",array($pending, $payEnt->id, $salesorderid));
				} else {
					$adb->pquery("update vtiger_salesorder set mpayed = mpayed + ?,mpayment=? where salesorderid = ?",array($pending, $payEnt->id, $salesorderid));					
				}
			} else {
				break;
			}
		}

		if (intval($acc * 100) > 0) {
			if ($agent_type == 'Prescriptor') {
				chdir(dirname(__FILE__)."/../../../reports/gene");
				file_put_contents("report.txt","./exec \"salesByPrescriptorCom1\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"");
				exec("./exec \"salesByPrescriptorCom1\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"",$out,$ret);
			} else {
				chdir(dirname(__FILE__)."/../../../reports/gene");
				file_put_contents("report.txt","./exec \"salesByPrescriptorCom2\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"");
				exec("./exec \"salesByPrescriptorCom1\" \"asc\" \"{$payEnt->id}\" \"{$payEnt->id}\" \"null\"",$out,$ret);
			}
			
			if ($ret == 0) {
				rename($out[0],"../../comissions/".$out[0]);
				$adb->pquery("update vtiger_comissionpays set report = ? where comissionpaysid = ?",array("comissions/".$out[0], $payEnt->id));
			}
		}

	    $response = new Vtiger_Response();
	    $response->setResult(array('success'=>true));
		$response->emit();
	}

	function getProposalDate() {
		$currentTime  = time();
		$currentYear  = date("Y",$currentTime);
		$currentMonth = date("n",$currentTime);
			
		if ($currentMonth == 1) {
			$currentMonth = 12;
			$currentYear = $currentYear - 1;
		} else {
			$currentMonth = $currentMonth - 1;
		}
		
		$lastDay = cal_days_in_month(CAL_GREGORIAN, $currentMonth, $currentYear);
		
		return "$currentYear-$currentMonth-$lastDay";
	}
	
	function execProposal() {
			require_once("config.php");
			require_once('include/logging.php');
			require_once('include/database/PearDatabase.php');
			require_once('modules/Users/Users.php');
			require_once('include/utils/utils.php');

			require_once('modules/Comissions/Comissions.php');
			require_once('modules/Accounts/Accounts.php');

			global $adb, $current_user;
	
			$proposedDate = $this->getProposalDate();
			file_put_contents("comis.txt",$proposedDate);
			$current_user = new Users();	
			$current_user->id = 1;
	
			// Creamos los reponsables comerciales como cuenta
			$sql = "select concat('Resp. Comercial (', c.name, ')') as name, c.countryid from vtiger_country c inner join vtiger_users u on c.agent = u.id";

			$rc = $adb->query($sql);
			for($i=0; $i < $adb->num_rows($rc); $i++) {
				$name = $adb->query_result($rc,$i,'name');
				$country = $adb->query_result($rc,$i,'countryid');

				$sql = "select * from vtiger_account acc inner join vtiger_crmentity e on e.crmid = acc.accountid where acc.accountname = '$name' and e.deleted = 0";
				$test = $adb->query($sql);
				if ($adb->num_rows($test) <= 0) {
					$acc = new Accounts();

					$acc->column_fields['accountname'] = html_entity_decode($name,ENT_COMPAT,"UTF-8");
					$acc->column_fields['accounttype'] = 'Responsable comercial';
					$acc->column_fields['ship_country'] = $country;
					$acc->column_fields['bill_country'] = $country;
			
					$acc->column_fields['assigned_user_id'] = $current_user->id;
					$acc->saveentity('Accounts');
					
					$sql = "update vtiger_crmentity set label = ? where crmid = ?";
					$adb->pquery($sql,array($name, $acc->id));
				}
			}
	
			// Obtenemos todos los prescriptores y creamos las entradas si procede
			$sql = "select * from vtiger_account acc inner join vtiger_accountshipads sa on sa.accountaddressid = acc.accountid inner join vtiger_accountscf cf on cf.accountid = acc.accountid inner join vtiger_crmentity e where cf.cf_1133 = 1 and e.crmid = acc.accountid and e.deleted = 0";
			$rp = $adb->query($sql);
			for($i=0; $i < $adb->num_rows($rp); $i++) {
				$idprescriptor = $adb->query_result($rp,$i,'accountid');
				$name = html_entity_decode($adb->query_result($rp,$i,'accountname'),ENT_COMPAT,"UTF-8");
				$type = $adb->query_result($rp,$i,'account_type');
				$country = $adb->query_result($rp,$i,'ship_country');
				
				$sql = "select * from vtiger_comissions where agent = ?";
				$commr = $adb->pquery($sql, array($idprescriptor));
				if ($adb->num_rows($commr) <= 0) {
					// No existe una entrada
					// Creamos
			
					$comm = new Comissions();
			
					$comm->column_fields['agent'] = $idprescriptor;
					$comm->column_fields['agent_name'] = $name;
			
					if ($type != 'Responsable comercial') {
						$comm->column_fields['agent_type'] = 'Prescriptor';
					} else {
						$comm->column_fields['agent_type'] = 'Responsable comercial';
					}
			
					$comm->column_fields['months'] = 0;
					$comm->column_fields['acc_sales'] = 0;
					$comm->column_fields['avg_sales'] = 0;
					$comm->column_fields['last_pay'] = null;
					$comm->column_fields['pay_now'] = false;
					$comm->column_fields['country'] = $country;
					$comm->column_fields['assigned_user_id'] = $current_user->id;
					$comm->saveentity('Comissions');					

					$adb->pquery("update vtiger_comissions c, pending_comisions pc set c.total_comission = pc.pending where c.agent = pc.code and c.agent = ?",array($idprescriptor));
				}
				
				$adb->pquery("update vtiger_comissions set country = ? where agent = ?",array($country,$idprescriptor));
			}
	
			$adb->pquery("update vtiger_comissions set total_comission = 0 where total_comission is null",array());
			
			// Reservamos los que vamos a usar en el cálculo
			$sql = "update vtiger_salesorder set comissioned = 3 where (comissioned = 0 or comissioned is null) and (sodate <= ?)";
			$adb->pquery($sql,array($proposedDate));
			
			// Actualizamos con las ventas
			for($i=0; $i < $adb->num_rows($rp); $i++) {
				$idprescriptor = $adb->query_result($rp,$i,'accountid');

				$sql = "select * from vtiger_comissions where agent = ?";
				$commr = $adb->pquery($sql, array($idprescriptor));
				if ($adb->num_rows($commr) > 0) {
					$last_pay = $adb->query_result($commr,0,'last_pay');
					$type = $adb->query_result($commr,0,'agent_type');
			
					if ($type == 'Prescriptor') {
						$sql = "select so.salesorderid, c.commission as comision_perc, c.shipping as transport_perc, ifnull(TIMESTAMPDIFF(MONTH,date_format(so.sodate,'%Y-%m-01'),date_format(now(),'%Y-%m-01')),0) as months,
ifnull(so.s_h_amount + so.subtotal - ifnull(so.discount_amount,0) - (so.subtotal * (ifnull(so.discount_percent,0) / 100)),0) as total,
ifnull((ifnull(c.commission,0) / 100) * (so.s_h_amount + so.subtotal - ifnull(so.discount_amount,0) - (so.subtotal * (ifnull(so.discount_percent,0) / 100))) * (1 - (ifnull(c.shipping,0) / 100)),0) as comission
from vtiger_salesorder so
inner join vtiger_account customer on customer.accountid = so.accountid
inner join vtiger_account presc on presc.accountid = customer.parentid
inner join vtiger_soshipads soba on soba.soshipaddressid = so.salesorderid
inner join vtiger_country c on c.countryid = soba.ship_country
where presc.accountid = ? and (so.comissioned = 3)";
					} else {
						$sql = "select so.salesorderid, c.commission as comision_perc, c.shipping as transport_perc, ifnull(TIMESTAMPDIFF(MONTH,date_format(so.sodate,'%Y-%m-01'),date_format(now(),'%Y-%m-01')),0) as months,
ifnull(so.s_h_amount + so.subtotal - ifnull(so.discount_amount,0) - (so.subtotal * (ifnull(so.discount_percent,0) / 100)),0) as total,
ifnull((ifnull(c.commission,0) / 100) * (so.s_h_amount + so.subtotal - ifnull(so.discount_amount,0) - (so.subtotal * (ifnull(so.discount_percent,0) / 100))) * (1 - (ifnull(c.shipping,0) / 100)),0) as comission
						from vtiger_salesorder so
						inner join vtiger_soshipads soba on soba.soshipaddressid = so.salesorderid
						inner join vtiger_country c on c.countryid = soba.ship_country
					    inner join vtiger_account rc on rc.accountid = ?
						inner join vtiger_accountbillads aba on aba.accountaddressid = rc.accountid and aba.bill_country = c.countryid				
			where (so.comissioned = 3)";
					}

					$sales = 0;
					$months = 0;
					$avg_sales = 0;
					$comission = 0;
					$payed = 0;

					$salesr = $adb->pquery($sql, array($idprescriptor));
					if ($adb->num_rows($salesr) == 0) {
						$sql = "select ifnull(sum(total),0) as total from vtiger_comissionpays where agent = ?";
						$payr = $adb->pquery($sql, array($idprescriptor));
						$payed = $adb->query_result($payr,0,'total');
						$sql = "update vtiger_comissions set previous_comission = total_comission - ? where agent = ?";
						$adb->pquery($sql,array($payed, $idprescriptor));

						continue;
					}

					for($j=0; $j < $adb->num_rows($salesr); $j++) {
						$salesorderid = $adb->query_result($salesr,$j,'salesorderid');
						$comision_perc = $adb->query_result($salesr,$j,'comision_perc');
						$transport_perc = $adb->query_result($salesr,$j,'transport_perc');
						$total_tmp = round($adb->query_result($salesr,$j,'total'),2);
						if ($total_tmp == "") {
							$total_tmp = 0;
						}
						
						$comission_tmp = round($adb->query_result($salesr,$j,'comission'),2);
						if ($comission_tmp == "") {
							$comission_tmp = 0;
						}
						
						$tmp_months = $adb->query_result($salesr,0,'months');
						if ($tmp_months == "") {
							$tmp_months = 0;
						}
						
						if ($tmp_months > $months) {
							$months = $tmp_months;
						}
						
						
						$sales += $total_tmp;
						$comission += $comission_tmp;
						
						if ($type == 'Prescriptor') {
							$sql = "update vtiger_salesorder set comision_perc = ?, transport_perc = ?, comission = ?, agent = ? where salesorderid = ?";
							$adb->pquery($sql,array($comision_perc,$transport_perc,$comission_tmp,$idprescriptor,$salesorderid));
						} else {
							$sql = "update vtiger_salesorder set mcomision_perc = ?, mtransport_perc = ?, mcomission = ?, manager = ? where salesorderid = ?";
							$adb->pquery($sql,array($comision_perc,$transport_perc,$comission_tmp,$idprescriptor,$salesorderid));							
						}
					}
			
					if ($adb->num_rows($salesr) > 0) {
						$sql = "select ifnull(sum(total),0) as total from vtiger_comissionpays where agent = ?";
						$payr = $adb->pquery($sql, array($idprescriptor));
						$payed = $adb->query_result($payr,0,'total');
					}
					
					if ($months != 0) {
						$avg_sales = $sales / $months;
					} else {
						$avg_sales = $sales;
					}
										
					$sql = "update vtiger_comissions set previous_comission = total_comission - ? where agent = ?";
					$adb->pquery($sql,array($payed, $idprescriptor));

					$sql = "update vtiger_comissions set acc_sales = ?, months = ?, avg_sales = ?, total_comission = total_comission + ?, current_comission = ? where agent = ?";
					$adb->pquery($sql,array($sales,$months, $avg_sales, $comission, $comission, $idprescriptor));

					$sql = "update vtiger_comissions set comission = total_comission - ? where agent = ?";
					$adb->pquery($sql,array($payed, $idprescriptor));
				}
			}
			
			$sql = "update vtiger_salesorder set comissioned = 1 where comissioned = 3";
			$adb->query($sql);

			$sql = "update vtiger_mycloudsettings set value = ? where config = 'LAST_COMISSION_EXECUTION'";
			$adb->pquery($sql,array($proposedDate));
			
	        $response = new Vtiger_Response();
	        $response->setResult(array('success'=>true));
			$response->emit();
	}
}
?><?php
     	// Check if there is an extended class
        if (file_exists(dirname(__FILE__).'/Custom'.basename(__FILE__))) {
                include_once(dirname(__FILE__).'/Custom'.basename(__FILE__));
        } else {
                class Comissions_IndexAjax_Action extends BaseComissions_IndexAjax_Action {}
        }
?>
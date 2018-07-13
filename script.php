<?php

	function pulisciParametri($parametri)
	{
		$counter=0;
		for($i=0;$i<strlen($parametri);$i++)							//pulisco la stringa dei nomi e li salvo in un array
		{
			$puliti[$counter]="";
			if($parametri[$i]!=",")
			{
				while($parametri[$i]!="," && $i<strlen($parametri))
				{
					$puliti[$counter]="$puliti[$counter]$parametri[$i]";
					$i++;
				}
				$counter++;
			}
		}
		return $puliti;
	}
	
	
	function scriviCanaliRai($file)							
	{
		$nomi=$_GET['nR'];								//ottengo il nome delle checkbox in una stringa
		$valori=$_GET['vR'];								//ottengo il valore decheckbox in una stringa
		$canali=pulisciParametri($nomi);
		global $idsrai;
		$idsrai=pulisciParametri($valori);
		for($i=0;$i<sizeof($canali);$i++)											//trasferisco i dati dei canali nel file xml
		{
			fputs($file,"<channel id=\"".$idsrai[$i]."\">\n\t<display-name>".$canali[$i]."</display-name>\n</channel>\n");
		}
	}
	
	
	function scriviProgrammiRai($file)
	{
		global $idsrai;
		for($j=0;$j<sizeof($idsrai);$j++)
		{
			$url="http://www.rai.it/dl/portale/GuidaProgrammiAcc.html?".$idsrai[$j]."_".date("Y")."_".date("m")."_".date("d"); 	//url del palinsesto
			$input=@file_get_contents($url) or die('Impossibile accedere al file'); 		//trasformo il codice html in stringa
			if (!$datipalinsesto = fopen("datipalinsesto.txt","w")) 						//controllo se posso aprire il file
			{
				echo "Impossibile aprire datipalinsesto.txt";
				exit;
			}
			$giornodopo=False;												//flag per controllare se il programma ha data successiva

			$grezzi=strstr(strip_tags($input,"DatiPalinsesto"),"mattina");					//pulisco la stringa
			$grezzi=substr($grezzi,0,strpos($grezzi,"Torna alle fasce orarie"));
			$grezzi=str_replace("mattina (Cambia fascia oraria)","",$grezzi);
			$grezzi=str_replace("pomeriggio (Cambia fascia oraria)","",$grezzi);
			$grezzi=str_replace("sera (Cambia fascia oraria)","",$grezzi);
			$grezzi=str_replace("notte (Cambia fascia oraria)","",$grezzi);
			$grezzi=trim($grezzi);
			fputs($datipalinsesto,$grezzi);									//inserisco i dati elaborati nel file datipalinsesto.txt
			
			fclose($datipalinsesto);
			
										
			$arraypalinsesto=file('datipalinsesto.txt');						//leggo il file come array di stringhe
		
			$cdata1=date("Ymd");												//acquisisco date odierne
			$cdata2=date("Ymd");
			
			for($i=0;$i<sizeof($arraypalinsesto);)									
			{
				if($giornodopo)
				{
					$cdata1=date("Ymd",strtotime("+1 days"));				//correzione data per orario oltre mezzanotte
				}
				$ora1=str_replace(":","",substr($arraypalinsesto[$i],0,5));						//estraggo ora inizio
				$titolo=str_replace("&","&amp;",rtrim(substr($arraypalinsesto[$i],6)));			//estraggo il titolo
				if(mb_detect_encoding($titolo)=="UTF-8")								//controllo codifica caratteri titolo
				{
					$titolo=utf8_decode($titolo);					
				}
				if($arraypalinsesto[$i+1]=="\n")										
				{
					$descrizione=" ";								//fix per firefox
				}
				else
				{
					if(mb_detect_encoding($arraypalinsesto[$i+1])!="UTF-8")
					{
						$descrizione=html_entity_decode(rtrim($arraypalinsesto[$i+1]));	 //descrizione con entità html convertite
					}
					else
					{
						$descrizione=utf8_decode(html_entity_decode(rtrim($arraypalinsesto[$i+1])));
					}
				}
				$i=$i+2;
				while($arraypalinsesto[$i]=="\n" && $i<sizeof($arraypalinsesto))			//scorro fino a trovare dati utili
				{
					$i++;
				}
				if($i<sizeof($arraypalinsesto))							//non salvo l'ultimo programma perché non conosco l'ora di fine
				{								
					$ora2=str_replace(":","",substr($arraypalinsesto[$i],0,5));					//estraggo ora fine
					if(!$giornodopo && strncmp($ora1,$ora2,4)>0)								//l'ora potrebbe essere oltre la 
					{																		//mezzanotte quindi bisogna correggere
						$cdata2=date("Ymd",strtotime("+1 days"));								//la data
						$giornodopo=True;
					}
					fputs($file,"<programme start=\"".$cdata1.$ora1."00\" stop=\"".$cdata2.$ora2."00\" channel=\"".$idsrai[$j]."\">\n\t<title lang=\"it\">".$titolo."</title>\n");
					fputs($file,"\t<desc lang=\"it\">".$descrizione."</desc>\n");
					fputs($file,"</programme>\n");
				}
				
			}
		}
	}


								//FINE IMPLEMENTAZIONE FUNZIONI - INIZIO ESECUZIONE SCRIPT
								
	$idsrai;																	
	if(!$guida=fopen("guida.xml","w"))									//controllo se posso aprire il file
	{
		echo "Impossibile aprire guida.xml";
		exit;
	}
					
	fputs($guida,"<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n");		//inserisco intestazione file xml
	fputs($guida,"<!DOCTYPE tv SYSTEM \"xmltv.dtd\">\n");
	fputs($guida,"<tv source-info-url=\"http://rai.it\" source-data-url=\"http://www.rai.it/\" generator-info-name=\"XMLTV\" generator-info-url=\"http://myxmltv.ilbello.com/\">\n");

	scriviCanaliRai($guida);							//scrivo informazioni sui canali Rai
	scriviProgrammiRai($guida);							//scrivo informazioni sui programmi Rai
	
	fputs($guida,"</tv>");								//inserisco tag <tv> di chiusura nel file xml
	fclose($guida);
	$archivio=new ZipArchive();
	if($archivio->open("guida.zip",ZIPARCHIVE::CREATE)!=TRUE)
	{
		exit;
	}
	$archivio->addFile("guida.xml");
	$archivio->close();
?>
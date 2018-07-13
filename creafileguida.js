function setallcheckbox(falsovero)
{
	var m=document.sceltaCanali;
	for(var i=0; i<m.elements.length;i++)			
	{
		m.elements[i].checked=falsovero;
	}
}

function ajaxGestore()
{
	var xmlHttp;
	try
	{
		xmlHttp=new XMLHttpRequest();
	}
	catch(e)
	{
		try
		{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			try
			{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch(e)
			{
				window.alert("Il tuo browser non supporta AJAX!");
				return false;
			}
		}
	}

	xmlHttp.onreadystatechange=function()
	{
		if(xmlHttp.readyState==4)										//viene eseguito al termine dello script
		{
			var bloccobody=document.getElementById("elencocanali");
			while(bloccobody.hasChildNodes())
				bloccobody.removeChild(bloccobody.lastChild);
			bloccobody.style.marginTop="200px";
			var testo=document.createElement("a");
			testo.setAttribute("href","guida.zip");
			testo.style.marginLeft="170px";
			bloccobody.appendChild(testo,bloccobody.firstChild);
			
			var bottone=document.createElement("BUTTON");
			testo.appendChild(bottone,testo.firstChild);
			testo=document.createTextNode("Scarica");
			bottone.appendChild(testo,bottone.firstChild);
			
			testo=document.createElement("BUTTON")
			testo.setAttribute("onclick","visualizza()");
			testo.style.marginLeft="5px";
			bloccobody.appendChild(testo,bloccobody.firstChild);
			
			testo=document.createTextNode("Visualizza guida tv");
			bloccobody=bloccobody.lastChild;
			bloccobody.appendChild(testo,bloccobody.firstChild);
			
			bloccobody=document.getElementById("elencocanali");
			testo=document.createElement("br");
			bloccobody.appendChild(testo,bloccobody.firstChild);
		}
	}
	nomiRai=new Array();
	valoriRai=new Array();
	
	var m=document.sceltaCanali;
	for(var i=0; i<m.elements.length;i++)				//inserisco in 2 array i valori e i nomi dei canali selezionati
	{
		var campo=m.elements[i];
		if(campo.checked)
		{
			nomiRai[i]=campo.name;
			valoriRai[i]=campo.value;
		}
	}
	if(nomiRai.length!=0)							//passo gli array al file script.php controllando se ci sono canali selezionati
	{
		var bloccobody=document.getElementsByTagName("H3");
		bloccobody[0].removeChild(bloccobody[0].lastChild);
		bloccobody=document.getElementById("elencocanali");
		while(bloccobody.hasChildNodes())
			bloccobody.removeChild(bloccobody.lastChild);
		bloccobody.style.color="white";
		bloccobody.style.marginLeft="150px";
		var testo=document.createTextNode("Elaborazione in corso, attendere prego. Il tempo di esecuzione e' proporzionale al numero di canali selezionati.");
		bloccobody.appendChild(testo,bloccobody.firstChild);
		xmlHttp.open("GET","script.php?nR=" + nomiRai + "&" + "vR=" + valoriRai,true);
		xmlHttp.send(null);
	}
}
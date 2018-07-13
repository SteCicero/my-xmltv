function visualizza() 
{
	var xml=load_XML("guida.xml");
	if(!xml || xml.firstChild.nodeValue=="href=\"chrome://global/locale/intl.css\" type=\"text/css\"") //controllo apertura file xml
	{
		var risultato = document.getElementById('elencocanali');
		while(risultato.hasChildNodes())
		{
			risultato.removeChild(risultato.lastChild);
		}
		var nodo=document.createTextNode("Ooops, c'\u00E8 un problema di sintassi nel file xml");
		risultato.appendChild(nodo);
		return false;
	}
	load_channel(load_XML("guida.xml"));
}
			
function load_XML(file)
{
	var xml;
	if (window.ActiveXObject && /Win/.test(navigator.userAgent))				//apertura file Xml con IE
	{			
		xml=new ActiveXObject("Microsoft.XMLDOM");												
		xml.async = false;
		xml.preserveWhiteSpace=true;											//fix lettura spazi vuoti xml IE
    	xml.load(file);																					 
    	return xml;
	}
	else if (document.implementation && document.implementation.createDocument) //apertura fila Xml con Firefox e Safari
	{	
		xml = new XMLHttpRequest();
		xml.open("GET", file, false);
		xml.send();
		xml=xml.responseXML;																										
		return xml;				
	}
	else 
	{
		return false;
	}
}




function load_channel(xml) 
{
	var risultato = document.getElementById("elencocanali");
	risultato.style.marginTop="0px";							//ripristino lo stile
	risultato.style.marginLeft="0px";
	risultato.style.color="black";
	while(risultato.hasChildNodes())
	{
		risultato.removeChild(risultato.lastChild);
	}
	
	var nodo=document.createElement("DIV");
	nodo.setAttribute("id","containergriglia");
	risultato.appendChild(nodo);
	
	nodo=document.createElement("DIV");
	nodo.setAttribute("id","vdescr");
	risultato.appendChild(nodo);
	
	creaTastolink(risultato,"Nuova guida tv","index.html","282px");				//creo i tasti
	creaTastolink(risultato,"Scarica guida tv","guida.zip","0px");
	
	risultato=document.getElementById("containergriglia");
	nodo=document.createElement("DIV");
	nodo.setAttribute("id","timeline");
	risultato.appendChild(nodo);
	var ora=new Date(0000,00,00,6,00,00);
	for(var i=0;i<24;i++)										//creo la timeline
	{
		risultato=document.getElementById("timeline");
		var cifra="";
		if(ora.getHours()<10)
		{
			cifra="0";
		}
		nodo=document.createElement("DIV");
		nodo.setAttribute("id","ora");
		risultato.appendChild(nodo);
		nodo=document.createTextNode(cifra + ora.getHours() + ":00");
		risultato=risultato.lastChild;
		risultato.insertBefore(nodo,risultato.lastChild);
		ora.setHours(1 + ora.getHours());
	}
	var canali=xml.getElementsByTagName("display-name");		//ottengo la lista dei nomi dei canali
	var ids=xml.getElementsByTagName("channel");				//ottengo la lista degli id dei canali
	for(var i=0;i<canali.length;i++)
	{
		caricapalinsesto(xml,canali[i].firstChild.nodeValue,ids[i].getAttribute("id"),i); //inserisco i palinsesti per ogni canale
	}
}

function caricapalinsesto(xml,canale,id,cifra1)				//carica il palinsesto di un canale
{
	var risultato=document.getElementById("containergriglia");
	var nodo=document.createElement("DIV");
	nodo.setAttribute("id","palinsesto");
	risultato.appendChild(nodo);
	risultato=risultato.lastChild;
	nodo=document.createElement("DIV");						//inserisco un blocco con id canale
	nodo.setAttribute("id","canale");
	risultato.appendChild(nodo);
	
	nodo=document.createTextNode(canale);
	risultato=risultato.lastChild;
	risultato.insertBefore(nodo,risultato.lastChild);
	var titoli=xml.getElementsByTagName("title");				//ottengo i titoli
	var descrizioni=xml.getElementsByTagName("desc");			//ottengo le descrizioni
	var programme=xml.getElementsByTagName("programme");		//ottengo i programmi
	var counter=0;												//identifica il numero del programma di un palinsesto
	for(var i=0;i<titoli.length;i++)
	{
		if(id==programme[i].getAttribute("channel"))			//controllo che il canale del programma corrisponda
		{
			var start=programme[i].getAttribute("start");		//ottengo inizio programma
			var stop=programme[i].getAttribute("stop");			//ottengo fine programma
			caricaprogramma(titoli[i].firstChild.nodeValue,descrizioni[i].firstChild.nodeValue,calcoladurata(start,stop),cifra1,counter,start);								//inserisco i blocchi div dei programmi
			counter++;
		}
	}
}

function caricaprogramma(titolo,descrizione,durata,cifra1,cifra2,start)
{
	if(durata<2)
		return;
	var risultato=document.getElementById("containergriglia");
	risultato=risultato.lastChild;
	var nodo=document.createElement("DIV");
	nodo.setAttribute("id","pr" + cifra1 + cifra2);
	
	if(cifra2==0)																//calcolo il margine sinistro del primo programma
	{
		if(calcoladurata("00000000060000",start)!=0)
		{
			nodo.style.marginLeft=(4*calcoladurata("00000000060000",start)) + "px";
		}
	}
	
	nodo.style.cssFloat="left";										//imposto lo stile del programma
	nodo.style.styleFloat="left";
	nodo.style.marginRight="4px";
	nodo.style.backgroundColor="#88dcec";
	nodo.style.width=((durata*4)-7) +"px";
	nodo.style.height="35px";
	nodo.style.overflow="hidden";
	nodo.style.whiteSpace="nowrap";
	nodo.style.paddingTop="5px";
	nodo.style.paddingLeft="3px";
	nodo.onclick=function(){var selettore=document.getElementById("vdescr");		//azioni da eseguire quando programma cliccato
								while(selettore.hasChildNodes())
								{
									selettore.removeChild(selettore.lastChild);
								}
								var testo=document.createTextNode(this.firstChild.nodeValue);
								selettore.appendChild(testo);
								testo=document.createElement("BR");
								selettore.appendChild(testo);
								testo=document.createTextNode(this.childNodes[2].nodeValue);
								selettore.appendChild(testo);
								};
	
	risultato.appendChild(nodo);									//inserisco i dati nella pagina
	nodo=document.createTextNode(titolo);
	risultato=risultato.lastChild;
	risultato.appendChild(nodo);
	nodo=document.createElement("BR");
	risultato.appendChild(nodo);
	nodo=document.createTextNode(descrizione);
	risultato.appendChild(nodo);
}

function calcoladurata(start,stop)
{
	var tempo1=new Date(0000,00,00,start[8] + start[9],start[10] + start[11],00);
	var tempo2=new Date(0000,00,00,stop[8] + stop[9],stop[10] + stop[11],00);
	var ore;
	if(tempo1.getHours()>tempo2.getHours())
	{
		ore=(24+tempo2.getHours())-tempo1.getHours();
	}
	else
	{
		ore=tempo2.getHours()-tempo1.getHours();
	}
	var minuti=tempo2.getMinutes()-tempo1.getMinutes();
	return minuti + (ore*60);
}

function creaTastolink(contenitore,nome,riferimento,margs)		//crea un elemento di tipo button con link
{
	var nodo=document.createElement("a");
	nodo.setAttribute("href",riferimento);
	nodo.style.marginLeft=margs;
	contenitore.appendChild(nodo,contenitore.firstChild);
	var bottone=document.createElement("BUTTON");
	nodo.appendChild(bottone,nodo.firstChild);
	nodo=document.createTextNode(nome);
	bottone.appendChild(nodo,bottone.firstChild);
}
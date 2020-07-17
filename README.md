# EventExpo
EventExpo è una web app basata su Nodejs con Express per il progetto di "Reti di calcolatori" all'universita di La Sapienza. 
Lo scopo dell'applicazione
è quello di creare, gestire e partecipare ad eventi. Gli utenti possono interagire tra di loro con una chat ed un sistema di notifiche, basato Su Socket.io ed AMQP.
Per ulteriori informazioni, si invita a guardare la documentazione offerta.


# Tecnologie utilizzate
***
Lato back-end -> Node.js, Express, Socket.io, 

Database -> MongoDB

Lato front-end -> Html, Css, Javascript, Handlebars
***

# Rest API

Mapbox: <https://docs.mapbox.com/> -> API neccessarie per mostrare sulla mappa il luogo dell'evento

Opencage: <https://opencagedata.com/api> -> API neccessaria per geolocalizzare la posizione dell'evento

# Come Scaricare e provare il progetto
Per scaricare il progetto, devi clonare il repository su git tramite il link:
```bash
git clone https://github.com/Dorjan/EventExpo.git
```
 Occorre poi scaricare docker desktop e posizionarsi da terminale nella cartella del progetto appena scaricato. Eseguire i seguenti comandi:

```bash
docker build -t eventexpo .
```

```bash
docker run -p 3000:3000 eventexpo
```

Poi apri un browser e metti l'url: <http://localhost:3000/>

**Nota** : Il codice sorgente è scritto per lavorare in locale sulla porta: 3000 

***

### Requisiti:
1. Il servizio REST che implementate (lo chiameremo SERV) deve offrire all'esterno delle API documentate con swagger per esempio
2. SERV si deve interfacciare con almeno due servizi REST “esterni”, cioè non su localhost (e.g. google maps)
3. Almeno uno dei servizi REST esterni deve essere “commerciale” (es: twitter, google, facebook, pubnub, parse, firbase etc)
4. Almeno uno dei servizi REST esterni deve richiedere oauth (e.g. google calendar)
5. Si devono usare Websocket e/o AMQP (o simili es MQTT)
6. Il progetto deve essere su GIT (GITHUB, GITLAB ...) e documentato don un README che illustri almeno scopo del progetto, tecnologie usate, come installarlo, come far girare i casi di test
7. Le API REST implementate in SERV devono essere documentate su GIT e devono essere validate con un caso di test
***

### Realizzato da:
- Marco Pennacchia,
- Dorjan Hysa

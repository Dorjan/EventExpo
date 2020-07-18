# EventExpo
EventExpo è una web app basata su Nodejs con Express per il progetto di "Reti di calcolatori" all'universita di La Sapienza. 
Lo scopo dell'applicazione
è quello di creare, gestire e partecipare ad eventi. Gli utenti possono interagire tra di loro con una chat ed un sistema di notifiche, basato Su Socket.io ed AMQP.
Per ulteriori informazioni, si invita a guardare la documentazione offerta.
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

Il programma funziona in locale all'indirizzo: <http://localhost:3000/>

***

### Funzionamento
Una volta connessi all'url precedente ci si ritrova sulla home page di Even Expo e cliccando su Iscriviti viene renderizzata la form per l'iscrizione.
Nella suddetta form si può scegliere di essere utenti,ovvero avere la possibilità di ricercare o partecipare ad eventi o in alternativa si può essere gestori,ovvero poterne creare di nuovi.
In alternativa all'autenticazione locale, si può accedere al sito mediante Gmail o Dropbox,nel ruolo di gestore,sfruttando le funzionalità offerta da oauth.
Una volta loggati gli "utenti" possono cercare tramite una form un evento scegliendo categoria,luogo e un range di date di interesse.
Vengono perciò mostrati gli eventi che corrispondono alla ricerca effettuata,con titolo e descrizione degli stessi.
Cliccando sul bottone "più info",grazie all'api di mabox,verrà mostrata, in aggiunta alle precedenti informazioni, anche la posizione sulla mappa dell'evento.
Se la ricerca soddisfa le nostre richieste,premendo il bottone partecipa si darà conferma di voler prenderne parte all'evento e si verrà informati tramite notifiche ben visibili su eventuali variazoni dello stesso.
Tutto ciò suddetto è valido anche se si accede nel ruolo di gestore con in più la possibilità di creare eventi.
Nella apposita form di creazione è possibile indicare la categoria,inserire un titolo,un'immagine,una breve descrizione e specificare il luogo e la data.
Con l'ausilio dell'api di Open Cage e il modulo di node js geocode il luogo indicato sarà geolocalizzato e ne saranno salvate nel db latitudine e longitudine in aggiunta alla città specificata.
Il gestore potrà eventualmente modificare l'evento,cancellarlo e sarà avvisato tramite notifiche flash dell'eventuale partecipazione di utenti.
Per ultimo viene offerto il servizio di chat e notifiche in tempo reale, con cui gli utenti posso interagire.
***

### Testare l'applicazione
Una volta collegati al sito, ci si può registrare oppure usare uno dei seguenti account:

#### mattia.binotto@gmail.com -> password: italiano (ruolo gestore)
#### charles.leclerc@gmail.com -> password: monegasco (ruolo utente)

Accedendo con questi account si possono testare i servizi offerti dall'app:
come creare eventi ed eliminare nel ruolo di gestore, mentre nel ruolo di utente si ha la possibilità di cercare e partecipare ad un evento.

***

### Realizzato da:
- Marco Pennacchia,
- Dorjan Hysa

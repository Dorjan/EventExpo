# Documentazione

## API REST definite:

Nota: Guarda helpers/auth per la funzione ensureAuthenticated

### index.js
  * ***GET '/'*** : home page, mostra la form di ricerca degli eventi creati nel DB dai gestori

  * ***GET '/welcome'*** : pagina di benvenuto che appare dopo avere fatto accedi(serve per settare WebSocket e Socket.io)

  * ***GET '/about'*** : pagina standard di about page


### auth.js
  * ***GET '/login'*** : mostra i metodi per accedere(locale e oauth)

  * ***POST '/login'*** : utilizzato solo per l'autenticazione locale, accetta nome utente e password dal modulo di accesso e autentica gli utenti (gestito tramite passport, vedi anche passport.js)
  
  * ***GET '/iscriviti'*** : mostra i metodi di iscrizione (locale e oauth)
  
  * ***POST '/registrazione'*** : utilizzato solo per l'autenticazione locale, prende i dettagli dal modulo di registrazione e crea un nuovo utente su DB. Controlla gli errori e li mostra. Esegue anche la crittografia della password tramite bcrypt
 
  * ***GET '/userPage'*** : mostra la pagina dell'utente
  
  * ***GET '/dropbox'*** : avvia dropbox oauth tramite passport (vedi anche passport.js)
  
  * ***GET '/dropbox/callback'*** : se l'autorizzazione di dropbox fallisce reindirizza su /login, altrimenti su /welcome
  
  * ***GET '/google'*** : avvia google oauth tramite passport (vedi anche passport.js)
  
  * ***GET '/google/redirect'*** : se l'autorizzazione di google fallisce reindirizza su /login, altrimenti su /welcome
  
  * ***GET '/logout'*** : disconnette un utente dall'app e lo reindirizza su /login

### eventi.js
  * ***GET '/mieiEventi'*** : mostra gli eventi a cui patecipa l'utente. Se sei un gestore mostra gli eventi creati.

  * ***GET '/crea_Evento'*** : mostra la form "crea nuovo evento"
  
  * ***POST '/crea_Evento'*** : prende i dettagli dalla form "crea nuovo evento", verifica la presenza di errori e aggiunge l'evento nel DB. Quindi avvisa tutti gli utenti tramite AMQP
  
  * ***GET '/show/:id'*** : mostra informazioni sull'evento selezionato da: id. Fornisce anche la funzione di partecipa e la posizione sulla mappa del evento 
  
  * ***GET '/modifica_Evento'*** : mostra la form "modifica evento"
  
  * ***PUT ':id'*** : Modifica gli eventi. Prende i dettagli dalla form "crea nuovo evento", verifica la presenza di errori e aggiunge l'evento nel DB. Quindi avvisa tutti gli utenti che hanno aderito all'evento tramite AMQP
  
  * ***DELETE ':id'*** : elimina l'evento nel DB e rimuove tale evento  dall'elenco degli eventi, a cui l'utente partecipa. Invia anche una notifica a tutti i partecipanti tramite AMQP
  
  * ***POST '/ricerca/'*** : ricerca gli eventi creati tramite una form, in cui si deve specifare: categoria, luogo e intervallo di date

  * ***PUT '/partecipa/:id'*** : utilizzato nella pagina dell'evento show, per unirsi ad un evento se non si è già aderito, e memorizzarlo nel DB. Tramite AMQP,avvisa il gestore che ha creato l'evento 
  
  * ***PUT '/delete/:id'*** : utilizzato nella pagina mieiEventi per abbandonare un evento a cui partecipa. Tramite AMQP avvisa il gestore che ha creato l'evento 

### chat.js
  * ***GET '/chat'*** : mostra la pagina di chat
***

### Cartella Utils

Contiene il file geocoder.js, nel quale è contenuto il modulo(node-geocoder) neccessario per fornire la posizione geografica del evento. Sfruttando le API di (opencage).  


## Cartella Config 

### keys.js
file utilizzato per contenere link URI, ID e chiavi per configurare il database, AMQP, ouath mapbox.

### passport.js
utilizzato per contenere le funzioni del middleware passport, l'e-mail viene utilizzata come chiave primaria 
  
  * ***'local'*** : utilizzato per l'autenticazione locale. Esegue anche la crittografia della password tramite bcrypt
  
  * ***'dropbox-oauth2'*** : fornisce l'accesso tramite dropbox-oauth2
  
  * ***'google'*** : fornisce l'accesso tramite google-ouath2
  
  * ***'serializeUser'*** : ottiene informazioni da un oggetto utente da archiviare in una sessione
  
  * ***'deserializeUser'*** : prende quelle informazioni e le trasforma in un oggetto utente
  ***


## Cartella Helpers 

### auth.js
  * ***ensureAuthenticated*** : fornisce l'accesso al percorso solo se l'utente ha effettuato l'accesso, altrimenti visualizza un messaggio di errore e reindirizza alla pagina di accesso

### hbs.js
  * ***stripTags*** : rimuove la sintassi html dal testo di output
  
  * ***formatDate*** : formatta le date sul testo di output
  ***

## Cartella Views 
  - il motore di visualizzazione si basa su handlebars ed è abbellito con bootstrap e awesome icons  
  - la cartella views è divisa come la cartella routes. Inoltre ci sono dei layouts per la pagina principale, che fornisce la connessione a bootstrap, awesome icons e la gestione di notifiche e chat tramite WebSocket e Socket.io.  
  Partials fornisce barra di navigazione e le sezioni messaggi/errori
  ***


## Altre cartelle e server.js
  * La cartella "models" contiene gli schemi di database per utenti ed eventi  
  * La cartella "public" contiene file css e un file immagine con il logo del sito
  * **server.js** è il file principale, prima stabilisce la connessione con mongoDB e AMQP e gestisce la connessione socket.io. Imposta il motore di visualizzazione, i middleware, le variabili globali e la cartella statica. Quindi avvia il server
  ***

## Come EventExpo utilizza AMQP e Socket.io (WebSocket)
La nostra applicazione è fornita con un servizio di chat e un servizio di notifica in tempo reale. Ciò è possibile con l'uso di AMQP (Rabbit MQ) e Socket.io.

### Servizio Chat
In questo servizio utilizziamo Socket.io per consentire lo scambio di messaggi in tempo reale.
AMQP viene utilizzato per salvare tutti i messaggi e scaricarli quando un utente aggiorna la chat. Abbiamo un "topic exchange" chiamato "chat" e una coda per ogni utente chiamato "chat + email". (Nota: l'e-mail è la chiave primaria dell'utente nell'app)

Tutto è gestito dalla programmazione basata sugli eventi di Socket.io in questo modo:

* **Connessione e Scaricamento dei messaggi**
1) Quando un utente apre la pagina "chat", invia un evento chiamato "chatstart" per richiedere la connessione.
![chat](https://i.imgur.com/0oRQ7nB.jpg)
(chat.js)

2) Il server riceve un evento "chatstart" e apre una connessione AMQP, collega la coda denominata "chat + email" (dove "email è l'e-mail dell'utente che ha richiesto la connessione), scarica tutti i messaggi dalla coda e infine li invia al client tramite Socket.io.
![server](https://i.imgur.com/IZL7IdN.jpg)
(server.js)

3) Il client riceve l'evento "chat + email" e stampa tutti i messaggi scaricati nella chat.
![main](https://i.imgur.com/pXMbGMv.jpg?1)
(main.js)

* **Scambio dei messaggi**
1) Mentre un utente scrive un messaggio, il client invia un evento di "sta scrivendo" con il suo nome al server.
![main](https://i.imgur.com/zVwfVD1.jpg)
(main.js)

2) Il server riceve l'evento "sta scivendo" e invia un evento "sta scrivendo" a tutti gli utenti connessi tranne me.
![server](https://i.imgur.com/bKkQl3S.jpg)
(server.js)

3) Il client riceve l'evento "sta scrivendo" e stampa "'nome' sta scrivendo un messaggio ...".
![main](https://i.imgur.com/IroT2c8.jpg?1)
(main.js)


4) Quando un utente invia un messaggio, il client invia un evento di "chat", con il messaggio e il suo nome come parametri, al server.
![main](https://i.imgur.com/LSu2ngO.jpg)
(main.js)

5) Il server riceve l'evento "chat" e invia un evento "chat" a tutti gli utenti connessi. Poi apre una connessione AMQP e invia il messaggio al "topic exchange" chiamato "chat".
![server](https://i.imgur.com/BQXDh3j.jpg)
(server.js)

6) Il client riceve l'evento "chat" e stampa il messaggio ricevuto nella chat.
![main](https://i.imgur.com/HINXPlq.jpg?1)
(main.js)

### Servizio Notifiche
In questo servizio utilizziamo Socket.io per consentire l'invio in tempo reale di notifiche.
AMQP viene utilizzato per inviare e ricevere tutte le notifiche. Abbiamo un topic exchange chiamato "notify" e una coda per ogni utente chiamato "email" (Nota: l'e-mail è una chiave primaria nell'app). Ogni coda ha due chiavi: "e-mail" per le notifiche personali e "all" per le notifiche a tutti gli utenti.

Tutto è gestito dalla programmazione basata sugli eventi di Socket.io in questo modo:

1) Dopo l'accesso, l'utente verrà reindirizzato nella pagina di benvenuto. Qui il client invia al server un evento di "notify" con la sua email.

![welcome](https://i.imgur.com/uCpdbBY.jpg?1)
(welcome.handlebars)

2) Il server riceve un evento "notify" e invia un evento "ack" al client. Quindi attende la notifica. Quando riceve una nuova notifica, il server la invia al client con un evento "email".

![server](https://i.imgur.com/3GSUs01.jpg?1)
(server.js)

3)
    - Quando il client riceve l'evento "ack", mostra il pulsante per entrare nell'applicazione (questo è necessario per garantire la connessione ad AMQP).
![main](https://i.imgur.com/KNXry0e.jpg?1)
(main.handlebars)

    - Quando il client riceve un evento "email", stampa una nuova notifica nella parte superiore della pagina.
![main](https://i.imgur.com/NDe09s7.jpg?1)
(main.handelbars)

4) Quando un utente crea un evento, invia una notifica al topic exchange chiamato "notify" con la chiave "all".
![eventi](https://i.imgur.com/H1zknn0.jpg?1)
(eventi.js)
***


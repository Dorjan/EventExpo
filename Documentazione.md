# Documentazione

## API REST definite:
Tutte le API Rest sono nella cartella "route", divise in 4 file js.
guarda helpers / auth per la funzione sureAuthenticated

### index.js
  * ***GET '/'*** : home page, mostra la form di ricerca degli eventi creati nel DB dai gestori

  * ***GET '/welcome'*** : pagina di benvenuto che appare dopo avere fatto accedi(serve per settare WebSocket e Socket.io)

  * ***GET '/about'*** : pagina standard di about page


### auth.js
  * ***GET '/login'*** : mostra i mettodi per accedere(locale e oauth)

  * ***POST '/login'*** : utilizzato solo per l'autenticazione locale, accetta nome utente e password dal modulo di accesso e autentica gli utenti (gestito tramite passaport, vedi anche passport.js)
  
  * ***GET '/iscriviti'*** : per mostrare i metodi di iscrizione (locale e oauth)
  
  * ***POST '/iscriviti'*** : utilizzato solo per l'autenticazione locale, prende i dettagli dal modulo di registrazione e crea un nuovo utente su DB. controlla gli errori e li mostra. Esegue anche la crittografia della password tramite bcrypt
 
  * ***GET '/userPage'*** : per mostrare la pagina dell'utente
  
  * ***GET '/dropbox'*** : avviare dropbox oauth tramite passaporto (vedi anche passport.js)
  
  * ***GET '/dropbox/callback'*** : se l'autorizzazione di dropbox fallisce reindirizza su / login, altrimenti su / welcome
  
  * ***GET '/google'*** : per avviare google oauth tramite passport (vedi anche passport.js)
  
  * ***GET '/google/callback'*** : se l'autorizzazione di google fallisce reindirizza su / login, altrimenti su / benvenuto
  
  * ***GET '/logout'*** : per disconnettere un utente dall'app e reindirizzare su / login

### eventi.js
  * ***GET '/mieiEventi'*** : per mostrare gli eventi dell'utente. Innanzitutto, gli eventi creati dal gestore. Poi, eventi a cui l'utente si è unito.

  * ***GET '/crea_Evento'*** : per mostrare il modulo "crea nuovo evento"
  
  * ***POST '/crea_Evento'*** : prende i dettagli dal modulo "crea nuovo evento", verifica la presenza di errori e aggiunge l'evento nel DB. Quindi avvisa tutti gli utenti tramite AMQP
  
  * ***GET '/show/:id'*** : per mostrare informazioni sull'evento selezionato da: id. fornisce anche la funzione di partecipa 
  
  * ***GET /user/:userId'*** : per mostrare tutti gli eventi creati dall'utente, selezionati da: UserId
  
  * ***GET '/modifica_Evento'*** : per mostrare il modulo "modifica evento"
  
  * ***PUT ':id'*** : per modificare eventi. Prende i dettagli dal modulo "crea nuovo evento", verifica la presenza di errori e aggiunge l'evento nel DB. Quindi avvisare tutti gli utenti che hanno aderito all'evento da AMQP
  
  * ***DELETE ':id'*** : per eliminare l'evento nel DB e rimuoverlo dall'elenco degli utenti dell'evento unito. Invia anche una notifica a tutti i partecipanti tramite AMQP
  
  * ***POST '/ricerca/'*** : per ricercare gli eventi creati tramite una form 

  * ***PUT '/partecipa/:id'*** : utilizzato nella pagina dell'evento show per unirsi a un evento, se non già aderito, e memorizzarlo nel DB. Quindi avvisare l'utente che ha creato l'evento da AMQP
  
  * ***PUT '/delete/:id'*** : utilizzato nella mia pagina degli eventi per lasciare un evento unito. Quindi avvisare l'utente che ha creato l'evento da AMQP

### chat.js
  * ***GET '/chat'*** : per mostrare la pagina di chat
***

## Cartella Config 

### keys.js
file utilizzato per contenere servizi URI, ID e segreti privati

### passport.js
utilizzato per contenere le funzioni del middleware passaporto, l'e-mail viene utilizzata come ID chiave  
  
  * ***'local'*** : utilizzato per l'autenticazione locale. Esegue anche la crittografia della password tramite bcrypt
  
  * ***'dropbox-oauth2'*** : fornisce l'accesso tramite dropbox-oauth2
  
  * ***'google'*** : fornisce l'accesso tramite google
  
  * ***'serializeUser'*** : per ottenere informazioni da un oggetto utente da archiviare in una sessione
  
  * ***'deserializeUser'*** : per prendere quelle informazioni e trasformarle in un oggetto utente
  ***


## Cartella Helpers 

### auth.js
  * ***ensureAuthenticated*** : fornisce l'accesso al percorso solo se l'utente ha effettuato l'accesso, altrimenti visualizza un messaggio di errore e reindirizza alla pagina di accesso

### hbs.js
  * ***stripTags*** : per rimuovere la sintassi html dal testo di output
  
  * ***formatDate*** : per formattare le date sul testo di output
  ***

## Cartella Views 
  - il motore di visualizzazione si basa sul manubrio e decorato con bootstrap e icone fantastiche  
  - le viste sono divise come le rotte. Inoltre ci sono layout per la pagina principale, che fornisce la connessione a bootstrap, icone fantastiche e gestione di notifiche e chat tramite WebSocket e Socket.io.  
  Parziali fornisce le sezioni barra di navigazione e messaggi / errori
  ***


## Altre cartelle e server.js
  * La cartella "models" contiene schemi di database per utenti ed eventi  
  * La cartella "public" contiene file e immagini css  
  * **server.js** è il file principale, prima stabilisce la connessione con mongoDB e amqp e gestisce la connessione socket.io. Imposta il motore di visualizzazione, i middleware, le variabili globali e la cartella statica. Quindi avvia il server
  ***

## Come EventExpo utilizza AMQP e Socket.io (WebSocket)
La nostra applicazione è fornita con un servizio di chat e un servizio di notifica in tempo reale. Ciò è possibile con l'uso di AMQP (Rabbit MQ) e Socket.io.

### Servizio Chat
In questo servizio utilizziamo Socket.io per consentire lo scambio di messaggi in tempo reale.
AMQP viene utilizzato per salvare tutti i messaggi e scaricarli quando un utente aggiorna la pagina di chat. Abbiamo uno scambio di argomenti chiamato "chat" e una coda per ogni utente chiamato "chat + email". (Nota: l'e-mail è la chiave primaria dell'utente nell'app)

Tutto è gestito dalla programmazione basata sugli eventi di Socket.io in questo modo.

* **Connessione e Scarica dei messaggi**
1) Quando un utente apre la pagina "chat", invia un evento chiamato "chatstart" per richiedere la connessione.

2) Il server riceve un evento "chatstart" e apre una connessione AMQP, collega la coda denominata "chat + email" (dove "email è l'e-mail dell'utente che ha richiesto la connessione), scarica tutti i messaggi dalla coda e infine li invia a il client tramite Socket.io.


3) Il client riceve l'evento "chat + email" e stampa tutti i messaggi scaricati nella pagina di chat.


* **Scambio dei messaggi**
1) Mentre un utente scrive un messaggio, il client invia un evento di "digitazione" con il suo nome al server.

2) Il server riceve l'evento "digitando" e invia un evento "digitando" a tutti gli utenti connessi tranne me.


3) Il client riceve l'evento "digitando" e stampa "'name' sta scrivendo un messaggio ...".


4) Quando un utente invia un messaggio, il client invia un evento di "chat", con il messaggio e il suo nome come parametri, al server.


5) Il server riceve l'evento "chat" e invia un evento "chat" a tutti gli utenti connessi. Quindi aprire una connessione AMQP e inviare il messaggio allo scambio di argomenti chiamato "chat".


6) Il client riceve l'evento "chat" e stampa il messaggio ricevuto nella chat.

### Servizio Notifiche
In questo servizio utilizziamo Socket.io per consentire l'invio in tempo reale di notifiche.
AMQP viene utilizzato per inviare e ricevere tutte le notifiche. Abbiamo uno scambio di argomenti chiamato "notifica" e una coda per ogni utente chiamato "email" (Nota: l'e-mail è una chiave primaria nell'app). Ogni coda ha due chiavi: "e-mail" per le notifiche personali e "tutto" per le notifiche a tutti.

Tutto è gestito dalla programmazione basata sugli eventi di Socket.io in questo modo:
(ad esempio quando un utente crea un evento e il server invia una notifica a tutti gli utenti connessi. Utilizziamo un metodo simile anche per gli altri eventi. Vedi "route / events.js")

1) Dopo l'accesso, l'utente verrà reindirizzato nella pagina di benvenuto. Qui il client invia al server un evento di "notifica" con la sua email.


2) Il server riceve un evento "notifica" e invia un evento "ack" al client. Quindi attende la notifica. Quando riceve una nuova notifica, il server la invia al client con un evento "email".


3)
    - Quando il client riceve l'evento "ack", mostra il pulsante per entrare nell'applicazione (questo è necessario per garantire la connessione ad amqp).


    - Quando il client riceve un evento "email", stampa una nuova notifica nella parte superiore della pagina.


4) Quando un utente crea un evento, invia una notifica allo scambio di argomenti chiamato "notifica" con la chiave "all".
***

### Cartella utils

Contiene il file geocoder.js, nel quale è contetnuto il modulo(node-geocoder) neccessario per fornire la posizione geografica del evento. Sfruttando le API di (opencage).  

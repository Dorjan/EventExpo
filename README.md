# EventExpo
EventExpo è una web app basata su Nodejs con Express per il progetto di "Reti di calcolatori" all'universita di La Sapienza. 
Lo scopo dell'applicazione
è quello di creare, gestire e partecipare ad eventi. Gli utenti possono interagire tra di loro con una chat ed un sistema di notifiche, basato Su Socket.io ed AMQP.
Per ulteriori informazioni, si invita a guardare la documentazione offerta

L'applicazione può essere eseguita tramite Docker

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
- Dorjan Hysa
- Marco Pennacchia

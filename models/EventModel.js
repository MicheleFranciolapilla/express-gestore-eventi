// Importazione librerie
const   fileSystem      =   require("fs");
const   path            =   require("path");

// Definizione del database (.json)
const   eventsDB        =   "eventsDB.json";
const   eventsDBPath    =   path.resolve("public", eventsDB);

// Implementazione classe EventModel
class   EventModel
{
    // Proprietà private

    #id;
    #title;
    #titleSlug;
    #description;
    #eventDate;
    #maxSeats;

    // Proprietà static

    static  eventInstances = [];
    static  lastGeneratedId;

    // Costruttore e metodi

    // Si inseriscono tutti i campi richiesti, ad eccezione dell'id che verrà determinato dinamicamente per garantirne l'unicità
    constructor(_title, _description = "", _eventDate, _maxSeats)
    {
        this.#setUniqueId();
        this.#title         =   _title;
        this.#description   =   _description;
        this.#eventDate     =   _eventDate;
        this.#maxSeats      =   _maxSeats;
        // Se l'aggiunta di un nuovo evento non va a buon fine si genera un errore, altrimenti si salva l'istanza e si aggiorna la memoria relativa all'ultimo id generato
        if (!this.#addEvent())
            throw new Error("Evento rigettato!");
        else
        {
            EventModel.lastGeneratedId = this.#id;
            EventModel.eventInstances.push(this);
        }
    };
    
    // Metodi private
    #setUniqueId()
    {
        const allEvents = EventModel.getAllEvents();
        const allIds = allEvents.map( (event) => event.id );
        this.#id = allIds.length != 0 ? Math.max(...allIds) + 1 : 1;
        console.log("ID: ", this.#id);
    };

    #addEvent()
    {
        const   eventToAdd  =   {
                                    "id"            :   this.#id,
                                    "title"         :   this.#title,
                                    ...( this.#description !== "" && { "description": this.#description }),
                                    "eventDate"     :   this.#eventDate,
                                    "maxSeats"      :   this.#maxSeats
                                };
        let allEvents = EventModel.getAllEvents();
        allEvents.push(eventToAdd);
        try
        {
            fileSystem.writeFileSync(eventsDBPath, JSON.stringify(allEvents));
        }
        catch (error)
        {
            return false;
        }
        return true;
    };

    // Setters
    set title(value)
    {
        this.#title = value;
    };

    set description(value)
    {
        this.#description = value;
    };

    set eventDate(value)
    {
        this.#eventDate = value;
    };

    set maxSeats(value)
    {
        this.#maxSeats = value;
    };

    // Getters
    get id()
    {
        return this.#id;
    };

    get title()
    {
        return this.#title;
    };

    get description()
    {
        return this.#description;
    };

    get eventDate()
    {
        return this.#eventDate;
    };

    get maxSeats()
    {
        return this.#maxSeats;
    };

    // Metodi statici
    static  checkDBExistance()
            {
                return fileSystem.existsSync(eventsDBPath);
            };

    static  fromObjToArray(objToArray)
            {
                const simpleObj = objToArray;
                let arrayToReturn = [];
                arrayToReturn.push(simpleObj);
                return arrayToReturn;
            };

    static  getAllEvents()
            {
                if (!EventModel.checkDBExistance())
                {
                    console.log("file non esiste..... lo si crea!");
                    fileSystem.writeFileSync(eventsDBPath, "");
                    return [];
                }
                else
                {
                    console.log("file esiste");
                    const fileContent = fileSystem.readFileSync(eventsDBPath, "utf-8");
                    if (fileContent == "")
                    {
                        console.log("file senza contenuto.....restituisco array vuoto");
                        return [];
                    }
                    else
                    {
                        console.log("file con contenuto");
                        let jsonFileData = null;
                        try
                        {
                            jsonFileData = JSON.parse(fileContent);
                            console.log("tento il parsing in formato json....... ", jsonFileData);
                        }
                        catch(error)
                        {
                            console.log("file corrotto..... lo si ricrea!");
                            fileSystem.writeFileSync(eventsDBPath, "");
                            return [];
                        }
                        console.log("Nessun errore nel parsing");
                        if (!Array.isArray(jsonFileData))
                        {
                            console.log("jsonfiledata non è un array.... ");
                            jsonFileData = EventModel.fromObjToArray(jsonFileData);
                            console.log("jsonfiledata  ora è un array.... ", jsonFileData);
                        }
                        return jsonFileData;
                    }
                }
            }; 

    static  getEvent(eventId)
            {
                const allEvents = EventModel.getAllEvents();
                if (allEvents.length == 0)
                    throw new Error("Nessun evento esistente!");
                const eventIndex = allEvents.findIndex( eventChecked => eventChecked.id == eventId);
                if (eventIndex < 0)
                    throw new Error("Evento non presente nel DB!");
                return allEvents[eventIndex];
            };

    static  modifyEvent(eventId, modifiersObj)
            {
                // Si recupera l'intero contenuto del file json e, successivamente l'indice dell'evento da modificare
                let allEvents = EventModel.getAllEvents();
                if (allEvents.length == 0)
                    throw new Error("Nessun evento esistente!");
                const eventIndex = allEvents.findIndex( eventChecked => eventChecked.id == eventId);
                if (eventIndex < 0)
                    throw new Error("Evento non presente nel DB!");    
                // Si recupera l'istanza relativa all'evento da modificare
                const eventInstance = EventModel.eventInstances.find( instance => instance.#id == eventId);        
                if (eventInstance == undefined)  
                    throw new Error("Impossibile recuperare l'istanza relativa all'evento!");
                // Se non si è verificato nessun errore nel recupero dei dati da file e dell'istanza, si procede con la modifica dei dati nell'array
                for (let key in modifiersObj)
                {
                    allEvents[eventIndex][key] = modifiersObj[key];
                }
                // Si tenta il salvataggio del file con i nuovi dati
                try
                {
                    fileSystem.writeFileSync(eventsDBPath, JSON.stringify(allEvents));
                }
                // In caso di problemi con il salvataggio si genera un errore e non si procede alla modifica dei dati nell'istanza
                catch
                {
                    throw new Error("Modifica rigettata e istanza invariata!");
                }
                // Se invece tutto procede regolarmente, allora anche l'istanza viene aggiornata
                for (let key in modifiersObj)
                {
                    eventInstance[key] = modifiersObj[key];
                }
            };

    static  deleteEvent(eventId)
            {
                // Si recupera l'intero contenuto del file json e, successivamente l'indice dell'evento da cancellare
                let allEvents = EventModel.getAllEvents();
                if (allEvents.length == 0)
                    throw new Error("Nessun evento esistente!");
                const eventIndex = allEvents.findIndex( eventChecked => eventChecked.id == eventId);
                if (eventIndex < 0)
                    throw new Error("Evento non presente nel DB!");    
                // Si recupera l'indice dell'istanza relativa all'evento da cancellare
                const eventInstanceIndex = EventModel.eventInstances.findIndex( instance => instance.#id == eventId);        
                if (eventInstanceIndex < 0)  
                    throw new Error("Impossibile recuperare l'istanza relativa all'evento!");
                // Si cancella l'elemento dall'array
                allEvents.splice(eventIndex, 1);
                // Si tenta il salvataggio del file con i nuovi dati
                try
                {
                    fileSystem.writeFileSync(eventsDBPath, JSON.stringify(allEvents));
                }
                // In caso di problemi con il salvataggio si genera un errore e non si procede alla cancellazione dell'istanza
                catch
                {
                    throw new Error("Operazione rigettata e istanza invariata!");
                }
                // Se invece tutto procede regolarmente, allora anche l'istanza viene cancellata
                EventModel.eventInstances.splice(eventInstanceIndex, 1);
            };

    static  eventsInDB()
            {
                return EventModel.getAllEvents().length;
            };

    static  getLastGeneratedId()
            {
                return EventModel.lastGeneratedId;
            };
    
    static  getInstance(instanceIndex)
    {
        return EventModel.eventInstances[instanceIndex];
    }
}

module.exports = EventModel;
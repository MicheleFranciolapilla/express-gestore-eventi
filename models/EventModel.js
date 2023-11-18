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
        if (!EventModel.addEvent(this.#id, this.#title, this.#description, this.#eventDate, this.#maxSeats))
            throw new Error("Evento rigettato!");
        else
        {
            EventModel.lastGeneratedId = this.#id;
            EventModel.eventInstances.push(this);
        }
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

    // Metodi private
    #setUniqueId()
    {
        const allEvents = EventModel.getAllEvents();
        const allIds = allEvents.map( (event) => event.id );
        this.#id = allIds.length != 0 ? Math.max(...allIds) + 1 : 1;
        console.log("ID: ", this.#id);
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

    static  addEvent(_id, _title, _description, _eventDate, _maxSeats)
            {
                const   eventToAdd  =   {
                                            "id"            :   _id,
                                            "title"         :   _title,
                                            ...( _description !== "" && { "description": _description }),
                                            "eventDate"     :   _eventDate,
                                            "maxSeats"      :   _maxSeats
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

    static  modifyEvent(_id, _title, _description, _eventDate, _maxSeats)
            {
            };

    static  eventsInDB()
            {
                return EventModel.getAllEvents().length;
            };

    static  getLastGeneratedId()
            {
                return EventModel.lastGeneratedId;
            };
}

module.exports = EventModel;